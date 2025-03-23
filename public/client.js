const ws = new WebSocket('ws://controlpc.onrender.com:8080'); // Connect to server
const zlib = require('zlib'); // Compression library

ws.onopen = () => console.log('Connected to server');

// Decompress frames and display them in an iframe
ws.onmessage = (compressedData) => {
    try {
        const data = zlib.inflateSync(new Uint8Array(compressedData.data)); // Decompress data
        const parsedData = JSON.parse(data);

        if (parsedData.type === 'frame') {
            const videoFeed = document.querySelector('#video-feed');
            videoFeed.src = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(parsedData.data)))}`;
        }
    } catch (err) {
        console.error('Error decompressing data:', err);
    }
};

// Capture and send mouse input
document.addEventListener('mousemove', (event) => {
    const inputData = JSON.stringify({ type: 'input', inputType: 'mouse', x: event.clientX, y: event.clientY });
    const compressedInput = zlib.deflateSync(inputData);
    ws.send(compressedInput);
});

// Capture and send keyboard input
document.addEventListener('keydown', (event) => {
    const inputData = JSON.stringify({ type: 'input', inputType: 'keyboard', key: event.key });
    const compressedInput = zlib.deflateSync(inputData);
    ws.send(compressedInput);
});
