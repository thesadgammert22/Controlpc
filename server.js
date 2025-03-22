const WebSocket = require("ws");
const express = require("express");
const path = require("path");

const app = express();
const server = app.listen(3000, () => console.log("Server running on port 3000"));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));


// WebSocket signaling logic
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("A client connected");

    ws.on("message", (message) => {
        // Relay messages between clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => {
        console.log("A client disconnected");
    });
});
