const Queue = require('bull');
const queueConfig = require('../config/queue');
const emailJob = require('../jobs/emailJob');

const emailQueue = new Queue('email', {
  redis: queueConfig.redis,
  limiter: queueConfig.limiter
});

emailQueue.process(emailJob.process);

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});

module.exports = emailQueue;