const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// WebSocket handlers
wss.on("connection", (ws) => {
    console.log("WebSocket connection established");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});

// Screen feed endpoint implementation
app.get("/feed", (req, res) => {
    res.status(200).send("<h1>Screen feed is not yet functional</h1>");
    // Replace this placeholder with screen streaming code when ready
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
