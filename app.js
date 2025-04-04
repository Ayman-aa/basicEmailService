// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import controllers for handling email operations
const emailController = require('./controllers/emailController');
const scheduledEmailController = require('./controllers/scheduledEmailController');

// Create an Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for all origins
app.use(cors());

// Middleware to parse JSON bodies from incoming requests
app.use(bodyParser.json());

// Middleware to parse URL-encoded bodies from incoming requests
app.use(bodyParser.urlencoded({ extended: true }));

// Route for sending a single email
app.post('/api/email/send', emailController.sendEmail);

// Route for sending batch emails
app.post('/api/email/batch', emailController.sendBatchEmails);

// Route for retrieving the status of a sent email by id
app.get('/api/email/:id', emailController.getEmailStatus);

// Route for scheduling an email to be sent later
app.post('/api/email/schedule', scheduledEmailController.scheduleEmail);

// Route for canceling a scheduled email job by jobId
app.delete('/api/email/schedule/:jobId', scheduledEmailController.cancelScheduledEmail);

// Route for listing all scheduled emails
app.get('/api/email/schedule', scheduledEmailController.listScheduledEmails);

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log error stack to the console for debugging
  console.error(err.stack);
  // Respond with a 500 Internal Server Error status code and a generic error message
  res.status(500).json({ error: 'Internal server error' });
});

// Export the Express app
module.exports = app;