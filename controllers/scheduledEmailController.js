// Import the agenda instance for scheduling tasks and the email service
const { agenda } = require('../queues/agendaSetup');
const emailService = require('../services/emailService');

// Controller function to schedule an email
exports.scheduleEmail = async (req, res) => {
  try {
    // Destructure required fields from the request body
    const { to, subject, body, templateId, scheduledTime, recurring, interval } = req.body;
    
    // Validate required fields: 'to', one of 'body' or 'templateId', and 'scheduledTime' must be provided
    if (!to || (!body && !templateId) || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Prepare the email data payload
    const emailData = { to, subject, body, templateId };
    
    // Convert scheduledTime string to a Date object
    const when = new Date(scheduledTime);
    
    // Check if the email should be recurring and there is an interval provided
    if (recurring && interval) {
      // Schedule a recurring email using the provided interval
      const job = await agenda.every(interval, 'send-scheduled-email', { emailData });
      return res.status(201).json({ 
        message: 'Recurring email scheduled', 
        jobId: job.attrs._id.toString(),
        interval 
      });
    } else {
      // Schedule a one-time email at the specified time
      const job = await agenda.schedule(when, 'send-scheduled-email', { emailData });
      return res.status(201).json({ 
        message: 'Email scheduled', 
        jobId: job.attrs._id.toString(),
        scheduledTime: when 
      });
    }
  } catch (error) {
    // Log error details to the console for debugging
    console.error('Error scheduling email:', error);
    return res.status(500).json({ error: 'Failed to schedule email' });
  }
};

// Controller function to cancel a scheduled email job
exports.cancelScheduledEmail = async (req, res) => {
  try {
    // Extract the jobId parameter from the request
    const { jobId } = req.params;
    // Cancel the job using the provided jobId
    const numRemoved = await agenda.cancel({ _id: jobId });
    
    // Check if any job was removed and return appropriate response
    if (numRemoved > 0) {
      return res.status(200).json({ message: 'Scheduled email cancelled' });
    } else {
      return res.status(404).json({ error: 'Scheduled email not found' });
    }
  } catch (error) {
    // Log error details and return a server error response
    console.error('Error cancelling scheduled email:', error);
    return res.status(500).json({ error: 'Failed to cancel scheduled email' });
  }
};

// Controller function to list all scheduled emails
exports.listScheduledEmails = async (req, res) => {
  try {
    // Retrieve all jobs with the name 'send-scheduled-email'
    const jobs = await agenda.jobs({ name: 'send-scheduled-email' });
    
    // Map over the jobs to extract relevant information about each scheduled email
    const scheduledEmails = jobs.map(job => {
      return {
        id: job.attrs._id.toString(),          // Unique ID of the job
        to: job.attrs.data.emailData.to,         // Recipient email address
        subject: job.attrs.data.emailData.subject, // Email subject
        nextRunAt: job.attrs.nextRunAt,          // Next scheduled run time
        lastRunAt: job.attrs.lastRunAt,          // Last time the job was run
        repeatInterval: job.attrs.repeatInterval, // Interval for recurring emails
        isRecurring: !!job.attrs.repeatInterval  // Boolean indicating if it's a recurring email
      };
    });
    
    // Send the list of scheduled emails as a JSON response
    return res.status(200).json(scheduledEmails);
  } catch (error) {
    // Log any errors and return an error response
    console.error('Error listing scheduled emails:', error);
    return res.status(500).json({ error: 'Failed to list scheduled emails' });
  }
};