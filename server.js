const http = require('http');
const WebSocket = require('ws');
const express = require('express');

// Create HTTP and WebSocket server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public')); // Serve static files

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Message received:', message);
        ws.send(message); // Echo the message back to the client
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// Start the HTTP server
server.listen(8080, () => {
    console.log('Server running on port 8080');
});
