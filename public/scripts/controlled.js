// Node.js WebSocket Server for the Controlled PC
const WebSocket = require("ws");
const { exec } = require("child_process");

// WebSocket server setup
const server = new WebSocket.Server({ port: 12345 }); // Port for WebSocket communication

server.on("connection", (socket) => {
    console.log("Controller connected");

    // Listen for incoming commands
    socket.on("message", (message) => {
        console.log(`Received command: ${message}`);
        try {
            if (message.startsWith("mouse_move")) {
                // Example: "mouse_move:100,200"
                const [, coords] = message.split(":");
                const [x, y] = coords.split(",").map(Number);
                moveMouse(x, y);
            } else if (message.startsWith("mouse_click")) {
                // Example: "mouse_click:left"
                const [, button] = message.split(":");
                mouseClick(button);
            } else if (message.startsWith("key_press")) {
                // Example: "key_press:A"
                const [, key] = message.split(":");
                keyPress(key);
            }
        } catch (error) {
            console.error(`Error processing command: ${error.message}`);
        }
    });

    socket.on("close", () => {
        console.log("Controller disconnected");
    });
});

// Function to simulate mouse movement (Windows only)
function moveMouse(x, y) {
    const command = `nircmd.exe setcursor ${x} ${y}`; // Use NirCmd for mouse control
    exec(command, (error) => {
        if (error) {
            console.error(`Error moving mouse: ${error.message}`);
        } else {
            console.log(`Mouse moved to: (${x}, ${y})`);
        }
    });
}

// Function to simulate mouse click (Windows only)
function mouseClick(button) {
    const clickType = button === "left" ? "left click" : "right click";
    const command = `nircmd.exe sendmouse ${clickType}`;
    exec(command, (error) => {
        if (error) {
            console.error(`Error clicking mouse: ${error.message}`);
        } else {
            console.log(`Mouse ${button} clicked`);
        }
    });
}

// Function to simulate key press (Windows only)
function keyPress(key) {
    const command = `nircmd.exe sendkeypress ${key}`;
    exec(command, (error) => {
        if (error) {
            console.error(`Error pressing key: ${error.message}`);
        } else {
            console.log(`Key pressed: ${key}`);
        }
    });
}
