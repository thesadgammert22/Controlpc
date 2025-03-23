const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

// Create HTTP and WebSocket server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public')); // Serve static files

wss.on('connection', (ws, req) => {
    logger.info('Client connected');

    // Handle messages from the client
    ws.on('message', (message) => {
        logger.info(`Message received: ${message}`);
        ws.send(message); // Echo the message back to the client
    });

    // Handle client disconnect
    ws.on('close', () => logger.info('Client disconnected'));
});

// Start the HTTP server
server.listen(8080, () => {
    logger.info('WebSocket server running on port 8080');
});
