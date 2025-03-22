const socket = new WebSocket("wss://controlpc.onrender.com");

socket.onopen = () => {
    console.log("Connected to WebSocket server");
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket connection closed");
};

function sendMouseMove(x, y) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(`mouse_move:${x},${y}`);
    } else {
        console.error("WebSocket not connected");
    }
}

function sendMouseClick(button) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(`mouse_click:${button}`);
    } else {
        console.error("WebSocket not connected");
    }
}

function sendKeyPress(key) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(`key_press:${key}`);
    } else {
        console.error("WebSocket not connected");
    }
}

document.getElementById("mouseMoveButton").addEventListener("click", () => {
    sendMouseMove(100, 200);
});

document.getElementById("mouseClickButton").addEventListener("click", () => {
    sendMouseClick("left");
});

document.getElementById("keyPressButton").addEventListener("click", () => {
    sendKeyPress("A");
});
