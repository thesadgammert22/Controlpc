const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Create HTTP and WebSocket server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (e.g., index.html) from the "public" folder
app.use(express.json());
app.use(express.static('public'));

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (message) => {
        console.log('Message received:', message);
        ws.send(message); // Echo the message back to the client
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(8080, () => {
    console.log('WebSocket server running on port 8080');
});
