const Agenda = require('agenda');
const config = require('../config/mongodb');

const agenda = new Agenda({
  db: { address: config.mongoUrl, collection: 'agendaJobs' },
  processEvery: '30 seconds'
});

// Define job types
agenda.define('send-scheduled-email', async (job, done) => {
  const { emailData } = job.attrs.data;
  try {
    const emailService = require('../services/emailService');
    await emailService.sendEmail(emailData);
    console.log(`Scheduled email sent successfully: ${job.attrs._id}`);
    done();
  } catch (error) {
    console.error('Error in scheduled email job:', error);
    done(error);
  }
});

agenda.define('process-email-analytics', async (job, done) => {
  try {
    // Process analytics like open rates, click rates, etc.
    console.log('Processing email analytics...');
    // Implementation will come later
    done();
  } catch (error) {
    console.error('Error processing email analytics:', error);
    done(error);
  }
});

agenda.define('clean-old-emails', async (job, done) => {
  try {
    // Clean up old email records or logs
    console.log('Cleaning old email records...');
    // Implementation will come later
    done();
  } catch (error) {
    console.error('Error cleaning old emails:', error);
    done(error);
  }
});

// Start agenda
const startAgenda = async () => {
  await agenda.start();
  
  // Schedule recurring jobs
  await agenda.every('1 hour', 'process-email-analytics');
  await agenda.every('1 day', 'clean-old-emails');
  
  console.log('Agenda scheduler started');
};

module.exports = { agenda, startAgenda };