const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Hardcoded username and password for authentication
const USERNAME = "admin";
const PASSWORD = "12345";

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// WebSocket handlers
wss.on("connection", (ws) => {
    console.log("WebSocket connection established");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", (code, reason) => {
        console.log(`WebSocket connection closed: ${code}, Reason: ${reason}`);
    });

    ws.on("error", (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });
});

// Login route for authentication
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === USERNAME && password === PASSWORD) {
        res.redirect("/broadcast.html"); // Redirect to broadcast page on successful login
    } else {
        res.status(401).send("Invalid username or password"); // Error response for invalid credentials
    }
});

// Properly implement the /feed route
app.get("/feed", (req, res) => {
    // Placeholder response for now, replace with live screen feed implementation later
    res.status(200).send("<h1>Screen feed will be implemented here</h1>");
});

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
