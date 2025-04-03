const { sendEmail } = require('../services/emailService');

module.exports = {
  process: async (job) => {
    const { to, subject, template, context } = job.data;
    return sendEmail(to, subject, template, context);
  }
};