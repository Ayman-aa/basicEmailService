const { Worker } = require('worker_threads');
const os = require('os');
const path = require('path');

class WorkerManager {
  /**
   * Creates a new WorkerManager and initializes settings.
   * @param {object} options - Configuration options.
   */
  constructor(options = {}) {
    // Minimum number of workers to keep running
    this.minWorkers = options.minWorkers || 2;
    // Maximum workers allowed, defaulting to the number of CPU cores
    this.maxWorkers = options.maxWorkers || os.cpus().length;
    // Threshold of queue items per worker to trigger scaling
    this.scaleThreshold = options.scaleThreshold || 100; 
    // Interval in milliseconds to check the queue and adjust worker count
    this.checkInterval = options.checkInterval || 5000;
    // Array to hold current worker instances
    this.workers = [];
    // Active flag to indicate if the manager is running
    this.active = false;
    // Provider for queue statistics and methods
    this.queueProvider = options.queueProvider;
  }

  /**
   * Starts the WorkerManager: initiates minimum workers
   * and starts the interval for scaling worker count.
   */
  async start() {
    if (this.active) return; // Prevent starting if already active
    this.active = true;
    
    // Start the minimum number of workers
    for (let i = 0; i < this.minWorkers; i++) {
      await this.addWorker();
    }
    
    // Set up a recurring interval to adjust the worker count dynamically
    this.scalingInterval = setInterval(() => this.adjustWorkerCount(), this.checkInterval);
    
    console.log(`Worker manager started with ${this.minWorkers} workers`);
  }

  /**
   * Stops the WorkerManager by clearing the scaling interval and
   * terminating all running workers.
   */
  async stop() {
    this.active = false;
    clearInterval(this.scalingInterval);
    
    // Terminate all workers using a promise to handle exit events
    const workerTerminations = this.workers.map(worker => {
      return new Promise((resolve) => {
        worker.once('exit', () => resolve());
        worker.terminate();
      });
    });
    
    await Promise.all(workerTerminations);
    this.workers = [];
    
    console.log('All workers have been terminated');
  }

  /**
   * Adds a new worker by forking a new thread to run 'emailWorker.js'.
   * Sets up appropriate event handlers for error, exit, and messaging.
   */
  async addWorker() {
    const worker = new Worker(path.join(__dirname, 'emailWorker.js'));
    
    // Handle any errors from the worker
    worker.on('error', (err) => {
      console.error('Worker error:', err);
      this.removeWorker(worker);
      // If manager is still active, replace the failed worker
      if (this.active) this.addWorker();
    });
    
    // Handle worker exit events
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker exited with code ${code}`);
      }
      this.removeWorker(worker);
    });
    
    // Handle messages sent from the worker
    worker.on('message', (message) => {
      if (message.type === 'log') {
        console.log(`Worker ${worker.threadId}: ${message.data}`);
      }
    });
    
    // Add worker to the pool
    this.workers.push(worker);
    console.log(`Worker ${worker.threadId} started`);
    return worker;
  }

  /**
   * Removes a worker from the internal list of workers.
   * @param {Worker} worker - The worker to remove.
   */
  removeWorker(worker) {
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      this.workers.splice(index, 1);
      console.log(`Worker ${worker.threadId} removed`);
    }
  }

  /**
   * Adjusts the number of active workers based on the queue size.
   * Scales up if the queue length per worker exceeds the threshold,
   * or scales down if there are too many workers.
   */
  async adjustWorkerCount() {
    // Only adjust if the manager is active and a queueProvider is available
    if (!this.active || !this.queueProvider) return;
    
    try {
      // Retrieve current statistics from the queue
      const queueStats = await this.queueProvider.getStats();
      const queueLength = queueStats.waiting + queueStats.active;
      const workerCount = this.workers.length;
      
      // Calculate the ideal number of workers needed
      const idealWorkerCount = Math.ceil(queueLength / this.scaleThreshold);
      // Ensure the ideal count falls within the min and max bounds
      const boundedWorkerCount = Math.max(
        this.minWorkers,
        Math.min(idealWorkerCount, this.maxWorkers)
      );
      
      // Scale up if the bounded ideal count is greater than current count
      if (boundedWorkerCount > workerCount) {
        console.log(`Scaling up from ${workerCount} to ${boundedWorkerCount} workers`);
        for (let i = workerCount; i < boundedWorkerCount; i++) {
          await this.addWorker();
        }
      // Scale down if the bounded ideal count is less than current count
      } else if (boundedWorkerCount < workerCount) {
        console.log(`Scaling down from ${workerCount} to ${boundedWorkerCount} workers`);
        // Identify extra workers to remove
        const workersToRemove = this.workers.slice(boundedWorkerCount - workerCount);
        for (const worker of workersToRemove) {
          worker.terminate();
        }
      }
    } catch (error) {
      console.error('Error adjusting worker count:', error);
    }
  }
}

module.exports = WorkerManager;