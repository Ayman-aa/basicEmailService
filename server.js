const express = require('express');
const app = require('./app');
const config = require('./config/mongodb');
const { startAgenda } = require('./queues/agendaSetup');
const { emailQueue } = require('./queues/emailQueue');
const WorkerManager = require('./workers/workerManager');

const PORT = process.env.PORT || 3000;

// Initialize worker manager with the email queue
const workerManager = new WorkerManager({
  minWorkers: parseInt(process.env.MIN_WORKERS) || 2,
  maxWorkers: parseInt(process.env.MAX_WORKERS) || 8,
  scaleThreshold: parseInt(process.env.SCALE_THRESHOLD) || 50,
  queueProvider: emailQueue
});

// Start the server
async function startServer() {
  try {
    // Start agenda scheduler
    await startAgenda();
    
    // Start worker manager
    await workerManager.start();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', shutDown);
    process.on('SIGINT', shutDown);
    
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

async function shutDown() {
  console.log('Shutting down server...');
  
  try {
    await workerManager.stop();
    console.log('Workers stopped');
    
    // Close other connections
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

startServer();