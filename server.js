const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Hardcoded username and password
const USERNAME = "admin";
const PASSWORD = "12345";

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// WebSocket handlers
wss.on("connection", (ws) => {
    console.log("WebSocket connection established");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});

// Login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === USERNAME && password === PASSWORD) {
        res.redirect("/broadcast.html"); // Redirect to the remote control page
    } else {
        res.status(401).send("Invalid username or password"); // Send error for invalid credentials
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
