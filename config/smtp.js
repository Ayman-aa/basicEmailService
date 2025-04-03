module.exports = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT), 
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    defaultFrom: process.env.DEFAULT_FROM
  };module.exports = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT), 
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    defaultFrom: process.env.DEFAULT_FROM
  };