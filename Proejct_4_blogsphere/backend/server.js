const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 BlogSphere API running in ${config.env} mode on port ${config.port}`);
  });

  process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line no-console
    console.error('💥 UNHANDLED REJECTION! Shutting down...', err.name, err.message);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
};

startServer();
