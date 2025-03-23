const WebSocket = require('ws');
const jpeg = require('jpeg-js');

const ws = new WebSocket('ws://controlpc.onrender.com:8080'); // Connect to the server

ws.onopen = () => {
    console.log('Connected to server');
};

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const video = document.createElement('video');

navigator.mediaDevices.getDisplayMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        video.play();

        setInterval(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const frame = context.getImageData(0, 0, canvas.width, canvas.height);
            const jpegFrame = jpeg.encode(frame, 50); // Compress to JPEG

            ws.send(JSON.stringify({ type: 'frame', data: jpegFrame.data }));
        }, 100); // Send frames every 100ms (~10 FPS)
    })
    .catch((err) => {
        console.error('Error capturing screen:', err);
    });
