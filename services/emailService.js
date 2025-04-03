// services/emailService.js
const nodemailer = require('nodemailer');
const smtpConfig = require('../config/smtp');
const templateService = require('./templateService');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport(smtpConfig);

async function sendEmail(to, subject, templateName, context) {
    try {
      const templatePath = path.join(__dirname, '../views/email-templates', `${templateName}.ejs`);
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Email template '${templateName}' not found`);
      }

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

module.exports = {
  sendEmail
};