// Import the email service that sends emails
const emailService = require('../services/emailService');
// Import the email queue used to manage email sending jobs
const { emailQueue } = require('../queues/emailQueue');

// Process email sending jobs with the job type 'send-email'
emailQueue.process('send-email', async (job) => {
  // Extract required properties from the job data
  const { to, subject, body, templateId, attachments } = job.data;
  
  try {
    // Update job progress to 10% to indicate that the job has started processing
    job.progress(10);
    
    // Log the current job and its attempt number
    console.log(`Processing email job ${job.id}, attempt ${job.attemptsMade + 1}`);
    
    // Send the email, including optional templateData from job.data
    const result = await emailService.sendEmail({
      to,
      subject,
      body,
      templateId,
      attachments,
      templateData: job.data.templateData // Use additional template data if available
    });
    
    // Update job progress to 100% to indicate successful completion
    job.progress(100);
    
    // Log a message indicating successful email sending
    console.log(`Email job ${job.id} completed successfully`);
    
    return result;
  } catch (error) {
    // Log any error that occurs during the email sending process
    console.error(`Error processing email job ${job.id}:`, error);
    // Rethrow the error to trigger the job retry mechanism
    throw error;
  }
});

// Listen for completed jobs and log their results
emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Listen for failed jobs, log the error, and allow for further failure handling
emailQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
  // Additional handling (e.g., sending alerts or logging to a database) can be added here
});

// Export a utility function to create standardized email job data objects
module.exports = {
  createEmailJobData: (to, subject, body, templateId, attachments = [], templateData = {}) => {
    return {
      to,
      subject,
      body,
      templateId,
      attachments,
      templateData
    };
  },
};