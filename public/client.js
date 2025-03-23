const ws = new WebSocket('ws://controlpc.onrender.com:8080'); // Use ws:// for non-secure connections

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    console.log('Message from server:', event.data);
};

// Example: Send a message to the server
ws.send(JSON.stringify({ type: 'greeting', message: 'Hello, server!' }));
