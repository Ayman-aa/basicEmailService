const emailService = require('../services/emailService');
const { emailQueue } = require('../queues/emailQueue');

// Process email sending jobs
emailQueue.process('send-email', async (job) => {
  const { to, subject, body, templateId, attachments } = job.data;
  
  try {
    // Update job progress
    job.progress(10);
    
    // Log job attempt
    console.log(`Processing email job ${job.id}, attempt ${job.attemptsMade + 1}`);
    
    // Send the email
    const result = await emailService.sendEmail({
      to,
      subject,
      body,
      templateId,
      attachments,
      templateData: job.data.templateData // Add this line
    });
    
    // Update job progress to complete
    job.progress(100);
    
    // Log successful completion
    console.log(`Email job ${job.id} completed successfully`);
    
    return result;
  } catch (error) {
    console.error(`Error processing email job ${job.id}:`, error);
    throw error; // This will trigger the retry mechanism
  }
});

// Listen for completed jobs
emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Listen for failed jobs
emailQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
  
  // Here you could implement additional handling for failed jobs
  // such as alerting, logging to a database, etc.
});

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