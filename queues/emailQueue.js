const Queue = require('bull');
const config = require('../config/queue');

const emailQueue = new Queue('email-queue', {
  redis: config.redis,
  defaultJobOptions: config.defaultJobOptions
});

// Queue stats helper method for the worker manager
emailQueue.getStats = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount()
  ]);
  
  return { waiting, active, completed, failed };
};

// Add event handlers for queue-level events
emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
});

emailQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} has stalled`);
});

module.exports = { emailQueue };