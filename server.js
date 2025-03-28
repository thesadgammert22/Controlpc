const express = require("express");
const https = require("https");
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

let currentPublicIP = ""; // Store the public IP
let currentTunnelUrl = ""; // Store the tunnel URL

// List of alternative APIs to fetch the public IP address
const ipApis = [
    { hostname: "api.ipify.org", path: "/?format=json" },
    { hostname: "httpbin.org", path: "/ip" },
    { hostname: "ifconfig.me", path: "/" }
];

// Function to fetch public IP using multiple APIs
function getPublicIP(callback, retries = 3) {
    const tryApi = (index) => {
        if (index >= ipApis.length) {
            callback("Unavailable"); // All APIs failed
            return;
        }

        const options = {
            hostname: ipApis[index].hostname,
            path: ipApis[index].path,
            method: "GET",
        };

        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                try {
                    let publicIp;
                    if (ipApis[index].hostname === "httpbin.org") {
                        publicIp = JSON.parse(data).origin; // For httpbin.org
                    } else {
                        publicIp = JSON.parse(data).ip; // For ipify.org and similar
                    }
                    callback(publicIp); // Return the public IP
                } catch (error) {
                    console.error(`[ERROR] Failed to parse response from ${ipApis[index].hostname}:`, error);
                    tryApi(index + 1); // Try next API
                }
            });
        });

        req.on("error", (error) => {
            console.error(`[ERROR] Failed to fetch IP from ${ipApis[index].hostname}:`, error);
            tryApi(index + 1); // Try next API
        });

        req.end();
    };

    tryApi(0); // Start with the first API
}

// Endpoint to receive and update the Public IP
app.post("/api/update-ip", (req, res) => {
    const { public_ip } = req.body;

    if (!public_ip) {
        return res.status(400).json({ error: "Public IP is required." });
    }

    currentPublicIP = public_ip.trim();
    console.log(`[INFO] Public IP updated: ${currentPublicIP}`);
    res.status(200).json({ message: "Public IP updated successfully." });
});

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

// Serve the broadcasting page with the Tunnel URL and Public IP
app.get("/", (req, res) => {
    getPublicIP((publicIP) => {
        const tunnelMessage = currentTunnelUrl
            ? `<iframe src="${currentTunnelUrl}" frameborder="0"></iframe>`
            : "<h2>No active tunnel URL available</h2>";

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
                .ip-display {
                    margin-top: 20px;
                    font-size: 1.5em;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <h1>Remote Screen Sharing</h1>
            ${tunnelMessage}
            <div class="ip-display">
                My Public IP Address is:<br>
                <strong>${currentPublicIP || publicIP}</strong>
            </div>
        </body>
        </html>
        `;
        res.send(pageContent);
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[INFO] Server running on port ${PORT}`);
});
