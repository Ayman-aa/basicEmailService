module.exports = {
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  },
  pool: true,
  maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS) || 5,
  maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES) || 100,
  rateLimit: parseInt(process.env.SMTP_RATE_LIMIT) || 5 // messages per second
};