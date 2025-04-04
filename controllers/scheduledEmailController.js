const { agenda } = require('../queues/agendaSetup');
const emailService = require('../services/emailService');

exports.scheduleEmail = async (req, res) => {
  try {
    const { to, subject, body, templateId, scheduledTime, recurring, interval } = req.body;
    
    // Validate email data
    if (!to || (!body && !templateId) || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const emailData = { to, subject, body, templateId };
    
    // Convert scheduledTime to Date object if it's a string
    const when = new Date(scheduledTime);
    
    if (recurring && interval) {
      // Schedule recurring email
      const job = await agenda.every(interval, 'send-scheduled-email', { emailData });
      return res.status(201).json({ 
        message: 'Recurring email scheduled', 
        jobId: job.attrs._id.toString(),
        interval 
      });
    } else {
      // Schedule one-time email
      const job = await agenda.schedule(when, 'send-scheduled-email', { emailData });
      return res.status(201).json({ 
        message: 'Email scheduled', 
        jobId: job.attrs._id.toString(),
        scheduledTime: when 
      });
    }
  } catch (error) {
    console.error('Error scheduling email:', error);
    return res.status(500).json({ error: 'Failed to schedule email' });
  }
};

exports.cancelScheduledEmail = async (req, res) => {
  try {
    const { jobId } = req.params;
    const numRemoved = await agenda.cancel({ _id: jobId });
    
    if (numRemoved > 0) {
      return res.status(200).json({ message: 'Scheduled email cancelled' });
    } else {
      return res.status(404).json({ error: 'Scheduled email not found' });
    }
  } catch (error) {
    console.error('Error cancelling scheduled email:', error);
    return res.status(500).json({ error: 'Failed to cancel scheduled email' });
  }
};

exports.listScheduledEmails = async (req, res) => {
  try {
    const jobs = await agenda.jobs({ name: 'send-scheduled-email' });
    
    const scheduledEmails = jobs.map(job => {
      return {
        id: job.attrs._id.toString(),
        to: job.attrs.data.emailData.to,
        subject: job.attrs.data.emailData.subject,
        nextRunAt: job.attrs.nextRunAt,
        lastRunAt: job.attrs.lastRunAt,
        repeatInterval: job.attrs.repeatInterval,
        isRecurring: !!job.attrs.repeatInterval
      };
    });
    
    return res.status(200).json(scheduledEmails);
  } catch (error) {
    console.error('Error listing scheduled emails:', error);
    return res.status(500).json({ error: 'Failed to list scheduled emails' });
  }
};