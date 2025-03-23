const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const authMiddleware = require('./auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json()); // To parse JSON bodies
app.use(express.static('public')); // Serve static files like HTML and JS

// Authentication route
app.post('/auth', authMiddleware, (req, res) => {
    res.sendStatus(200);
});

// WebSocket logic
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'frame') {
            // Forward video frame to all clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } else if (data.type === 'input') {
            // Forward input data (mouse/keyboard) to the controlled PC
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    });
});

server.listen(8080, () => {
    console.log('Server running on port 8080');
});
