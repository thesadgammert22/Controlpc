const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const zlib = require('zlib');
const winston = require('winston'); // Logging

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(), // Log to console
    ],
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public')); // Serve static files like HTML pages

wss.on('connection', (ws) => {
    logger.info('New WebSocket connection established');

    ws.on('message', (compressedData) => {
        try {
            const data = zlib.inflateSync(compressedData);
            const parsedData = JSON.parse(data);

            if (parsedData.type === 'frame') {
                // Broadcast compressed frame to all clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(compressedData);
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
            logger.error('Error decompressing data', { error: err });
        }
    });

    ws.on('close', () => logger.info('WebSocket connection closed'));
});

server.listen(8080, () => {
    logger.info('Server running on port 8080');
});
