I'm trying to build a tool like SendGrid (jk) ;<  
yet I'm trying to break it into manageable parts, ignoring all practices.

too lazy to write a commit message too motivated to write in readme:
For now ...

# noBrainerSendGrid

A custom email sending service inspired by SendGrid, built with Node.js. This project handles email queuing, scheduling, templating, and delivery, with a focus on reliability and scalability.

## Core Components

### Server Setup
- **server.js**  
    Bootstrap file that initializes the Express server, worker manager, and Agenda scheduler.
- **app.js**  
    Express application that defines API routes.

### Configuration
- **config/mongodb.js**: MongoDB connection setup.
- **config/queue.js**: Redis configuration for the Bull queue.
- **config/smtp.js**: SMTP server settings for email delivery.

### Email Processing
- **services/emailService.js**: Core email sending functionality using Nodemailer.
- **services/templateService.js**: Renders email templates with EJS.
- **views/email-templates/**: Directory containing EJS templates (e.g., `welcome.ejs`).

### Job Processing
- **queues/emailQueue.js**: Implementation of Bull queue for email jobs.
- **queues/agendaSetup.js**: Agenda scheduler for recurring and scheduled email tasks.
- **jobs/emailJob.js**: Processor for email sending jobs.

### Worker Threading
- **workers/emailWorker.js**: Worker thread that processes email jobs.
- **workers/workerManager.js**: Manages dynamic scaling of worker threads based on queue load.

### API Controllers
- **controllers/emailController.js**: Handles immediate email sending requests.
- **controllers/scheduledEmailController.js**: Manages scheduled and recurring email requests.

## Key Features
- **Queue-based Processing:**  
    Uses Bull (Redis-based queue) for asynchronous email sending.
- **Scalable Architecture:**  
    Dynamic worker scaling based on queue size.
- **Email Templates:**  
    EJS-based system for customizable email designs.
- **Scheduled Emails:**  
    Supports one-time and recurring emails using Agenda.
- **Graceful Shutdown:**  
    Properly terminates workers and connections.
- **Error Handling:**  
    Implements retry mechanisms for failed email delivery.

## Technical Details
- **Database:**  
    MongoDB for managing scheduled jobs.
- **Queue:**  
    Redis for handling the email sending queue.
- **Email Transport:**  
    For now : Nodemailer configured with SMTP settings.
- **Concurrency Control:**  
    Worker threads ensure parallel processing.
- **Auto-scaling:**  
    Adjusts worker count based on the queue load.
- **Templates:**  
    Dynamic rendering using EJS for email content.

## Architecture
```
┌─────────────┐     ┌─────────────┐     ┌───────────────┐
│ Express API │────▶│ Bull Queue  │────▶│ Worker Threads│
└─────────────┘     └─────────────┘     └───────────────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌───────────────┐
│   MongoDB   │     │    Redis    │     │   SMTP Server │
└─────────────┘     └─────────────┘     └───────────────┘
       ▲
       │
┌─────────────┐
│   Agenda    │
│  Scheduler  │
└─────────────┘
```
## Future Updates

- Evaluate alternatives to Nodemailer, such as smtp-client, emailJs, or even implementing raw SMTP support.
- Introduce middleware components to improve request handling, security, and error processing.

# Getting Started

## Prerequisites
make sure you have :
- Node.js (v16 or higher) 
- MongoDB (running locally or accessible) refer to [docs](https://www.mongodb.com/docs/manual/installation/) ps: Ctrl + click to open in another tab

- Redis (running locally or accessible) refer to [docs](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/) ps: Ctrl + click to open in another tab

1. Clone the repository:

```bash
git clone https://github.com/Ayman-aa/noBrainerSendGrid.git
cd noBrainerSendGrid
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .example.env .env
```

4. Edit the .env file with your SMTP, Redis, and MongoDB configurations:
```
# SMTP Configuration (e.g., Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password # Use an "App Password" if using Gmail
SMTP_SECURE=false  # true for port 465, false for 587
DEFAULT_FROM="No Reply <email@example.com>"

# Redis (required for Bull queue)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=yourpassword (if applicable)

# MongoDB (required for Agenda scheduler)
MONGODB_URI=mongodb://localhost:27017/emailService #leave this as it is

# Server
PORT=3000
```

## Running the Application

Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Usage Examples

Sending an Email

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello from noBrainerSendGrid",
    "body": "<h1>Hello!</h1><p>This is a test email.</p>"
  }'
```

Using a Template
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Welcome to Our Service",
    "templateId": "welcome",
    "templateData": {
      "name": "John Doe",
      "docsUrl": "https://example.com/docs"
    }
  }'
```

Scheduling an Email
```bash
curl -X POST http://localhost:3000/api/email/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Reminder",
    "body": "<p>Don't forget your appointment!</p>",
    "scheduledTime": "2023-12-25T10:00:00.000Z"
  }'
```

*Note: This is a custom implementation of an email delivery system and is not affiliated with SendGrid.*
