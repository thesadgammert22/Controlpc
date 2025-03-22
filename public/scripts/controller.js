// Establish connection to the WebSocket server
const socket = new WebSocket("wss://controlpc.onrender.com); // Replace with your WebSocket server URL

// WebSocket connection handlers
socket.onopen = () => {
    console.log("Connected to WebSocket server");
};
socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};
socket.onclose = () => {
    console.log("WebSocket connection closed");
};

// Function to send mouse move commands
function sendMouseMove(x, y) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(`mouse_move:${x},${y}`);
    } else {
        console.error("WebSocket not connected");
    }
}

// Function to send mouse click commands
function sendMouseClick(button) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(`mouse_click:${button}`);
    } else {
        console.error("WebSocket not connected");
    }
}

// Function to send key press commands
function sendKeyPress(key) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(`key_press:${key}`);
    } else {
        console.error("WebSocket not connected");
    }
}

// Example of connecting these functions to HTML buttons
document.getElementById("mouseMoveButton").addEventListener("click", () => {
    sendMouseMove(100, 200); // Example: Move mouse to position (100, 200)
});

document.getElementById("mouseClickButton").addEventListener("click", () => {
    sendMouseClick("left"); // Example: Left mouse click
});

document.getElementById("keyPressButton").addEventListener("click", () => {
    sendKeyPress("A"); // Example: Press "A" on the keyboard
});
