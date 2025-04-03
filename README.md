# noBrainerSendGrid

I'm trying to build a tool like SendGrid ;<  
yet I'm trying to break it into manageable parts, ignoring all practices.

for now:
- An Express server is set up in `server.js` and bootstraps the app defined in `app.js`.
- The API supports queuing email jobs via a POST request to `/api/email`, and checking job status using GET `/api/email/status/:jobId`.
- Email sending is processed asynchronously using a Bull queue from `queues/emailQueue.js` and executed in `jobs/emailJob.js`.
- The email content is rendered using EJS templates from the `views/email-templates` directory, with the rendering logic located in `services/templateService.js`.
- Email configuration (SMTP settings) is handled in the `.env` file and loaded by `config/smtp.js`.
- Redis is required and configured via `.env` variables and `config/queue.js` to manage the job queue.
- To run the project, clone the repository, set up the environment variables in a `.env` file, and install dependencies using `npm install`. Then start the server with `node server.js`.
