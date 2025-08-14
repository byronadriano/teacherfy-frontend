import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Download, RefreshCw } from 'lucide-react';
import ResourceCard from './ResourceCard';
import { analyticsService } from '../../../../services';

const ResourceManager = ({ 
  formState,
  contentState,
  resourceStatus = {},
  isLoading,
  onGenerateResource,
  downloadLimit = 5,
  isPremium = false,
  downloadsRemaining = 5,
  resetTime
}) => {
  const [resourcesWithStatus, setResourcesWithStatus] = useState([]);
  // Cooldown registry to dedupe rapid clicks per resource
  const [cooldowns, setCooldowns] = useState({});
  const [resetCountdown, setResetCountdown] = useState('');
  
  // Determine all resource types (from form state and generated resources)
  useEffect(() => {
    const resourceTypes = Array.isArray(formState.resourceType) 
      ? formState.resourceType 
      : (formState.resourceType ? [formState.resourceType] : []);
      
    // Add any additional resources from generatedResources that might not be in formState
    if (contentState.generatedResources) {
      Object.keys(contentState.generatedResources).forEach(type => {
        if (!resourceTypes.includes(type)) {
          resourceTypes.push(type);
        }
      });
    }
    
    // Create status objects for each resource - ensure uniqueness
    const uniqueResourceTypes = [...new Set(resourceTypes)]; // Remove duplicates
    
    const statusObjects = uniqueResourceTypes.map(type => {
      const hasContent = Boolean(
        contentState.generatedResources &&
        contentState.generatedResources[type] &&
        contentState.generatedResources[type].length > 0
      );

      const currentStatus = resourceStatus[type] || {};
      // Don't auto-mark success just because content exists; success means we actually have a blob to download.
      const status = currentStatus.status || 'pending';
      
      return {
        resourceType: type,
        status,
        message: currentStatus.message || '',
        hasContent
      };
    });
    
    setResourcesWithStatus(statusObjects);
  }, [formState.resourceType, contentState.generatedResources, resourceStatus]);

  // Live countdown until resetTime (if provided)
  useEffect(() => {
    if (!resetTime) {
      setResetCountdown('');
      return;
    }
    const target = new Date(resetTime).getTime();
    if (isNaN(target)) {
      setResetCountdown('');
      return;
    }
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      if (diff <= 0) {
        setResetCountdown('00:00:00');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const pad = (n) => n.toString().padStart(2, '0');
      setResetCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetTime]);

  // Handle generating a specific resource
  const handleGenerateResource = (resourceType) => {
    const now = Date.now();
    const last = cooldowns[resourceType] || 0;
    if (now - last < 1200) { // 1.2s cooldown
      return;
    }
    setCooldowns(prev => ({ ...prev, [resourceType]: now }));

    const status = resourceStatus[resourceType]?.status;
    const blob = resourceStatus[resourceType]?.blob;
    const contentType = resourceStatus[resourceType]?.contentType || '';

    // Block if at limit
    if (!isPremium && Number(downloadsRemaining) <= 0) {
      console.log('⚠️ Download limit reached, cannot generate new resource');
  analyticsService.trackActivity('generation_blocked_limit', { resourceType });
  return;
    }

    // If a generation is in progress for this type, ignore clicks
    if (status === 'generating') {
  return;
    }

    // If we have a finished blob, trigger download
    if (status === 'success' && blob && blob.size > 0) {
      console.log(`Resource ${resourceType} already generated, triggering download`);
      analyticsService.trackActivity('resource_download', { resourceType });
      
      try {
        // Create a fresh URL
        const url = window.URL.createObjectURL(blob);
        
        // Create and configure the download link
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Create a meaningful filename
        const topicSlug = formState?.lessonTopic 
          ? formState.lessonTopic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
          : 'lesson';
        
        let fileExt = '.docx';
        const ct = (contentType || '').toLowerCase();
        if (ct.includes('presentation')) fileExt = '.pptx';
        else if (ct.includes('wordprocessingml')) fileExt = '.docx';
        else if (ct.includes('pdf')) fileExt = '.pdf';
        else if (resourceType === 'Presentation') fileExt = '.pptx';
        
        a.download = `${topicSlug}_${resourceType.toLowerCase()}${fileExt}`;
        
        // Add to document and click
        document.body.appendChild(a);
        a.click();
        
        // Use a longer timeout before cleanup
        setTimeout(() => {
          try {
            window.URL.revokeObjectURL(url);
            if (document.body.contains(a)) {
              document.body.removeChild(a);
            }
          } catch (cleanupError) {
            console.warn('Error during cleanup:', cleanupError);
          }
          console.log(`✅ Download completed for ${resourceType}`);
        }, 3000);
        
        return; // Success - don't fall back to generation
      } catch (error) {
    console.error('❌ Error downloading resource:', error);
    // Fall back to regeneration if possible
    if (!isPremium && Number(downloadsRemaining) <= 0) return;
    analyticsService.trackActivity('resource_regenerate_after_download_error', { resourceType, error: String(error) });
    onGenerateResource([resourceType]);
    return;
      }
    } 
    
  // For resources that haven't been generated or blob is missing, trigger generation
  console.log(`🔄 Generating resource: ${resourceType}`);
  analyticsService.trackActivity('resource_generate', { resourceType });
  onGenerateResource([resourceType]);
  };
  
  // Handle generating all resources
  const handleGenerateAll = () => {
    // Extra safety: prevent generation when at limit, even if button state wasn't respected
    if (!isPremium && Number(downloadsRemaining) <= 0) {
      console.log('⚠️ Download limit reached, cannot generate all resources');
      analyticsService.trackActivity('generation_all_blocked_limit', {});
      return;
    }
    // Only generate resources that haven't been generated yet
    const pendingResources = resourcesWithStatus
      .filter(r => r.status !== 'success')
      .map(r => r.resourceType);
    
    if (pendingResources.length > 0) {
      analyticsService.trackActivity('resource_generate_all', { count: pendingResources.length, types: pendingResources });
      onGenerateResource(pendingResources);
    } else {
      // If all are already generated, just prompt to download them
      // No API calls needed
      console.log('All resources already generated, no API calls needed');
      analyticsService.trackActivity('resource_generate_all_nop', {});
    }
  };
  
  // Check if any resource has error status
  const hasErrors = resourcesWithStatus.some(r => r.status === 'error');
  
  // Check if all resources are generated
  const allGenerated = resourcesWithStatus.length > 0 && 
                      resourcesWithStatus.every(r => r.status === 'success');
  
  // Check if at least one resource is generated                    
  const someGenerated = resourcesWithStatus.some(r => r.status === 'success');
  
  // Check if any resource is currently being generated
  const isGenerating = isLoading || resourcesWithStatus.some(r => r.status === 'generating');
  
  // Check if we've reached the download limit
  const reachedLimit = !isPremium && Number(downloadsRemaining) <= 0;
  
  const ResetHint = () => (
    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
      {resetCountdown
        ? `Resets in ${resetCountdown}. `
        : 'You can try again when your daily limit resets. '}
      Upgrade for unlimited generations.
    </Typography>
  );

  // Create a unique resources array to prevent duplicates
  const uniqueResources = resourcesWithStatus.filter((item, index, self) => 
    index === self.findIndex((t) => t.resourceType === item.resourceType)
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          p: 3,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc'
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1e293b'
            }}
          >
            Your Resources
          </Typography>
        </Box>
        
        {/* Download limits warning */}
        {!isPremium && (
          <Box sx={{ px: 3, py: 2 }}>
            <Alert 
              severity={downloadsRemaining > 1 ? "info" : "warning"}
              sx={{ 
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              <AlertTitle>
                {downloadsRemaining > 0 
                  ? `You have ${downloadsRemaining} download${downloadsRemaining !== 1 ? 's' : ''} remaining today` 
                  : 'Download limit reached'}
              </AlertTitle>
              {downloadsRemaining > 0
                ? `Free accounts are limited to ${downloadLimit} downloads per day. Upgrade to Premium for unlimited downloads.`
                : (
                  <>
                    You have reached your daily download limit. Upgrade to Premium for unlimited downloads.
                    <ResetHint />
                  </>
                )}
            </Alert>
          </Box>
        )}
        
        {/* Resources list - Use uniqueResources to prevent duplicates */}
        <Box sx={{ p: 3 }}>
          {uniqueResources.map(resource => (
            <ResourceCard
              key={resource.resourceType}
              resourceType={resource.resourceType}
              status={resource.status}
              message={resource.message}
              onGenerate={() => handleGenerateResource(resource.resourceType)}
              isDisabled={reachedLimit || isGenerating}
            />
          ))}
          
          {uniqueResources.length === 0 && (
            <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
              No resources selected. Select resource types from the filters above.
            </Typography>
          )}
        </Box>
        
        {/* Action buttons */}
        {uniqueResources.length > 0 && (
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            bgcolor: '#f8fafc'
          }}>
            <Button
              variant="contained"
              fullWidth={true}
              disabled={reachedLimit || isGenerating || allGenerated}
              startIcon={isGenerating ? null : <Download />}
              onClick={handleGenerateAll}
              sx={{
                py: 1.5
              }}
            >
              {isGenerating ? 'Generating...' : (
                allGenerated 
                  ? 'All Resources Generated' 
                  : someGenerated 
                    ? 'Generate Remaining Resources' 
                    : 'Generate All Resources'
              )}
            </Button>
            
            {hasErrors && (
              <Button
                variant="outlined"
                fullWidth={true}
                disabled={isGenerating}
                startIcon={<RefreshCw size={18} />}
                onClick={handleGenerateAll}
                sx={{
                  py: 1.5
                }}
              >
                Retry Failed Resources
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResourceManager;