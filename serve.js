const express = require('express');
const fs = require('fs');
const app = express();
const https = require('https');
const http = require('http');

app.use('/static', express.static('build/static'));

app.get('*', (req, res) => {
  console.log('hi');
  res.sendFile('index.html', {'root': 'build'});
});

app.use(express.static('static'));

const port = +process.argv[2] || 3001;

if (port === 443) {

  console.log('ssl');

  const privateKey = fs.readFileSync('/etc/letsencrypt/live/www.speaknow.me/privkey.pem');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/www.speaknow.me/cert.pem');

  https.createServer({
      key: privateKey,
      cert: certificate
  }, app).listen(port, () => {
    console.log('Speaknow listening on port ' + port + '!');
  });

  // Redirect from http port 80 to https
  http.createServer((req, res) => {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
  }).listen(80);
} else {
  http.createServer(app).listen(port, () => {
    console.log('Speaknow listening on port ' + port + '!');
  });
}

