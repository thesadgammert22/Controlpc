const { RTCPeerConnection, RTCSessionDescription } = require("wrtc");
const axios = require("axios");
const readline = require("readline");

const SIGNALING_SERVER = "http://localhost:8081";
let peerConnection;
let dataChannel;

// Create WebRTC Peer Connection
async function createWebRTCConnection() {
    peerConnection = new RTCPeerConnection();
    dataChannel = peerConnection.createDataChannel("input");

    // Handle connection state
    dataChannel.onopen = () => {
        console.log("WebRTC Data Channel is open!");
        startSendingInputs();
    };

    dataChannel.onclose = () => {
        console.log("WebRTC Data Channel is closed!");
    };

    // Create an SDP offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send offer to Flask signaling server
    const response = await axios.post(`${SIGNALING_SERVER}/offer`, {
        peer_id: "client1",
        sdp: offer.sdp
    });

    const answer = response.data;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("WebRTC connection established!");
}

// Simulate sending mouse inputs
function startSendingInputs() {
    console.log("Start sending inputs. Press 'q' to quit.");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("line", (line) => {
        if (line === "q") {
            closeConnection();
            rl.close();
        } else {
            // Example input: sending mouse coordinates
            const mouseInput = { x: Math.random() * 1000, y: Math.random() * 1000 };
            dataChannel.send(JSON.stringify(mouseInput));
            console.log("Sent input:", mouseInput);
        }
    });
}

// Close the connection
async function closeConnection() {
    console.log("Closing connection...");
    await axios.post(`${SIGNALING_SERVER}/close`, { peer_id: "client1" });
    peerConnection.close();
    process.exit(0);
}

// Start the WebRTC connection
createWebRTCConnection().catch(console.error);
