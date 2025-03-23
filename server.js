const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const bodyParser = require("body-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios"); // Axios for HTTP requests

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 10000;
let FLASK_SERVER = null; // Dynamic Flask server URL

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// WebSocket handlers
wss.on("connection", (ws) => {
    console.log("WebSocket connection established");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", (code, reason) => {
        console.log(`WebSocket connection closed: ${code}, Reason: ${reason}`);
    });

    ws.on("error", (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });
});

// Function to fetch the Flask server's Cloudflare Tunnel URL
async function fetchFlaskServerUrl(maxRetries = 10, delay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Fetching Flask server URL (Attempt ${attempt}/${maxRetries})...`);
            const response = await axios.get("http://localhost:8081/tunnel-url", {
                timeout: 5000, // Set a timeout of 5 seconds
            });
            if (response.status === 200 && response.data.url) {
                FLASK_SERVER = response.data.url;
                console.log(`Dynamic FLASK_SERVER URL fetched: ${FLASK_SERVER}`);
                return;
            } else {
                console.log(`Unexpected response from Flask server: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            if (error.response) {
                // Flask server responded with an error
                console.error(
                    `HTTP Error: Status ${error.response.status} - ${error.response.statusText}. Data: ${JSON.stringify(
                        error.response.data
                    )}`
                );
            } else if (error.request) {
                // No response received from Flask server
                console.error(`Request Error: No response received from Flask server.`);
                console.error(`Request Details: ${JSON.stringify(error.request)}`);
            } else {
                // Other errors
                console.error(`Error: ${error.message}`);
            }
            console.log(`Retrying in ${delay / 1000} seconds...`);
        }

        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
    }

    console.error("Max retries reached. Flask server is unavailable.");
    process.exit(1); // Exit if URL cannot be fetched
}

// Initialize the server after fetching the Flask server URL
fetchFlaskServerUrl().then(() => {
    // Proxy /feed requests to the dynamically fetched Flask server URL
    app.use(
    "/feed",
    createProxyMiddleware({
        target: FLASK_SERVER,
        changeOrigin: true,
        logLevel: "debug", // Enable detailed logging for debugging
        onError: (err, req, res) => {
            console.error(`Proxy Error: ${err.message}`);
            res.status(500).send("Proxy encountered an error.");
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxy Request Headers: ${JSON.stringify(proxyReq.getHeaders())}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`Proxy Response Headers: ${JSON.stringify(proxyRes.headers)}`);
        },
    })
);

    // Start the Express server
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
