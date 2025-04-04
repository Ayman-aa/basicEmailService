// Load required modules and initialize app components
const express = require('express');
const app = require('./app');
const config = require('./config/mongodb');
const { startAgenda } = require('./queues/agendaSetup');
const { emailQueue } = require('./queues/emailQueue');
const WorkerManager = require('./workers/workerManager');

// Set the port number (default to 3000 if not provided)
const PORT = process.env.PORT || 3000;

// Initialize worker manager with the email queue and configuration parameters
const workerManager = new WorkerManager({
  minWorkers: parseInt(process.env.MIN_WORKERS) || 2,          // Minimum number of workers
  maxWorkers: parseInt(process.env.MAX_WORKERS) || 8,          // Maximum number of workers
  scaleThreshold: parseInt(process.env.SCALE_THRESHOLD) || 50,   // Threshold for scaling worker instances
  queueProvider: emailQueue                                    // Queue provider for email tasks
});

// Start the server and all its services asynchronously
async function startServer() {
  try {
    // Start the job scheduler using agenda
    await startAgenda();
    
    // Start the worker manager to process email tasks
    await workerManager.start();
    
    // Launch the web server and listen on the specified port
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Register event listeners for graceful shutdown
    process.on('SIGTERM', shutDown);
    process.on('SIGINT', shutDown);
    
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);  // Exit the process if any error occurs during startup
  }
}

// Graceful shutdown function to stop worker services and close connections
async function shutDown() {
  console.log('Shutting down server...');
  
  try {
    // Stop the worker manager safely
    await workerManager.stop();
    console.log('Workers stopped');
    
    // Additional shutdown logic (e.g., closing database connections) can be added here
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Initialize the server startup sequence
startServer();