const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { spawn } = require('child_process'); // To run LocalTunnel
const path = require('path');

// Configuration
const PORT = 8080; // Local WebSocket server port
const AUTH_TOKEN = "hardcoded_auth_token_123"; // Authentication token

let localTunnelUrl = ""; // Placeholder for the LocalTunnel URL

// Start LocalTunnel and retrieve the public URL
function startLocalTunnel(port) {
    return new Promise((resolve, reject) => {
        console.log("Starting LocalTunnel...");
        const ltProcess = spawn('lt', ['--port', port]);

        ltProcess.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('https://')) {
                const matches = output.match(/https:\/\/[^\s]+/);
                if (matches) {
                    localTunnelUrl = matches[0];
                    console.log(`LocalTunnel URL: ${localTunnelUrl}`);
                    resolve(localTunnelUrl);
                }
            }
        });

        ltProcess.stderr.on('data', (data) => {
            console.error(`LocalTunnel error: ${data.toString()}`);
        });

        ltProcess.on('exit', (code) => {
            if (code !== 0) {
                reject(`LocalTunnel exited with code ${code}`);
            }
        });
    });
}

// Set up Express for serving HTML and handling API requests
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get the LocalTunnel public URL
app.get('/localtunnel-url', (req, res) => {
    if (!localTunnelUrl) {
        return res.status(500).send("LocalTunnel URL not available yet.");
    }
    res.json({ url: localTunnelUrl });
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    // Verify authentication token
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${AUTH_TOKEN}`) {
        ws.close(4003, 'Unauthorized');
        console.log("Unauthorized connection attempt.");
        return;
    }

    console.log('Client connected.');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'input') {
            console.log(`Received input: ${JSON.stringify(data)}`);
            // Add logic to simulate mouse and keyboard input on the controlled PC
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

// Start server and LocalTunnel
server.listen(PORT, async () => {
    console.log(`WebSocket server running on http://localhost:${PORT}`);
    try {
        await startLocalTunnel(PORT);
    } catch (error) {
        console.error("Failed to start LocalTunnel:", error);
    }
});
