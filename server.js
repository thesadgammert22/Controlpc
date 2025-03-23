const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const express = require('express');
const winston = require('winston');

// SSL certificates (replace with your own files)
const options = {
    key: fs.readFileSync('/path/to/your/ssl/key.pem'),  // Path to your private key
    cert: fs.readFileSync('/path/to/your/ssl/certificate.pem'),  // Path to your certificate
};

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

const app = express();
const httpsServer = https.createServer(options, app);
const wss = new WebSocket.Server({ server: httpsServer });

app.use(express.json());
app.use(express.static('public')); // Serve static files

wss.on('connection', (ws) => {
    logger.info('Client connected');

    ws.on('message', (message) => {
        logger.info(`Message received: ${message}`);
        // Echo the message back to the client
        ws.send(message);
    });

    ws.on('close', () => logger.info('Client disconnected'));
});

// Start the HTTPS server
httpsServer.listen(8080, () => {
    logger.info('Secure WebSocket server running on port 8080');
});
