import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 5555;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.mjs':  'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.wasm': 'application/wasm',
    '.glb':  'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.mp3':  'audio/mpeg',
    '.ogg':  'audio/ogg',
    '.wav':  'audio/wav',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.ico':  'image/x-icon',
    '.txt':  'text/plain; charset=utf-8',
    '.xml':  'application/xml',
    '.map':  'application/json'
};

const server = createServer(async (req, res) => {
    let url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = join(__dirname, decodeURIComponent(url.pathname));

    try {
        let s = await stat(filePath);

        // Directory: try index.html
        if (s.isDirectory()) {
            // Redirect /foo to /foo/ for consistency
            if (!url.pathname.endsWith('/')) {
                res.writeHead(301, { 'Location': url.pathname + '/' + url.search });
                return res.end();
            }
            filePath = join(filePath, 'index.html');
            s = await stat(filePath);
        }

        const ext = extname(filePath).toLowerCase();
        const contentType = MIME[ext] || 'application/octet-stream';
        const data = await readFile(filePath);

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        });
        res.end(data);
    } catch (e) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serving ${__dirname} on http://0.0.0.0:${PORT}`);
});
