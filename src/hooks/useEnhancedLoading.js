// src/hooks/useEnhancedLoading.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { backgroundProcessor } from '../services/backgroundProcessor';

const useEnhancedLoading = (options = {}) => {
  const {
    enableBackgroundProcessing = true,
    enableProgressTracking = true,
    enableEmailNotifications = true,
    autoMinimizeThreshold = 30000, // 30 seconds
    enableRetry = true,
    maxRetries = 3
  } = options;

  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    progress: 0,
    stage: 'starting',
    estimatedTime: null,
    startTime: null,
    error: null,
    canCancel: false,
    canRunInBackground: false,
    backgroundJobs: [],
    retryCount: 0
  });

  const [showBackgroundOption, setShowBackgroundOption] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const backgroundThresholdRef = useRef(null);
  const currentOperationRef = useRef(null);

  // Stage progression mapping (stable via ref to avoid triggering hook deps)
  const stageProgressionsRef = useRef({
    outline_generation: [
      { stage: 'analyzing', progress: 15, duration: 4000 },
      { stage: 'generating_outline', progress: 45, duration: 12000 },
      { stage: 'finalizing', progress: 75, duration: 3000 },
      { stage: 'completed', progress: 100, duration: 1000 }
    ],
    resource_generation: [
      { stage: 'analyzing', progress: 10, duration: 3000 },
      { stage: 'creating_content', progress: 35, duration: 18000 },
      { stage: 'formatting_resources', progress: 65, duration: 12000 },
      { stage: 'finalizing', progress: 85, duration: 4000 },
      { stage: 'completed', progress: 100, duration: 1000 }
    ]
  });

  // Simulate progress based on operation type
  const simulateProgress = useCallback((operationType) => {
    const progression = stageProgressionsRef.current[operationType] || stageProgressionsRef.current.resource_generation;
    let currentStageIndex = 0;

    const advanceStage = () => {
      if (currentStageIndex >= progression.length) return;

      const currentStageInfo = progression[currentStageIndex];
      
      setLoadingState(prev => ({
        ...prev,
        stage: currentStageInfo.stage,
        progress: currentStageInfo.progress
      }));

      if (currentStageIndex < progression.length - 1) {
        currentStageIndex++;
        setTimeout(advanceStage, currentStageInfo.duration);
      }
    };

    // Start progression after initial delay
    setTimeout(advanceStage, 1000);
  }, []);

  // Start loading with enhanced progress tracking
  const startLoading = useCallback((operationType = 'resource_generation', estimatedDuration = null, context = {}) => {
    const startTime = Date.now();
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      stage: 'starting',
      estimatedTime: estimatedDuration,
      startTime,
      error: null,
      canCancel: true,
      canRunInBackground: enableBackgroundProcessing,
      backgroundJobs: backgroundProcessor.getActiveJobs(),
      retryCount: 0
    });

    // Store current operation for progress tracking
    currentOperationRef.current = {
      type: operationType,
      startTime,
      estimatedDuration,
      context
    };

    // Start progress simulation if enabled
    if (enableProgressTracking) {
      simulateProgress(operationType);
    }

    // Set background option threshold
    if (enableBackgroundProcessing && autoMinimizeThreshold) {
      backgroundThresholdRef.current = setTimeout(() => {
        setShowBackgroundOption(true);
      }, autoMinimizeThreshold);
    }
  }, [enableBackgroundProcessing, enableProgressTracking, autoMinimizeThreshold, simulateProgress]);


  // Stop loading
  const stopLoading = useCallback((success = true, error = null) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: success ? 100 : prev.progress,
      stage: success ? 'completed' : 'failed',
      error,
      canCancel: false
    }));

    setShowBackgroundOption(false);
    currentOperationRef.current = null;

    // Clear background threshold timer
    if (backgroundThresholdRef.current) {
      clearTimeout(backgroundThresholdRef.current);
      backgroundThresholdRef.current = null;
    }
  }, []);

  // Handle cancellation
  const handleCancel = useCallback(() => {
    if (currentOperationRef.current && currentOperationRef.current.backgroundJobId) {
      backgroundProcessor.cancelJob(currentOperationRef.current.backgroundJobId);
    }
    
    stopLoading(false, 'Operation cancelled by user');
  }, [stopLoading]);

  // Handle background processing
  const handleRunInBackground = useCallback(async (email = null) => {
    if (!currentOperationRef.current) return;

    try {
      const emailToUse = email || userEmail;
      
      if (!emailToUse && enableEmailNotifications) {
        throw new Error('Email address required for background processing');
      }

      // Move current operation to background
      const jobResult = await backgroundProcessor.startBackgroundJob({
        operation_type: currentOperationRef.current.type,
        started_at: currentOperationRef.current.startTime,
        ...currentOperationRef.current.context
      }, {
        email: emailToUse,
        enablePolling: true
      });

      // Update current operation with job ID
      currentOperationRef.current.backgroundJobId = jobResult.jobId;

      // Update loading state but keep card visible by staying in loading=true with a 'background' stage
      setLoadingState(prev => ({
        ...prev,
        isLoading: true,
        stage: 'background',
        canCancel: false,
        backgroundJobs: [...prev.backgroundJobs, {
          id: jobResult.jobId,
          status: 'queued',
          progress: 0,
          email: emailToUse,
          estimatedTime: jobResult.estimatedDuration
        }]
      }));

      setShowBackgroundOption(false);
      
      return jobResult;
    } catch (error) {
      console.error('Error starting background processing:', error);
      setLoadingState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  }, [userEmail, enableEmailNotifications]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (!enableRetry || loadingState.retryCount >= maxRetries) {
      return false;
    }

    setLoadingState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null
    }));

    return true;
  }, [enableRetry, maxRetries, loadingState.retryCount]);

  // Update background jobs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const activeJobs = backgroundProcessor.getActiveJobs();
      setLoadingState(prev => ({
        ...prev,
        backgroundJobs: activeJobs
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (backgroundThresholdRef.current) {
        clearTimeout(backgroundThresholdRef.current);
      }
    };
  }, []);

  return {
    loadingState,
    showBackgroundOption,
    userEmail,
    setUserEmail,
    startLoading,
    stopLoading,
    handleCancel,
    handleRunInBackground,
    handleRetry,
    // Convenience methods
    isLoading: loadingState.isLoading,
    progress: loadingState.progress,
    stage: loadingState.stage,
    error: loadingState.error,
    canRetry: enableRetry && loadingState.retryCount < maxRetries && !!loadingState.error,
    backgroundJobs: loadingState.backgroundJobs
  };
};

export default useEnhancedLoading;