
const localtunnel = require('localtunnel');
const fs = require('fs');

const PORT = 8080;
const URL_FILE = './tunnel_url.txt';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function createTunnel(retryCount = 0) {
    try {
        console.log("Starting LocalTunnel...");
        const tunnel = await localtunnel(PORT, {
            headers: {
                'bypass-tunnel-reminder': '1'
            }
        });

        if (!tunnel.url) {
            throw new Error('Tunnel URL is undefined');
        }

        console.log(`LocalTunnel is running at: ${tunnel.url}`);
        fs.writeFileSync(URL_FILE, tunnel.url);
        console.log(`Tunnel URL saved to ${URL_FILE}`);

        tunnel.on('close', () => {
            console.log("LocalTunnel has been closed.");
        });

        tunnel.on('error', async (err) => {
            console.error('Tunnel error:', err);
            await retryTunnel();
        });

    } catch (error) {
        console.error("Error starting LocalTunnel:", error);
        await retryTunnel(retryCount);
    }
}

async function retryTunnel(retryCount) {
    if (retryCount < MAX_RETRIES) {
        console.log(`Retrying tunnel connection in ${RETRY_DELAY/1000} seconds...`);
        setTimeout(() => createTunnel(retryCount + 1), RETRY_DELAY);
    } else {
        console.error(`Failed to establish tunnel after ${MAX_RETRIES} attempts`);
    }
}

createTunnel();
