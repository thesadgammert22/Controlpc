const ws = new WebSocket('wss://controlpc.onrender.com:8080'); // Secure WebSocket endpoint

ws.onopen = () => {
    console.log('Connected securely to WebSocket server');
};

ws.onmessage = (event) => {
    console.log('Message from server:', event.data);
};

// Example: Send a test message to the server
ws.send(JSON.stringify({ type: 'greeting', message: 'Hello, server!' }));
