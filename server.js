const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

let currentTunnelUrl = ""; // Store the tunnel URL

// Endpoint to receive and update the Tunnel URL
app.post("/api/update-tunnel", (req, res) => {
    const { tunnel_url } = req.body;

    if (!tunnel_url) {
        return res.status(400).json({ error: "Tunnel URL is required." });
    }

    currentTunnelUrl = tunnel_url.trim();
    console.log(`[INFO] Tunnel URL updated: ${currentTunnelUrl}`);
    res.status(200).json({ message: "Tunnel URL updated successfully." });
});

// Serve the broadcasting page with the tunnel URL embedded
app.get("/", (req, res) => {
    if (!currentTunnelUrl) {
        return res.send("<h1>No active tunnel URL available</h1>");
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
        <h1>Remote Screen Sharing</h1>
        <p>Access the screen below:</p>
        <iframe src="${currentTunnelUrl}" frameborder="0"></iframe>
    </body>
    </html>
    `;
    res.send(pageContent);
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[INFO] Server running on port ${PORT}`);
});
