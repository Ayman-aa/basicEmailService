const emailQueue = require('../queues/emailQueue');

module.exports = {
  sendEmail: async (req, res) => {
    try {
      const { to, subject, template, context } = req.body;
      

      const job = await emailQueue.add({
        to,
        subject,
        template,
        context
      }, {
        attempts: 3, 
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      });

      res.json({
        success: true,
        message: 'Email queued successfully',
        jobId: job.id
      });
    } catch (error) {
      console.error('Error queuing email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to queue email'
      });
    }
  },

  getJobStatus: async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await emailQueue.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const state = await job.getState();
      const progress = job.progress();
      
      res.json({
        success: true,
        state,
        progress,
        result: job.returnvalue,
        error: job.failedReason
      });
    } catch (error) {
      console.error('Error getting job status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get job status'
      });
    }
  }
};