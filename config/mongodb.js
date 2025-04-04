// Import the mongoose module to interact with MongoDB
const mongoose = require('mongoose');

// Define the MongoDB URL; use the environment variable if available,
// otherwise default to a local MongoDB instance for the 'emailapp' database
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/emailapp';

// Connect to MongoDB using mongoose.connect with proper options
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,       // Use the new URL parser instead of the deprecated one
  useUnifiedTopology: true      // Use the new Server Discover and Monitoring engine
})
.then(() => {
  // Log successful connection
  console.log('Connected to MongoDB');
})
.catch(err => {
  // Log any connection errors and exit the process if unable to connect
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Export the mongoUrl and the established mongoose connection for use in other modules
module.exports = {
  mongoUrl,
  connection: mongoose.connection
};