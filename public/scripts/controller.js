let peerConnection, dataChannel;

const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const signalingServer = new WebSocket("wss://your-render-server-url"); // Replace with Render server's URL

signalingServer.onmessage = async (message) => {
    const data = JSON.parse(message.data);
    if (data.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingServer.send(JSON.stringify({ answer }));
    } else if (data.answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

function startConnection() {
    peerConnection = new RTCPeerConnection(config);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            signalingServer.send(JSON.stringify({ candidate: event.candidate }));
        }
    };

    // Create a data channel for inputs
    dataChannel = peerConnection.createDataChannel("controlChannel");
    dataChannel.onopen = () => console.log("Data channel open!");
    dataChannel.onclose = () => console.log("Data channel closed!");
}

// Send mouse movement
function sendMouseMove(x, y) {
    if (dataChannel.readyState === "open") {
        dataChannel.send(JSON.stringify({ type: "mouse_move", x, y }));
    }
}

// Send key press
function sendKeyPress(key) {
    if (dataChannel.readyState === "open") {
        dataChannel.send(JSON.stringify({ type: "key_press", key }));
    }
}
