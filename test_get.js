const request = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/portfolio/skills',
  method: 'GET',
};

const req = request.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
