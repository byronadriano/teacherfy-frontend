// src/services/backgroundProcessor.js
import { config } from '../utils/config';
import { presentationService } from './presentation';

class BackgroundProcessor {
  constructor() {
    this.activeJobs = new Map();
    this.jobCallbacks = new Map();
    this.pollingInterval = 3000; // 3 seconds
  }

  /**
   * Start a background job for resource generation
   */
  async startBackgroundJob(jobData, options = {}) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await fetch(`${config.apiUrl}/generate/background`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          job_id: jobId,
          notification_email: options.email,
          estimated_duration: this.estimateDuration(jobData),
          client_callback_url: options.callbackUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start background job: ${response.status}`);
      }

      const result = await response.json();
      
      const job = {
        id: jobId,
        status: 'queued',
        progress: 0,
        startTime: Date.now(),
        estimatedDuration: this.estimateDuration(jobData),
        resourceTypes: jobData.resource_types || ['Presentation'],
        email: options.email,
        ...result
      };

      this.activeJobs.set(jobId, job);
      
      // Start polling for this job
      if (options.enablePolling !== false) {
        this.startPolling(jobId);
      }

      return {
        jobId,
        estimatedDuration: job.estimatedDuration,
        canRunInBackground: true
      };
    } catch (error) {
      console.error('Error starting background job:', error);
      throw error;
    }
  }

  /**
   * Estimate duration based on job complexity
   */
  estimateDuration(jobData) {
    const baseTime = 30; // 30 seconds base
    const resourceCount = Array.isArray(jobData.resource_types) ? jobData.resource_types.length : 1;
    const contentLength = jobData.structured_content?.length || 5;
    
    // More resources and longer content = longer processing time
    const estimatedSeconds = baseTime + (resourceCount * 15) + (contentLength * 2);
    
    return Math.min(estimatedSeconds, 300); // Cap at 5 minutes
  }

  /**
   * Start polling for job status
   */
  async startPolling(jobId) {
    const pollJob = async () => {
      try {
        const job = this.activeJobs.get(jobId);
        if (!job || job.status === 'completed' || job.status === 'failed') {
          return;
        }

        const status = await this.checkJobStatus(jobId);
        this.updateJobStatus(jobId, status);

        if (status.status === 'completed' || status.status === 'failed') {
          this.triggerCallbacks(jobId, status);
        } else {
          // Continue polling
          setTimeout(pollJob, this.pollingInterval);
        }
      } catch (error) {
        console.error(`Error polling job ${jobId}:`, error);
        this.updateJobStatus(jobId, { status: 'failed', error: error.message });
        this.triggerCallbacks(jobId, { status: 'failed', error: error.message });
      }
    };

    setTimeout(pollJob, this.pollingInterval);
  }

  /**
   * Check job status with server
   */
  async checkJobStatus(jobId) {
    const response = await fetch(`${config.apiUrl}/generate/status/${jobId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check job status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Update job status in memory
   */
  updateJobStatus(jobId, statusUpdate) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      Object.assign(job, statusUpdate);
      this.activeJobs.set(jobId, job);
    }
  }

  /**
   * Register callback for job completion
   */
  onJobComplete(jobId, callback) {
    if (!this.jobCallbacks.has(jobId)) {
      this.jobCallbacks.set(jobId, []);
    }
    this.jobCallbacks.get(jobId).push(callback);
  }

  /**
   * Trigger callbacks when job completes
   */
  triggerCallbacks(jobId, result) {
    const callbacks = this.jobCallbacks.get(jobId) || [];
    callbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Error in job callback:', error);
      }
    });
    
    // Cleanup
    this.jobCallbacks.delete(jobId);
    setTimeout(() => {
      this.activeJobs.delete(jobId);
    }, 300000); // Keep job data for 5 minutes after completion
  }

  /**
   * Get job status
   */
  getJobStatus(jobId) {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all active jobs
   */
  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId) {
    try {
      const response = await fetch(`${config.apiUrl}/generate/cancel/${jobId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        this.updateJobStatus(jobId, { status: 'cancelled' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Fallback to synchronous generation
   */
  async fallbackToSync(formState, contentState, resourceTypes) {
    console.log('Falling back to synchronous generation');
    return await presentationService.generateMultiResource(formState, contentState, resourceTypes);
  }
}

// Export singleton instance
export const backgroundProcessor = new BackgroundProcessor();
export default backgroundProcessor;