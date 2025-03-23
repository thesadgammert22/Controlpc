const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const bodyParser = require("body-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios"); // Axios for dynamic URL fetching

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

// Function to fetch the dynamic Flask server URL
async function fetchFlaskServerUrl() {
    try {
        console.log("Fetching Flask server URL...");
        const response = await axios.get("http://localhost:8081/tunnel-url"); // Adjust if Flask runs elsewhere
        if (response.status === 200 && response.data.url) {
            FLASK_SERVER = response.data.url; // Set the dynamic URL
            console.log(`Dynamic FLASK_SERVER URL fetched: ${FLASK_SERVER}`);
        } else {
            throw new Error("Failed to fetch Flask server URL from /tunnel-url.");
        }
    } catch (error) {
        console.error("Error fetching Flask server URL:", error.message);
        process.exit(1); // Exit the process if fetching the URL fails
    }
}

// Wait for the Flask server URL to be fetched before starting the server
fetchFlaskServerUrl().then(() => {
    // Proxy /feed requests to the dynamically fetched Flask server
    app.use(
        "/feed",
        createProxyMiddleware({
            target: FLASK_SERVER,
            changeOrigin: true,
            logLevel: "debug",
        })
    );

    // Start the server
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
