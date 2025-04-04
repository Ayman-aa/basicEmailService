const { Worker } = require('worker_threads');
const os = require('os');
const path = require('path');

class WorkerManager {
  constructor(options = {}) {
    this.minWorkers = options.minWorkers || 2;
    this.maxWorkers = options.maxWorkers || os.cpus().length;
    this.scaleThreshold = options.scaleThreshold || 100; // Queue items per worker to trigger scaling
    this.checkInterval = options.checkInterval || 5000; // Milliseconds
    this.workers = [];
    this.active = false;
    this.queueProvider = options.queueProvider;
  }

  async start() {
    if (this.active) return;
    
    this.active = true;
    
    // Start minimum number of workers
    for (let i = 0; i < this.minWorkers; i++) {
      await this.addWorker();
    }
    
    // Start scaling interval
    this.scalingInterval = setInterval(() => this.adjustWorkerCount(), this.checkInterval);
    
    console.log(`Worker manager started with ${this.minWorkers} workers`);
  }

  async stop() {
    this.active = false;
    clearInterval(this.scalingInterval);
    
    // Terminate all workers
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

  async addWorker() {
    const worker = new Worker(path.join(__dirname, 'emailWorker.js'));
    
    worker.on('error', (err) => {
      console.error('Worker error:', err);
      this.removeWorker(worker);
      // Replace the failed worker if we're still active
      if (this.active) this.addWorker();
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker exited with code ${code}`);
      }
      this.removeWorker(worker);
    });
    
    worker.on('message', (message) => {
      if (message.type === 'log') {
        console.log(`Worker ${worker.threadId}: ${message.data}`);
      }
    });
    
    this.workers.push(worker);
    console.log(`Worker ${worker.threadId} started`);
    return worker;
  }

  removeWorker(worker) {
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      this.workers.splice(index, 1);
      console.log(`Worker ${worker.threadId} removed`);
    }
  }

  async adjustWorkerCount() {
    if (!this.active || !this.queueProvider) return;
    
    try {
      const queueStats = await this.queueProvider.getStats();
      const queueLength = queueStats.waiting + queueStats.active;
      const workerCount = this.workers.length;
      
      // Calculate ideal worker count based on queue size
      const idealWorkerCount = Math.ceil(queueLength / this.scaleThreshold);
      const boundedWorkerCount = Math.max(
        this.minWorkers,
        Math.min(idealWorkerCount, this.maxWorkers)
      );
      
      // Scale up or down as needed
      if (boundedWorkerCount > workerCount) {
        console.log(`Scaling up from ${workerCount} to ${boundedWorkerCount} workers`);
        for (let i = workerCount; i < boundedWorkerCount; i++) {
          await this.addWorker();
        }
      } else if (boundedWorkerCount < workerCount) {
        console.log(`Scaling down from ${workerCount} to ${boundedWorkerCount} workers`);
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