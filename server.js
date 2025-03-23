const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const zlib = require('zlib');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files like HTML pages

wss.on('connection', (ws) => {
    ws.on('message', (compressedData) => {
        // Decompress received data
        try {
            const data = zlib.inflateSync(compressedData);
            const parsedData = JSON.parse(data);

            if (parsedData.type === 'frame') {
                // Broadcast frame to all clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(compressedData); // Broadcast compressed frame
                    }
                });
            } else if (parsedData.type === 'input') {
                // Broadcast input to all controlled PCs
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                });
            }
        } catch (err) {
            console.error('Error decompressing data:', err);
        }
    });
});

server.listen(8080, () => {
    console.log('Server running on port 8080');
});
