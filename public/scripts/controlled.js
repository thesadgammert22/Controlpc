const socket = new WebSocket("wss://controlpc.onrender.com"); // Replace with your Render WebSocket server URL

socket.onopen = () => {
    console.log("Connected to WebSocket server");
};

socket.onmessage = (event) => {
    const message = event.data;
    console.log(`Received command: ${message}`);
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket connection closed");
};
