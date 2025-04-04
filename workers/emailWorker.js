// workers/emailWorker.js
const { parentPort } = require('worker_threads');
const { emailQueue } = require('../queues/emailQueue');
const emailService = require('../services/emailService');

// Log helper function that reports back to the main thread
function log(message) {
  if (parentPort) {
    parentPort.postMessage({ type: 'log', data: message });
  } else {
    console.log(message);
  }
}

// Start processing jobs
async function processJobs() {
  log('Worker started processing email jobs');
  
  try {
    // Process jobs from the queue - specify the job type "send-email"
    emailQueue.process('send-email', async (job) => {
      try {
        log(`Processing email job ${job.id}`);
        const { to, subject, body, templateId, attachments } = job.data;
        
        // Send the email
        const result = await emailService.sendEmail({
          to,
          subject,
          body,
          templateId,
          attachments,
          templateData: job.data.templateData || {}
        });
        
        log(`Successfully processed email job ${job.id}`);
        return result;
      } catch (error) {
        log(`Error processing email job ${job.id}: ${error.message}`);
        throw error;
      }
    });
  } catch (error) {
    log(`Worker error: ${error.message}`);
    throw error;
  }
}

// Handle termination signal
if (parentPort) {
  parentPort.once('close', () => {
    log('Worker shutting down');
    process.exit(0);
  });
}

// Start processing
processJobs().catch(error => {
  log(`Fatal worker error: ${error.message}`);
  process.exit(1);
});