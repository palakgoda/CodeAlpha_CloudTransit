const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start listening
server.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`  Cloud Bus Pass System Backend Initialized  `);
  console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Port        : ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});

// Elegant Graceful Shutdown Handlers (Critical for production/high-traffic systems)
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if connections linger
  setTimeout(() => {
    console.error('Could not close active connections in time, forcing shutdown.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
