const http = require('http');
const { exec } = require('child_process');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS for testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST' && req.url === '/chat') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const data = JSON.parse(body);
            console.log(`[Node.js Gateway] Received prompt: "${data.prompt}"`);

            // Offload heavy matrix/tensor simulation to our Go "Virtual TPU" engine
            exec(`go run tpu_simulator.go "${data.prompt}"`, (error, stdout, stderr) => {
                if (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Go TPU Simulator failed' }));
                    return;
                }

                const simulatedTensorOutput = stdout.trim();
                console.log(`[Go TPU Sim] Output vectors: ${simulatedTensorOutput}`);

                // Send back final coordinated response
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'Success',
                    prompt: data.prompt,
                    tpu_simulation: simulatedTensorOutput,
                    engine: 'Node -> Go -> Python Pipeline'
                }));
            });
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`[Node.js] Gateway running at http://localhost:${PORT}`);
});
