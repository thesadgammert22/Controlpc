const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const localtunnel = require('localtunnel'); // LocalTunnel module
const winston = require('winston'); // Logging library
const path = require('path');

// Configuration
const PORT = 8080; // Local server port
const AUTH_TOKEN = "hardcoded_auth_token_123"; // Authentication token
let localTunnelUrl = ""; // Placeholder for LocalTunnel URL

// Create logger with winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' })
    ]
});

// Function to start LocalTunnel
async function startLocalTunnel(port) {
    try {
        logger.info("Starting LocalTunnel...");
        const tunnel = await localtunnel({ port });
        localTunnelUrl = tunnel.url;
        logger.info(`LocalTunnel URL: ${localTunnelUrl}`);
        tunnel.on('close', () => {
            logger.warn("LocalTunnel connection closed.");
        });
        return tunnel;
    } catch (error) {
        logger.error("Failed to start LocalTunnel:", error);
        throw error;
    }
}

// Set up Express for serving static files and API endpoints
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static HTML files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get the LocalTunnel URL
app.get('/localtunnel-url', (req, res) => {
    if (!localTunnelUrl) {
        logger.error("LocalTunnel URL is not available yet.");
        return res.status(500).send("LocalTunnel URL not available yet.");
    }
    res.json({ url: localTunnelUrl });
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${AUTH_TOKEN}`) {
        ws.close(4003, 'Unauthorized');
        logger.warn("Unauthorized WebSocket connection attempt.");
        return;
    }

    logger.info('WebSocket client connected.');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'input') {
                logger.info(`Received input: ${JSON.stringify(data)}`);
                // Handle mouse and keyboard input here
            }
        } catch (error) {
            logger.error("Failed to process WebSocket message:", error);
        }
    });

    ws.on('close', () => {
        logger.info('WebSocket client disconnected.');
    });
});

// Start the server and LocalTunnel
server.listen(PORT, async () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    try {
        await startLocalTunnel(PORT); // Start LocalTunnel when the server starts
    } catch (error) {
        logger.error("Failed to initialize LocalTunnel:", error);
    }
});
