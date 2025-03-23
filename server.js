const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { spawn } = require('child_process'); // To run ngrok
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 8080;
const AUTH_TOKEN = "hardcoded_auth_token_123"; // Authentication token

let ngrokUrl = ""; // Placeholder for the ngrok URL

// Serve static files (e.g., the iframe interface)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to dynamically retrieve the ngrok URL
app.get('/ngrok-url', (req, res) => {
    if (!ngrokUrl) {
        return res.status(500).send("ngrok URL not available yet.");
    }
    res.json({ url: ngrokUrl });
});

// Start ngrok process
function startNgrok() {
    console.log("Starting ngrok...");
    const ngrokProcess = spawn('ngrok', ['http', PORT]);
    ngrokProcess.stdout.on('data', async (data) => {
        const output = data.toString();
        if (output.includes('url=')) {
            const matches = output.match(/url=(https?:\/\/[^\s]+)/);
            if (matches) {
                ngrokUrl = matches[1];
                console.log(`ngrok URL: ${ngrokUrl}`);
            }
        }
    });
    ngrokProcess.stderr.on('data', (data) => {
        console.error(`ngrok error: ${data.toString()}`);
    });
}

// Start WebSocket handling for mouse/keyboard input
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
            // Forward mouse/keyboard input to the controlled PC (handled elsewhere)
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

// Start the HTTP and WebSocket servers
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startNgrok(); // Start ngrok when the server starts
});
