// Establish WebSocket connection to the WebSocket server
const socket = new WebSocket("wss://controlpc.onrender.com"); // Your Render-deployed WebSocket server URL

// WebSocket connection handlers
socket.onopen = () => {
    console.log("Connected to WebSocket server");
};

socket.onmessage = (event) => {
    console.log(`Received command: ${event.data}`);
    const message = event.data;

    try {
        // Parse the message and act accordingly
        if (message.startsWith("mouse_move")) {
            // Example: "mouse_move:100,200"
            const [, coords] = message.split(":");
            const [x, y] = coords.split(",").map(Number);
            simulateMouseMove(x, y);
        } else if (message.startsWith("mouse_click")) {
            // Example: "mouse_click:left"
            const [, button] = message.split(":");
            simulateMouseClick(button);
        } else if (message.startsWith("key_press")) {
            // Example: "key_press:A"
            const [, key] = message.split(":");
            simulateKeyPress(key);
        }
    } catch (error) {
        console.error(`Error processing command: ${error.message}`);
    }
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket connection closed");
};

// Simulate mouse movement (logs actions)
function simulateMouseMove(x, y) {
    console.log(`Simulating mouse move to: (${x}, ${y})`);
}

// Simulate mouse clicks (logs actions)
function simulateMouseClick(button) {
    console.log(`Simulating ${button} mouse click`);
}

// Simulate key presses (logs actions)
function simulateKeyPress(key) {
    console.log(`Simulating key press: ${key}`);
}
