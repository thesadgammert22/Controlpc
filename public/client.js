const ws = new WebSocket('ws://controlpc.onrender.com:8080'); // Use ws:// for insecure connection

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'frame') {
        const videoFeed = document.querySelector('#video-feed');
        videoFeed.src = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(data.data)))}`;
    }
};

// Send mouse input
document.addEventListener('mousemove', (event) => {
    ws.send(JSON.stringify({ type: 'input', inputType: 'mouse', x: event.clientX, y: event.clientY }));
});

// Send keyboard input
document.addEventListener('keydown', (event) => {
    ws.send(JSON.stringify({ type: 'input', inputType: 'keyboard', key: event.key }));
});
