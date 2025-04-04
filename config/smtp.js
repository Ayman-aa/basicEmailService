// Export the SMTP configuration settings for the email service.
module.exports = {
  // SMTP server host. Defaults to 'smtp.example.com' if SMTP_HOST is not set.
  host: process.env.SMTP_HOST || 'smtp.example.com',

  // SMTP server port. Defaults to 587 if SMTP_PORT is not set.
  port: process.env.SMTP_PORT || 587,

  // Use secure connection if SMTP_SECURE is set to 'true'.
  secure: process.env.SMTP_SECURE === 'true',

  // Authentication settings for the SMTP server.
  auth: {
    // Username for SMTP authentication. Defaults to 'user@example.com' if SMTP_USER is not set.
    user: process.env.SMTP_USER || 'user@example.com',
    // Password for SMTP authentication. Defaults to 'password' if SMTP_PASS is not set.
    pass: process.env.SMTP_PASS || 'password'
  },

  // Enable pooling of connections to improve performance.
  pool: true,

  // Maximum number of simultaneous connections.
  maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS) || 5,

  // Maximum number of messages to send per connection.
  maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES) || 100,

  // Rate limit for sending messages (messages per second).
  rateLimit: parseInt(process.env.SMTP_RATE_LIMIT) || 5
};