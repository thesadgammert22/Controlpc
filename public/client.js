const ws = new WebSocket('ws://controlpc.onrender.com:8080');

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    console.log('Received:', event.data);
};

document.addEventListener('mousemove', (event) => {
    ws.send(JSON.stringify({ type: 'mouse', x: event.clientX, y: event.clientY }));
});

document.addEventListener('keydown', (event) => {
    ws.send(JSON.stringify({ type: 'keyboard', key: event.key }));
});
