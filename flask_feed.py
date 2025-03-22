from flask import Flask, Response
import cv2
import numpy as np
import pyautogui

app = Flask(__name__)

# Function to capture the screen and encode it as a MJPEG stream
def capture_screen():
    while True:
        # Capture the screen
        screenshot = pyautogui.screenshot()
        # Convert the screenshot to a numpy array
        frame = np.array(screenshot)
        # Convert colors from RGB to BGR (OpenCV format)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        # Encode the frame as JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        # Yield the frame as part of a multipart MJPEG stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

# Flask route to serve the live screen feed
@app.route('/feed')
def video_feed():
    return Response(capture_screen(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8081, threaded=True)
