const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const authMiddleware = require('./auth'); // For authentication

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files like HTML pages

// Authentication route
app.post('/auth', authMiddleware, (req, res) => {
    res.sendStatus(200);
});

// WebSocket handling
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Forward data to all other clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });
});

server.listen(8080, () => {
    console.log('Server running on port 8080');
});
