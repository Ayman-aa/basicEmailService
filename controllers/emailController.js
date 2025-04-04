// emailQueue for managing email jobs in the queue, and emailService for sending emails.
const { emailQueue } = require('../queues/emailQueue');
const emailService = require('../services/emailService');

// Controller function for sending a single email.
// It validates the input, adds the email job to the queue, and returns the job ID.
exports.sendEmail = async (req, res) => {
  try {
    // Destructure the required fields from the request body.
    const { to, subject, body, templateId, attachments } = req.body;
    
    // Validate email data: Must include a recipient, and either a body or a templateId.
    if (!to || (!body && !templateId)) {
      return res.status(400).json({ error: 'Missing required email fields' });
    }
    
    // Add the email job to the queue with data and retry/backoff settings.
    const job = await emailQueue.add('send-email', {
      to,
      subject,
      body,
      templateId,
      attachments
    }, {
      attempts: 3, // Maximum number of retry attempts.
      backoff: {
        type: 'exponential', // Exponential backoff strategy.
        delay: 1000 // Initial delay in milliseconds.
      }
    });
    
    // Return a 202 Accepted response along with the queued job ID.
    return res.status(202).json({ 
      message: 'Email queued successfully',
      jobId: job.id
    });
  } catch (error) {
    // Log the error and return 500 Internal Server Error.
    console.error('Error queueing email:', error);
    return res.status(500).json({ error: 'Failed to queue email' });
  }
};

// Controller function for sending a batch of emails.
// It validates the batch, adds each email as a separate job to the queue,
// and returns the list of job IDs.
exports.sendBatchEmails = async (req, res) => {
  try {
    // Destructure the emails array from the request body.
    const { emails } = req.body;
    
    // Validate that emails is a non-empty array.
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty email batch' });
    }
    
    // Add each email to the queue as an individual job.
    const jobs = await Promise.all(
      emails.map(email => 
        emailQueue.add('send-email', {
          to: email.to,
          subject: email.subject,
          body: email.body,
          templateId: email.templateId,
          attachments: email.attachments
        })
      )
    );
    
    // Return a response with the total emails queued and their job IDs.
    return res.status(202).json({ 
      message: `Batch of ${emails.length} emails queued successfully`,
      jobIds: jobs.map(job => job.id)
    });
  } catch (error) {
    // Log the error and return 500 Internal Server Error.
    console.error('Error queueing batch emails:', error);
    return res.status(500).json({ error: 'Failed to queue batch emails' });
  }
};

// Controller function to get the status of a specific email job.
// It finds the job by ID, retrieves its state and other details, and returns them.
exports.getEmailStatus = async (req, res) => {
  try {
    // Destructure the job ID from the route parameters.
    const { id } = req.params;
    
    // Retrieve the job from the queue using the provided ID.
    const job = await emailQueue.getJob(id);
    
    // If the job is not found, return 404 Not Found.
    if (!job) {
      return res.status(404).json({ error: 'Email job not found' });
    }
    
    // Get the current state of the job (e.g., waiting, active, completed, failed).
    const state = await job.getState();
    
    // Return the job details including state, progress, attempts, and any error.
    return res.status(200).json({
      id: job.id,
      state,
      data: job.data,
      progress: job.progress(),
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn
    });
  } catch (error) {
    // Log the error and return a 500 Internal Server Error response.
    console.error('Error getting email status:', error);
    return res.status(500).json({ error: 'Failed to get email status' });
  }
};