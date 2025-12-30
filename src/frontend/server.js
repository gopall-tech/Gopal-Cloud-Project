const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8080;
const buildDir = path.join(__dirname, 'build');
const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.join(buildDir, urlPath);
  
  if (!filePath.startsWith(buildDir)) { res.writeHead(403); res.end(); return; }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      fs.readFile(path.join(buildDir, 'index.html'), (err2, data) => {
        if (err2) { res.writeHead(500); res.end('Error'); }
        else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(data); }
      });
    }
  });
}).listen(port);
console.log('Server running on port ' + port);
