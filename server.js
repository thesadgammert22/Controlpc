const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

// Variable to store the current Tunnel URL
let currentTunnelUrl = '';

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`[INFO] Received ${req.method} request for ${req.url}`);
    next(); // Proceed to the route handler
});

// Endpoint to handle the Tunnel URL update
app.post('/api/update-tunnel', (req, res) => {
    console.log(`[DEBUG] Request body: ${JSON.stringify(req.body)}`); // Log request body
    const { tunnel_url } = req.body;

    if (!tunnel_url) {
        console.error('[ERROR] Tunnel URL not provided.');
        return res.status(400).json({ error: 'Tunnel URL is required.' }); // Respond with error if no tunnel_url is provided
    }

    currentTunnelUrl = tunnel_url.trim(); // Store the Tunnel URL
    console.log(`[INFO] Received Tunnel URL: ${currentTunnelUrl}`); // Log the received Tunnel URL

    res.status(200).json({ message: 'Tunnel URL updated successfully.' }); // Respond with success
});

// Endpoint to serve the broadcasting page
app.get('/', (req, res) => {
    if (!currentTunnelUrl) {
        // If no tunnel URL is available, display a friendly error message
        return res.send('<h1>No active tunnel URL available</h1>');
    }

    // Generate and serve the broadcasting page with the embedded tunnel URL
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
    res.send(pageContent); // Send the generated HTML content
});

// Error handling for undefined routes
app.use((req, res) => {
    console.error(`[ERROR] Route not found: ${req.url}`);
    res.status(404).send('Not Found');
});

// Start the server
const PORT = process.env.PORT || 4000;
try {
    app.listen(PORT, () => {
        console.log(`[INFO] Server running on port ${PORT}`);
    });
} catch (err) {
    console.error(`[ERROR] Failed to start server: ${err.message}`);
}
