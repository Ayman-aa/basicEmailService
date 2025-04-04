// Export configuration module
module.exports = {
  // Redis connection settings
  redis: {
    // Redis server host. Defaults to 'localhost' if REDIS_HOST env variable is not set.
    host: process.env.REDIS_HOST || 'localhost',
    
    // Redis server port. Defaults to 6379 if REDIS_PORT env variable is not set.
    port: process.env.REDIS_PORT || 6379,
    
    // Redis password (if required). Value comes from REDIS_PASSWORD environment variable.
    password: process.env.REDIS_PASSWORD,
    
    // Redis database index. Defaults to 0 if REDIS_DB env variable is not set.
    db: process.env.REDIS_DB || 0
  },
  
  // Default job options for queue processing
  defaultJobOptions: {
    // Maximum number of attempts for a job
    attempts: 5,
    
    // Backoff strategy for retrying jobs, exponential with an initial delay of 1000ms
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    
    // Keep the latest 100 completed jobs in queue memory (for history)
    removeOnComplete: 100,
    
    // Keep the latest 100 failed jobs in queue memory (for history)
    removeOnFail: 100
  }
};