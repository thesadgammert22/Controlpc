const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse incoming JSON requests

// Variable to store the current Tunnel URL
let currentTunnelUrl = '';

// Endpoint to handle the Tunnel URL update
app.post('/api/update-tunnel', (req, res) => {
    const { tunnel_url } = req.body; // Extract the tunnel_url from the request body

    if (!tunnel_url) {
        console.error('Error: Tunnel URL not provided.');
        return res.status(400).json({ error: 'Tunnel URL is required.' }); // Respond with a 400 error if no tunnel URL is provided
    }

    currentTunnelUrl = tunnel_url.trim(); // Save the URL and clean up any whitespace
    console.log(`Received Tunnel URL: ${currentTunnelUrl}`); // Log the received URL to the console

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

// Start the server
const PORT = process.env.PORT || 4000; // Use Render's assigned port or default to 4000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
