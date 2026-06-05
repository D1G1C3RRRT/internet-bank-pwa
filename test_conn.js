const net = require('net');

console.log('Attempting to connect to 194.182.87.6:600...');
const socket = net.createConnection({
  host: '194.182.87.6',
  port: 600,
  timeout: 5000
});

socket.on('connect', () => {
  console.log('Successfully connected!');
  socket.end();
});

socket.on('timeout', () => {
  console.log('Connection timeout.');
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('Connection error:', err.message);
});
