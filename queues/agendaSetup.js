// Import the Agenda module for job scheduling
const Agenda = require('agenda');

// Import configuration for MongoDB connection
const config = require('../config/mongodb');

// Create a new Agenda instance with MongoDB as the job storage
const agenda = new Agenda({
  db: { address: config.mongoUrl, collection: 'agendaJobs' },
  processEvery: '30 seconds' // Check for jobs every 30 seconds
});

// Define the job for sending scheduled emails
agenda.define('send-scheduled-email', async (job, done) => {
  // Extract emailData from job attributes
  const { emailData } = job.attrs.data;
  try {
    // Import email service and send the email
    const emailService = require('../services/emailService');
    await emailService.sendEmail(emailData);
    console.log(`Scheduled email sent successfully: ${job.attrs._id}`);
    done();
  } catch (error) {
    console.error('Error in scheduled email job:', error);
    done(error);
  }
});

// Define the job for processing email analytics
agenda.define('process-email-analytics', async (job, done) => {
  try {
    // Process analytics such as open rates and click rates
    console.log('Processing email analytics...');
    // Implementation will come later
    done();
  } catch (error) {
    console.error('Error processing email analytics:', error);
    done(error);
  }
});

// Define the job for cleaning up old emails or logs
agenda.define('clean-old-emails', async (job, done) => {
  try {
    // Clean up old email records or logs to free up resources
    console.log('Cleaning old email records...');
    // Implementation will come later
    done();
  } catch (error) {
    console.error('Error cleaning old emails:', error);
    done(error);
  }
});

// Start agenda and schedule recurring jobs
const startAgenda = async () => {
  // Start the Agenda scheduler
  await agenda.start();
  
  // Schedule the email analytics job to run every hour
  await agenda.every('1 hour', 'process-email-analytics');
  
  // Schedule the clean-up job to run once per day
  await agenda.every('1 day', 'clean-old-emails');
  
  console.log('Agenda scheduler started');
};

// Export the agenda instance and start function for use in other files
module.exports = { agenda, startAgenda };