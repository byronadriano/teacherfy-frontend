// Place this file at src/pages/LessonBuilder/components/resources/ResourceManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import { Download, RefreshCw } from 'lucide-react';
import ResourceCard from './ResourceCard';

const ResourceManager = ({ 
  formState,
  contentState,
  resourceStatus = {},
  isLoading,
  onGenerateResource,
  downloadLimit = 5,
  isPremium = false,
  downloadsRemaining = 5
}) => {
  const [resourcesWithStatus, setResourcesWithStatus] = useState([]);
  
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
    
    // Create status objects for each resource
    const statusObjects = resourceTypes.map(type => {
      const hasContent = contentState.generatedResources && 
                        contentState.generatedResources[type] && 
                        contentState.generatedResources[type].length > 0;
                        
      const currentStatus = resourceStatus[type] || {};
      
      return {
        resourceType: type,
        status: currentStatus.status || (hasContent ? 'success' : 'pending'),
        message: currentStatus.message || '',
        hasContent
      };
    });
    
    setResourcesWithStatus(statusObjects);
  }, [formState.resourceType, contentState.generatedResources, resourceStatus]);

  // Handle generating a specific resource
  const handleGenerateResource = (resourceType) => {
    // Call the parent handler with the specific resource
    onGenerateResource(resourceType);
  };
  
  // Handle generating all resources
  const handleGenerateAll = () => {
    onGenerateResource();
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
  const reachedLimit = !isPremium && downloadsRemaining <= 0;

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
              color: '#1e293b',
              mb: 1
            }}
          >
            Your Resources
          </Typography>
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '0.875rem'
            }}
          >
            {resourcesWithStatus.length > 0 
              ? `You've selected ${resourcesWithStatus.length} resource${resourcesWithStatus.length !== 1 ? 's' : ''} for your lesson`
              : 'Select resources for your lesson'}
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
                : 'You have reached your daily download limit. Upgrade to Premium for unlimited downloads.'}
            </Alert>
          </Box>
        )}
        
        {/* Resources list */}
        <Box sx={{ p: 3 }}>
          {resourcesWithStatus.map(resource => (
            <ResourceCard
              key={resource.resourceType}
              resourceType={resource.resourceType}
              status={resource.status}
              message={resource.message}
              onGenerate={() => handleGenerateResource(resource.resourceType)}
              isDisabled={reachedLimit || isGenerating}
            />
          ))}
          
          {resourcesWithStatus.length === 0 && (
            <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
              No resources selected. Select resource types from the filters above.
            </Typography>
          )}
        </Box>
        
        {/* Action buttons */}
        {resourcesWithStatus.length > 0 && (
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
              disabled={reachedLimit || isGenerating}
              startIcon={isGenerating ? null : <Download />}
              onClick={handleGenerateAll}
              sx={{
                py: 1.5
              }}
            >
              {isGenerating ? 'Generating...' : (
                allGenerated 
                  ? 'Download All Resources' 
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