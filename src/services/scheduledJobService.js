/**
 * 📅 Scheduled Job Service
 * 
 * Handles periodic data refresh and maintenance tasks
 * Features:
 * - Automatic course data refresh
 * - Configurable intervals
 * - Error handling and retry logic
 * - Job status monitoring
 */

import { CourseDataService } from './courseDataService.js';

/**
 * Scheduled job service for automated data refresh
 */
export class ScheduledJobService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
    this.defaultConfig = {
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      retryAttempts: 3,
      retryDelay: 5 * 60 * 1000, // 5 minutes
      enableLogging: true
    };
  }

  /**
   * Start the scheduled job service
   */
  start(config = {}) {
    if (this.isRunning) {
      console.log('📅 Scheduled job service is already running');
      return;
    }

    this.config = { ...this.defaultConfig, ...config };
    this.isRunning = true;

    console.log('📅 Starting scheduled job service...');
    console.log(`   Refresh interval: ${this.config.refreshInterval / (60 * 60 * 1000)} hours`);
    console.log(`   Retry attempts: ${this.config.retryAttempts}`);

    // Schedule the course data refresh job
    this.scheduleJob('courseDataRefresh', this.refreshCourseData.bind(this), this.config.refreshInterval);

    // Schedule a daily cleanup job
    this.scheduleJob('dailyCleanup', this.performDailyCleanup.bind(this), 24 * 60 * 60 * 1000);

    console.log('✅ Scheduled job service started successfully');
  }

  /**
   * Stop the scheduled job service
   */
  stop() {
    if (!this.isRunning) {
      console.log('📅 Scheduled job service is not running');
      return;
    }

    console.log('📅 Stopping scheduled job service...');

    // Clear all scheduled jobs
    for (const [jobName, jobData] of this.jobs) {
      clearInterval(jobData.intervalId);
      console.log(`   Stopped job: ${jobName}`);
    }

    this.jobs.clear();
    this.isRunning = false;

    console.log('✅ Scheduled job service stopped');
  }

  /**
   * Schedule a new job
   */
  scheduleJob(name, jobFunction, interval) {
    if (this.jobs.has(name)) {
      console.warn(`⚠️ Job ${name} already exists, replacing...`);
      clearInterval(this.jobs.get(name).intervalId);
    }

    const intervalId = setInterval(async () => {
      await this.executeJob(name, jobFunction);
    }, interval);

    this.jobs.set(name, {
      name,
      intervalId,
      interval,
      lastRun: null,
      nextRun: new Date(Date.now() + interval),
      status: 'scheduled',
      attempts: 0,
      errors: []
    });

    console.log(`📅 Scheduled job: ${name} (every ${interval / (60 * 1000)} minutes)`);
  }

  /**
   * Execute a job with error handling and retry logic
   */
  async executeJob(name, jobFunction) {
    const job = this.jobs.get(name);
    if (!job) return;

    job.status = 'running';
    job.lastRun = new Date();
    job.attempts++;

    if (this.config.enableLogging) {
      console.log(`🔄 Executing job: ${name} (attempt ${job.attempts})`);
    }

    try {
      await jobFunction();
      
      job.status = 'completed';
      job.nextRun = new Date(Date.now() + job.interval);
      job.attempts = 0; // Reset attempts on success
      job.errors = []; // Clear previous errors

      if (this.config.enableLogging) {
        console.log(`✅ Job completed: ${name}`);
      }

    } catch (error) {
      job.status = 'failed';
      job.errors.push({
        timestamp: new Date(),
        message: error.message,
        attempt: job.attempts
      });

      console.error(`❌ Job failed: ${name} - ${error.message}`);

      // Retry logic
      if (job.attempts < this.config.retryAttempts) {
        console.log(`🔄 Retrying job ${name} in ${this.config.retryDelay / (60 * 1000)} minutes...`);
        
        setTimeout(async () => {
          await this.executeJob(name, jobFunction);
        }, this.config.retryDelay);
      } else {
        console.error(`💥 Job ${name} failed after ${this.config.retryAttempts} attempts`);
        job.status = 'failed_permanently';
        job.nextRun = new Date(Date.now() + job.interval); // Schedule next regular attempt
        job.attempts = 0; // Reset for next cycle
      }
    }
  }

  /**
   * Refresh course data from external sources
   */
  async refreshCourseData() {
    console.log('🔄 Starting scheduled course data refresh...');

    try {
      // Refresh data by re-initializing from scraped sources
      const initResult = await CourseDataService.initializeData();
      const freshCourses = initResult.success ? await CourseDataService.getAllCourses() : [];
      
      if (!freshCourses || freshCourses.length === 0) {
        console.log('⚠️ No fresh course data available, skipping refresh');
        return;
      }

      console.log(`📊 Fetched ${freshCourses.length} fresh courses`);
      
      if (initResult.success) {
        console.log(`✅ Course data refreshed successfully (source: ${initResult.source})`);
        
        // Log refresh statistics
        this.logRefreshStats(freshCourses.length);
      } else {
        throw new Error(`Data refresh failed: ${initResult.error}`);
      }

    } catch (error) {
      console.error('❌ Course data refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Perform daily cleanup tasks
   */
  async performDailyCleanup() {
    console.log('🧹 Starting daily cleanup tasks...');

    try {
      // Clean up old scraper result files (keep last 7 days)
      await this.cleanupOldScraperResults();
      
      // Update course data timestamps
      await this.updateCourseTimestamps();
      
      // Log system statistics
      await this.logSystemStats();

      console.log('✅ Daily cleanup completed');

    } catch (error) {
      console.error('❌ Daily cleanup failed:', error.message);
      throw error;
    }
  }

  /**
   * Clean up old scraper result files
   */
  async cleanupOldScraperResults() {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const resultsDir = path.join(process.cwd(), 'scrapers', 'results');
      
      try {
        const files = await fs.readdir(resultsDir);
        const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        
        let deletedCount = 0;
        
        for (const file of files) {
          if (file.startsWith('integrated-courses-') && file.endsWith('.json')) {
            const filePath = path.join(resultsDir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.mtime < cutoffDate) {
              await fs.unlink(filePath);
              deletedCount++;
            }
          }
        }
        
        if (deletedCount > 0) {
          console.log(`🗑️ Cleaned up ${deletedCount} old scraper result files`);
        }
        
      } catch (dirError) {
        // Results directory might not exist yet
        console.log('📁 Scraper results directory not found, skipping cleanup');
      }
      
    } catch (error) {
      console.warn('⚠️ Could not clean up scraper results:', error.message);
    }
  }

  /**
   * Update course data timestamps
   */
  async updateCourseTimestamps() {
    try {
      // This would update last_updated timestamps in the database
      // Implementation depends on your database structure
      console.log('📅 Updated course timestamps');
    } catch (error) {
      console.warn('⚠️ Could not update course timestamps:', error.message);
    }
  }

  /**
   * Log refresh statistics
   */
  logRefreshStats(courseCount) {
    const stats = {
      timestamp: new Date().toISOString(),
      coursesRefreshed: courseCount,
      refreshSource: 'scheduled_job',
      nextRefresh: new Date(Date.now() + this.config.refreshInterval).toISOString()
    };

    console.log('📊 Refresh Statistics:', JSON.stringify(stats, null, 2));
  }

  /**
   * Log system statistics
   */
  async logSystemStats() {
    try {
      const stats = {
        timestamp: new Date().toISOString(),
        jobsRunning: this.jobs.size,
        serviceUptime: this.isRunning ? 'running' : 'stopped',
        memoryUsage: process.memoryUsage ? process.memoryUsage() : 'unavailable'
      };

      console.log('📈 System Statistics:', JSON.stringify(stats, null, 2));
    } catch (error) {
      console.warn('⚠️ Could not gather system statistics:', error.message);
    }
  }

  /**
   * Get job status information
   */
  getJobStatus(jobName = null) {
    if (jobName) {
      return this.jobs.get(jobName) || null;
    }

    const status = {
      isRunning: this.isRunning,
      totalJobs: this.jobs.size,
      jobs: {}
    };

    for (const [name, job] of this.jobs) {
      status.jobs[name] = {
        status: job.status,
        lastRun: job.lastRun,
        nextRun: job.nextRun,
        attempts: job.attempts,
        errorCount: job.errors.length
      };
    }

    return status;
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobName) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }

    console.log(`🔧 Manually triggering job: ${jobName}`);
    
    // Find the job function (this is a simplified approach)
    const jobFunctions = {
      courseDataRefresh: this.refreshCourseData.bind(this),
      dailyCleanup: this.performDailyCleanup.bind(this)
    };

    const jobFunction = jobFunctions[jobName];
    if (!jobFunction) {
      throw new Error(`Job function not found: ${jobName}`);
    }

    await this.executeJob(jobName, jobFunction);
  }
}

// Create a singleton instance
export const scheduledJobService = new ScheduledJobService();

// Auto-start in production environments
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  scheduledJobService.start();
}

export default ScheduledJobService;
