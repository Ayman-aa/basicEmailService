// Import the Bull queue library
const Queue = require('bull');
// Import queue configuration
const config = require('../config/queue');

// Create a new queue named 'email-queue' with custom Redis and job options from the config
const emailQueue = new Queue('email-queue', {
  redis: config.redis,
  defaultJobOptions: config.defaultJobOptions
});

// Define a helper method to get queue statistics
emailQueue.getStats = async () => {
  // Retrieve counts for waiting, active, completed, and failed jobs concurrently
  const [waiting, active, completed, failed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount()
  ]);
  
  // Return an object containing the counts for each queue state
  return { waiting, active, completed, failed };
};

// Add an error event handler to log errors that occur in the queue
emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
});

// Add a stalled event handler to warn when a job has stalled
emailQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} has stalled`);
});

// Export the emailQueue object for use in other parts of the application
module.exports = { emailQueue };