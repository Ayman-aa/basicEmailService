require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const emailController = require('./controllers/emailController');
const scheduledEmailController = require('./controllers/scheduledEmailController');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email sending routes
app.post('/api/email/send', emailController.sendEmail);
app.post('/api/email/batch', emailController.sendBatchEmails);
app.get('/api/email/:id', emailController.getEmailStatus);

// Scheduled email routes
app.post('/api/email/schedule', scheduledEmailController.scheduleEmail);
app.delete('/api/email/schedule/:jobId', scheduledEmailController.cancelScheduledEmail);
app.get('/api/email/schedule', scheduledEmailController.listScheduledEmails);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;