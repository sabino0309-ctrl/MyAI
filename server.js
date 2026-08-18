const http = require('http');
const { exec } = require('child_process');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS for testing and local communication
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 1. Chat Prompt Endpoint
    if (req.method === 'POST' && req.url === '/chat') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log(`[Node.js Gateway] Received chat prompt: "${data.prompt}"`);

            // Offload to Go simulation or Python engine
            exec(`go run tpu_simulator.go "${data.prompt}"`, (error, stdout, stderr) => {
                if (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Go TPU Simulator failed' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'Success',
                    prompt: data.prompt,
                    tpu_simulation: stdout.trim(),
                    engine: 'Node -> Go -> Python Pipeline'
                }));
            });
        });
    } 
    // 2. User Registration Endpoint
    else if (req.method === 'POST' && req.url === '/register') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log(`[Node.js Gateway] Registering user -> Username: ${data.username}, Email: ${data.email}`);

            // Properly escape payload to pass into Python script safely
            const payload = JSON.stringify(data).replace(/"/g, '\\"');

            // Pass registration data to Python parser
            exec(`python3 AI-Core/user_parser.py "${payload}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[Python Error]: ${stderr}`);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Python parser execution failed' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(stdout.trim());
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`[Node.js] Gateway running at http://localhost:${PORT}`);
});
