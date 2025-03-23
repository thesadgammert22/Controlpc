const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const authMiddleware = require('./auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json()); // Parse JSON bodies

// Authentication route
app.post('/auth', authMiddleware, (req, res) => {
    res.sendStatus(200);
});

// Serve static files
app.use(express.static('public'));

// WebSocket logic
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

server.listen(8080, () => {
    console.log('Server running on port 8080');
});
