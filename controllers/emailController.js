const { emailQueue } = require('../queues/emailQueue');
const emailService = require('../services/emailService');

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, body, templateId, attachments } = req.body;
    
    // Validate email data
    if (!to || (!body && !templateId)) {
      return res.status(400).json({ error: 'Missing required email fields' });
    }
    
    // Add job to queue
    const job = await emailQueue.add('send-email', {
      to,
      subject,
      body,
      templateId,
      attachments
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    
    return res.status(202).json({ 
      message: 'Email queued successfully',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error queueing email:', error);
    return res.status(500).json({ error: 'Failed to queue email' });
  }
};

exports.sendBatchEmails = async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty email batch' });
    }
    
    // Add all emails to the queue as individual jobs
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
    
    return res.status(202).json({ 
      message: `Batch of ${emails.length} emails queued successfully`,
      jobIds: jobs.map(job => job.id)
    });
  } catch (error) {
    console.error('Error queueing batch emails:', error);
    return res.status(500).json({ error: 'Failed to queue batch emails' });
  }
};

exports.getEmailStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await emailQueue.getJob(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Email job not found' });
    }
    
    const state = await job.getState();
    
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
    console.error('Error getting email status:', error);
    return res.status(500).json({ error: 'Failed to get email status' });
  }
};