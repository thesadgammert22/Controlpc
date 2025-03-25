import asyncio
import json
import mss
import websockets
import logging
import requests
import subprocess
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Configuration
LOCAL_SERVER_PORT = 8080
BROADCAST_PAGE_PORT = 4000  # Port for the broadcast page
AUTH_TOKEN = "hardcoded_auth_token_123"
TUNNEL_COMMAND = ["lt", "--port", str(LOCAL_SERVER_PORT)]
RENDER_WEB_SERVICE = "https://controlpc.onrender.com:4000"  # Change to 4000

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("server.log"),
              logging.StreamHandler()])


# Start LocalTunnel and retrieve the public URL
def start_localtunnel():
    logging.info("Starting LocalTunnel...")
    try:
        process = subprocess.Popen(TUNNEL_COMMAND,
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE,
                                   text=True)

        # Wait for tunnel URL from stdout
        for line in process.stdout:
            logging.info(f"Tunnel Output: {line.strip()}")
            if "your url is:" in line:  # Extract the public URL
                tunnel_url = line.split("your url is:")[1].strip()
                logging.info(f"Tunnel URL retrieved: {tunnel_url}")
                return tunnel_url
    except Exception as e:
        logging.error(f"Failed to start LocalTunnel: {e}")
        return None


# Send the tunnel URL to Render web service
def send_tunnel_url_to_render(tunnel_url):
    try:
        response = requests.post(f"{RENDER_WEB_SERVICE}/api/update-tunnel",
                                 json={"tunnel_url": tunnel_url},
                                 headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            logging.info(
                f"Successfully sent tunnel URL to Render: {response.json()}")
        else:
            logging.error(
                f"Failed to send tunnel URL. Status code: {response.status_code}, Response: {response.text}"
            )
    except Exception as e:
        logging.error(f"Error while sending tunnel URL to Render: {e}")


# Serve the broadcasting page
class BroadcastPageHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()

            # Build and serve the broadcasting page with dynamic iframe
            tunnel_url = start_localtunnel()
            page_content = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Broadcasting Page</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        text-align: center;
                        margin: 50px;
                    }}
                    iframe {{
                        width: 80%;
                        height: 500px;
                        border: 1px solid #333;
                        margin-top: 20px;
                    }}
                </style>
            </head>
            <body>
                <h1>Remote Control Interface</h1>
                <p>Access your controlled PC below:</p>
                <iframe src="{tunnel_url}" id="remoteTunnel"></iframe>
            </body>
            </html>
            """
            self.wfile.write(page_content.encode("utf-8"))
        else:
            super().do_GET()


# Start the broadcasting page server


def start_broadcast_page_server():
    try:
        server_address = ("", BROADCAST_PAGE_PORT)  # Update the port if needed
        httpd = HTTPServer(server_address, BroadcastPageHandler)
        logging.info(
            f"Broadcasting page server running on http://localhost:{BROADCAST_PAGE_PORT}"
        )
        httpd.serve_forever()
    except OSError as e:
        logging.error(f"Failed to start the broadcasting page server: {e}")


# Main entry point
async def main():
    try:
        # Start broadcasting page server in a separate thread
        import threading
        threading.Thread(target=start_broadcast_page_server,
                         daemon=True).start()

        # Placeholder for additional functionality (e.g., WebSocket server)
        await asyncio.Future()  # Keep the script running indefinitely
    except Exception as e:
        logging.error(f"Error in main function: {e}")

    # Placeholder: Add WebSocket server logic or additional functionality here
    await asyncio.Future()  # Keep the script running indefinitely


if __name__ == "__main__":
    asyncio.run(main())
