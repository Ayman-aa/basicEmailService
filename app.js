const express = require('express');
const bodyParser = require('body-parser');
const emailController = require('./controllers/emailController');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', './views');
app.set('view engine', 'ejs');


app.post('/api/email', emailController.sendEmail);
app.get('/api/email/status/:jobId', emailController.getJobStatus);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;