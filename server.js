const express = require("express");
const { WebSocketServer } = require("ws");

const HTTP_PORT = 8080; // HTTP server port
const WS_PORT = 8765; // WebSocket server port

const app = express(); // Express app for the HTTP server

// Start the HTTP server
app.get("/", (req, res) => res.send("WebSocket server is running!"));
app.listen(HTTP_PORT, () => {
    console.log(`HTTP server is running on http://localhost:${HTTP_PORT}`);
});

// Create the WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("Client connected!");

    // Handle incoming messages from clients
    ws.on("message", (message) => {
        console.log("Received:", message);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle connection close
    ws.on("close", () => {
        console.log("Client disconnected!");
    });
});
