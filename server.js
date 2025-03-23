const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const express = require('express');

// SSL certificates (replace with your actual paths)
const options = {
    key: fs.readFileSync('/path/to/your/ssl/key.pem'),  // Path to your private key
    cert: fs.readFileSync('/path/to/your/ssl/certificate.pem'),  // Path to your certificate
};

const app = express();
const httpsServer = https.createServer(options, app);
const wss = new WebSocket.Server({ server: httpsServer });

app.use(express.json());
app.use(express.static('public')); // Serve static files like HTML pages

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Message received:', message);
        ws.send(message); // Echo the message back to the client
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// Start the HTTPS server
httpsServer.listen(8080, () => {
    console.log('Secure WebSocket server running on port 8080');
});
