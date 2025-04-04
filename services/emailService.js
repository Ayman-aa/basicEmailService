const nodemailer = require('nodemailer');
const smtpConfig = require('../config/smtp');
const templateService = require('./templateService');

// Create reusable transporter object
const transporter = nodemailer.createTransport(smtpConfig);

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

/**
 * Validates an email object
 * @param {Object} emailData - The email data
 * @returns {Boolean} - Whether the email is valid
 */
function validateEmail(emailData) {
  const { to, subject, body, templateId } = emailData;
  
  if (!to) return false;
  if (!subject) return false;
  if (!body && !templateId) return false;
  
  return true;
}

/**
 * Sends an email
 * @param {Object} emailData - The email data
 * @returns {Promise} - A promise that resolves with the send result
 */
async function sendEmail(emailData) {
  const { to, subject, body, templateId, attachments } = emailData;
  
  try {
    console.log('Sending email with data:', JSON.stringify(emailData));
    
    // If templateId is provided, render the template
    let html = body;
    if (templateId) {
      const templateData = emailData.templateData || {};
      console.log('Rendering template:', templateId, 'with data:', JSON.stringify(templateData));
      html = await templateService.renderTemplate(templateId, templateData);
    }
    
    // Prepare email options
    const mailOptions = {
      from: smtpConfig.auth.user,
      to,
      subject,
      html,
      attachments: attachments || []
    };
    
    console.log('Prepared mail options:', JSON.stringify(mailOptions));
    
    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent: ${info.messageId}`);
    return {
      messageId: info.messageId,
      status: 'sent',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  validateEmail,
  sendEmail
};