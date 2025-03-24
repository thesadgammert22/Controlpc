import asyncio
import json
import mss
import websockets
import pyautogui
import subprocess  # For running LocalTunnel
from pynput.mouse import Controller as MouseController, Controller as KeyboardController

# Mouse and keyboard controllers
mouse = MouseController()
keyboard = KeyboardController()

# Local server configuration
LOCAL_SERVER_PORT = 8080
AUTH_TOKEN = "hardcoded_auth_token_123"  # Replace with your token

# Start LocalTunnel and get the public URL
async def start_localtunnel(port):
    try:
        print("Starting LocalTunnel...")
        process = await asyncio.create_subprocess_exec(
            "lt", "--port", str(port), "--print-requests",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await asyncio.sleep(2)  # Wait for LocalTunnel to initialize

        # Capture and parse the public URL from LocalTunnel's output
        public_url = None
        while True:
            line = await process.stdout.readline()
            if line:
                decoded_line = line.decode().strip()
                if decoded_line.startswith("your url is:"):
                    public_url = decoded_line.split(": ")[1]
                    break
            else:
                break
        return public_url, process
    except Exception as e:
        print(f"Error starting LocalTunnel: {e}")
        return None, None

# Handle WebSocket client connections
async def handle_connection(websocket, path):
    try:
        # Authenticate the client
        auth_header = websocket.request_headers.get("Authorization")
        if auth_header != f"Bearer {AUTH_TOKEN}":
            await websocket.close(code=4003, reason="Invalid Authorization Token")
            print("Client disconnected: Invalid Authorization")
            return

        print("Client connected")
        async for message in websocket:
            data = json.loads(message)
            if data.get("type") == "input":
                # Handle mouse and keyboard inputs
                if data.get("inputType") == "mouse":
                    mouse.position = (data["x"], data["y"])
                elif data.get("inputType") == "keyboard":
                    key = data["key"]
                    keyboard.press(key)
                    keyboard.release(key)
    except websockets.ConnectionClosed as e:
        print(f"Connection closed: {e.code} - {e.reason}")

# Capture the screen and send frames to connected clients
async def capture_screen(websocket):
    with mss.mss() as sct:
        monitor = sct.monitors[1]  # Capture the primary monitor
        while True:
            # Capture the screen
            screenshot = sct.grab(monitor)
            # Compress the screenshot and send it as a frame
            frame_data = mss.tools.to_png(screenshot.rgb, screenshot.size)
            await websocket.send(json.dumps({"type": "frame", "data": frame_data.hex()}))
            await asyncio.sleep(0.05)  # ~20 FPS

# Run the WebSocket server
async def run_server(port):
    async with websockets.serve(handle_connection, "0.0.0.0", port):
        print(f"WebSocket server running on ws://0.0.0.0:{port}")
        await asyncio.Future()  # Run forever

# Main entry point
async def main():
    print(f"Starting WebSocket server on port {LOCAL_SERVER_PORT}...")
    # Start LocalTunnel and retrieve the public URL
    public_url, lt_process = await start_localtunnel(LOCAL_SERVER_PORT)
    if not public_url:
        print("Failed to start LocalTunnel. Exiting...")
        return

    print(f"Public URL: {public_url}")
    print(f"Embed this URL in your iframe: {public_url}")

    # Run the WebSocket server
    server_task = asyncio.create_task(run_server(LOCAL_SERVER_PORT))
    await server_task  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
