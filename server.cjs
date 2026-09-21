const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
http.createServer((req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname;
  const allowed = { '/': 'index.html', '/index.html': 'index.html', '/style.css': 'style.css', '/data.js': 'data.js', '/game.js': 'game.js', '/app.js': 'app.js' };
  if (!allowed[name]) { res.writeHead(404); res.end('Not found'); return; }
  const file = path.join(__dirname, allowed[name]);
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] }); fs.createReadStream(file).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Quiz running at http://127.0.0.1:4173'));
