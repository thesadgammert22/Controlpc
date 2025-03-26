const express = require('express');
const app = express();

app.use(express.json()); // To parse incoming JSON requests

let currentTunnelUrl = ''; // Store the current tunnel URL (IP) of the controlled PC

// API endpoint to receive the tunnel URL
app.post('/api/update-tunnel', (req, res) => {
    const { tunnel_url } = req.body;

    if (!tunnel_url) {
        console.error('Tunnel URL not provided in the request.');
        return res.status(400).json({ error: 'Tunnel URL is required.' });
    }

    currentTunnelUrl = tunnel_url.trim(); // Clean the input
    console.log(`Received Tunnel URL: ${currentTunnelUrl}`);
    res.status(200).json({ message: 'Tunnel URL updated successfully.' });
});


// Root endpoint to serve the broadcasting page
app.get('/', (req, res) => {
    if (!currentTunnelUrl) {
        return res.send('<h1>No active tunnel URL available</h1>');
    }

    // Dynamically generate the HTML with the received tunnel URL
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

// Start the server
const PORT = process.env.PORT || 4000; // Use the Render-assigned port, or default to 4000 for local testing
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
