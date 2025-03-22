let peerConnection;

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

async function startConnection() {
    peerConnection = new RTCPeerConnection(config);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            signalingServer.send(JSON.stringify({ candidate: event.candidate }));
        }
    };

    peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;

        dataChannel.onmessage = (event) => {
            const command = JSON.parse(event.data);

            if (command.type === "key_press") {
                console.log(`Key pressed: ${command.key}`);
                // Logic to simulate key press (e.g., update input fields in the browser)
                const activeElement = document.activeElement;
                if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
                    activeElement.value += command.key;
                }
            }

            if (command.type === "key_release") {
                console.log(`Key released: ${command.key}`);
                // Add logic for key release if necessary
            }
        };
    };
}
