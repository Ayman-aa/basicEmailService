// services/emailService.js
const nodemailer = require('nodemailer');
const smtpConfig = require('../config/smtp');
const templateService = require('./templateService');

const transporter = nodemailer.createTransport(smtpConfig);

async function sendEmail(to, subject, templateName, context) {
    try {
      const html = await templateService.renderTemplate(templateName, {
        ...context,
        subject 
      });
      
      const mailOptions = {
        from: smtpConfig.defaultFrom,
        to,
        subject,
        html
      };
  
      return transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

// Make sure this export exists
module.exports = {
  sendEmail
};