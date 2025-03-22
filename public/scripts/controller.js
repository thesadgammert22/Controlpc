let peerConnection, dataChannel;

const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const signalingServer = new WebSocket("wss://controlpc.onrender.com"); // Replace with Render server's URL

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

    // Create a data channel for real-time control
    dataChannel = peerConnection.createDataChannel("controlChannel");
    dataChannel.onopen = () => console.log("Data channel open!");
    dataChannel.onclose = () => console.log("Data channel closed!");

    // Capture keyboard events
    document.addEventListener("keydown", (event) => {
        if (dataChannel.readyState === "open") {
            const keyData = { type: "key_press", key: event.key };
            dataChannel.send(JSON.stringify(keyData));
        }
    });

    document.addEventListener("keyup", (event) => {
        if (dataChannel.readyState === "open") {
            const keyData = { type: "key_release", key: event.key };
            dataChannel.send(JSON.stringify(keyData));
        }
    });
}
