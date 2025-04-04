// workers/emailWorker.js

// Import required modules from the worker_threads and local files.
const { parentPort } = require('worker_threads'); // Allows communication with the parent thread.
const { emailQueue } = require('../queues/emailQueue'); // Import the emailQueue for job processing.
const emailService = require('../services/emailService'); // Import the email service used for sending emails.

// Helper function for logging messages.
// If running as a worker, sends a message back to the parent thread.
// Otherwise, logs directly to the console.
function log(message) {
  if (parentPort) {
    parentPort.postMessage({ type: 'log', data: message });
  } else {
    console.log(message);
  }
}

// Function to start processing email jobs from the queue.
async function processJobs() {
  // Log that the worker has started processing.
  log('Worker started processing email jobs');
  
  try {
    // Register a processor for jobs of type "send-email" in the emailQueue.
    emailQueue.process('send-email', async (job) => {
      try {
        // Log the beginning of job processing.
        log(`Processing email job ${job.id}`);
        
        // Destructure required fields from the job data.
        const { to, subject, body, templateId, attachments } = job.data;
        
        // Use the email service to send the email.
        // Pass along templateData if available.
        const result = await emailService.sendEmail({
          to,
          subject,
          body,
          templateId,
          attachments,
          templateData: job.data.templateData || {}
        });
        
        // Log successful processing of the job.
        log(`Successfully processed email job ${job.id}`);
        return result;
      } catch (error) {
        // Log any errors encountered while processing the individual job.
        log(`Error processing email job ${job.id}: ${error.message}`);
        throw error; // Re-throw the error so that job processing can handle it accordingly.
      }
    });
  } catch (error) {
    // Log any errors encountered while setting up the job processing.
    log(`Worker error: ${error.message}`);
    throw error; // Re-throw the error for further error handling.
  }
}

// Listen to the termination signal.
// When the parent port is closed, perform cleanup and exit the process.
if (parentPort) {
  parentPort.once('close', () => {
    log('Worker shutting down');
    process.exit(0); // Cleanly exit the process.
  });
}

// Start processing jobs with appropriate error handling.
// If a fatal error occurs, log it and exit the process with a failure code.
processJobs().catch(error => {
  log(`Fatal worker error: ${error.message}`);
  process.exit(1);
});