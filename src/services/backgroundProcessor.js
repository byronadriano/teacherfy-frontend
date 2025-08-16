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
      // Use the new background generation endpoint
      const backgroundEndpoint = `${config.apiUrl}/generate/background`;
      
      console.log('🔄 Starting background job:', {
        jobId,
        operation_type: jobData.operation_type,
        resource_types: jobData.resource_types,
        email: options.email,
        include_images: Boolean(jobData.form_state?.includeImages || jobData.include_images),
        structured_content_length: jobData.structured_content?.length || 0,
        form_state: jobData.form_state
      });
      
      const response = await fetch(backgroundEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          operation_type: jobData.operation_type || 'resource_generation',
          notification_email: options.email,
          resource_types: jobData.resource_types || ['Presentation'],
          structured_content: jobData.structured_content || [],
          // Include form data from the context
          grade_level: jobData.form_state?.gradeLevel || jobData.grade_level || '',
          subject: jobData.form_state?.subjectFocus || jobData.subject || '',
          topic: jobData.form_state?.lessonTopic || jobData.topic || '',
          language: jobData.form_state?.language || jobData.language || 'English',
          custom_prompt: jobData.form_state?.customPrompt || jobData.custom_prompt || '',
          num_slides: parseInt(jobData.form_state?.numSlides || jobData.num_slides || 5, 10),
          include_images: Boolean(jobData.form_state?.includeImages || jobData.include_images),
          selected_standards: jobData.form_state?.selectedStandards || jobData.selected_standards || [],
          estimated_duration: this.estimateDuration(jobData),
          background_mode: true
        })
      });

      if (response.status === 404) {
        // Background endpoint not available, fall back to regular processing
        console.warn('Background processing endpoint not available, falling back to regular processing');
        throw new Error('FALLBACK_TO_REGULAR');
      }

      if (!response.ok) {
        let details = '';
        try {
          details = await response.text();
        } catch {}
        throw new Error(`Failed to start background job: ${response.status} ${response.statusText}${details ? ` - ${details}` : ''}`);
      }

      const result = await response.json();
      
      const job = {
        id: jobId,
        status: result.status || 'queued',
        progress: result.progress || 0,
        startTime: Date.now(),
        estimatedDuration: this.estimateDuration(jobData),
        resourceTypes: jobData.resource_types || ['Presentation'],
        email: options.email,
        message: result.message || 'Job queued successfully',
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
        canRunInBackground: true,
        status: job.status,
        message: job.message
      };
    } catch (error) {
      console.error('Error starting background job:', error);
      
      if (error.message === 'FALLBACK_TO_REGULAR') {
        // Return indication that background processing is not available
        return {
          canRunInBackground: false,
          fallbackReason: 'Background processing not supported by server',
          shouldUseFallback: true
        };
      }
      
      throw error;
    }
  }

  /**
   * Fallback to regular generation when background processing is unavailable
   */
  async fallbackToRegularGeneration(jobData, options = {}) {
    try {
      console.log('Using fallback regular generation method', {
        hasOptions: Object.keys(options).length > 0
      });
      
      // Use the regular presentation service for generation
      const result = await presentationService.generateMultiResource(
        jobData,
        { structuredContent: jobData.structured_content },
        jobData.resource_types || ['Presentation']
      );
      
      return {
        canRunInBackground: false,
        result,
        completed: true,
        fallbackUsed: true,
        message: 'Generated using standard processing (background mode not available)'
      };
    } catch (error) {
      console.error('Fallback generation failed:', error);
      throw error;
    }
  }

  /**
   * Estimate duration based on job complexity
   */
  estimateDuration(jobData) {
    const resourceCount = Array.isArray(jobData.resource_types) ? jobData.resource_types.length : 1;
    const contentLength = jobData.structured_content?.length || 5;
    
    if (resourceCount === 1) {
      // Single resource: 45-90 seconds depending on complexity
      const baseTime = 45;
      const complexityFactor = Math.min(contentLength * 3, 45); // 3s per content item, max 45s
      return baseTime + complexityFactor;
    } else {
      // Multiple resources: Sequential processing model
      // Research phase: ~30 seconds
      // Each resource: ~80 seconds (based on actual backend logs)
      const researchTime = 30;
      const perResourceTime = 80;
      const complexityMultiplier = Math.max(1, contentLength / 10); // Slight increase for complex content
      
      const totalTime = researchTime + (resourceCount * perResourceTime * complexityMultiplier);
      
      // Cap at 8 minutes for multiple resources (was too restrictive at 5 minutes)
      return Math.min(totalTime, 480);
    }
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
        
        // Stop polling for this job
        this.triggerCallbacks(jobId, { status: 'cancelled', message: 'Job cancelled by user' });
        return true;
      } else {
        return false;
      }
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