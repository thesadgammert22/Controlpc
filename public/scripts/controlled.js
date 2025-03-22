// Establish WebSocket connection to the WebSocket server
const socket = new WebSocket("wss://controlpc.onrender.com"); // Replace with your WebSocket server URL

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

// Simulate mouse movement
function simulateMouseMove(x, y) {
    console.log(`Simulating mouse move to: (${x}, ${y})`);
    // Browser limitation: Cannot move the actual system mouse
    // Replace this with system-level execution for controlled systems
}

// Simulate mouse clicks
function simulateMouseClick(button) {
    console.log(`Simulating ${button} mouse click`);
    // Browser limitation: Cannot perform actual system-level mouse clicks
}

// Simulate key presses
function simulateKeyPress(key) {
    console.log(`Simulating key press: ${key}`);
    // Browser limitation: Cannot perform actual system-level key presses
}
