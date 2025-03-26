const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

// Variable to store the current Tunnel URL
let currentTunnelUrl = '';

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`[INFO] Received ${req.method} request for ${req.url}`);
    next();
});

// Endpoint to handle Tunnel URL updates
app.post('/api/update-tunnel', (req, res) => {
    console.log("[INFO] POST request received at /api/update-tunnel");
    console.log(`[DEBUG] Request body: ${JSON.stringify(req.body)}`);
    const { tunnel_url } = req.body;

    if (!tunnel_url) {
        console.error("[ERROR] Tunnel URL not provided.");
        return res.status(400).json({ error: "Tunnel URL is required." });
    }

    currentTunnelUrl = tunnel_url.trim();
    console.log(`[INFO] Tunnel URL updated: ${currentTunnelUrl}`);
    res.status(200).json({ message: "Tunnel URL updated successfully." });
});

// Endpoint to serve the broadcasting page
app.get('/', (req, res) => {
    console.log('[INFO] Serving broadcasting page.');
    if (!currentTunnelUrl) {
        return res.send('<h1>No active tunnel URL available</h1>');
    }

    const pageContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Broadcasting Page</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin: 50px;
            }
            iframe {
                width: 80%;
                height: 500px;
                border: 1px solid #333;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Remote Control Interface</h1>
        <p>Access the controlled PC below:</p>
        <iframe src="${currentTunnelUrl}" id="remoteTunnel"></iframe>
    </body>
    </html>
    `;
    res.send(pageContent);
});

// Fallback route handler
app.use((req, res) => {
    console.error(`[ERROR] Route not found: ${req.url}`);
    res.status(404).send('Not Found');
});

// Start the server with error handling
const PORT = process.env.PORT || 4000;
try {
    app.listen(PORT, () => {
        console.log(`[INFO] Server running on port ${PORT}`);
    });
} catch (err) {
    console.error(`[ERROR] Failed to start server: ${err.message}`);
}
