// src/components/form/CustomizationForm.jsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, Switch, Paper, Button, Typography, CircularProgress, Fade, Alert } from '@mui/material';
import SleekProgress from '../loading/SleekProgress';
import { useTheme } from '@mui/material/styles';
import { Rocket, Sparkles, AlertCircle, Clock } from 'lucide-react';
// Removed old ProgressIndicator to avoid duplicate progress UIs; SleekProgress is the single source of truth now.

const LimitReachedPopup = ({ show, resetTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!show) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const reset = new Date(resetTime);
      const diff = reset - now;

      if (diff <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [show, resetTime]);

  if (!show) return null;

  return (
    <Fade in={show}>
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          bgcolor: '#1f2937',
          color: 'white',
          px: 3,
          py: 2,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minWidth: '280px',
          maxWidth: '400px',
          fontSize: '0.875rem',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '8px 8px 0 8px',
            borderColor: '#1f2937 transparent transparent transparent'
          }
        }}
      >
        <Clock size={16} />
        <Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
            Daily limit reached
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
            {timeLeft ? `Resets in ${timeLeft}` : 'Come back tomorrow'}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

const CustomizationForm = ({ 
  value,
  onChange,
  isExample,
  setIsExample,
  onSubmit,
  isLoading,
  error,
  rateLimitInfo = null,
  subscriptionState = { isPremium: false, generationsLeft: 5 },
  resetTime = null,
  enhancedLoading = null
}) => {
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [bgLoading, setBgLoading] = useState(false);
  const [bgError, setBgError] = useState('');
  const [bgSuccess, setBgSuccess] = useState('');
  const isLimitReached = !subscriptionState.isPremium && subscriptionState.generationsLeft <= 0;
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Check if limit is reached and not using example
    if (isLimitReached && !isExample) {
      setShowLimitPopup(true);
      // Hide popup after 3 seconds
      setTimeout(() => setShowLimitPopup(false), 3000);
      return;
    }
    
    try {
      console.log('Form submitted with value:', value);
      await onSubmit();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleExampleToggle = (checked) => {
    if (checked) {
      setShowLimitPopup(false); // Hide popup when switching to example
    }
    setIsExample(checked);
  };

  // Calculate the next reset time (tomorrow at midnight)
  const getResetTime = () => {
    if (resetTime) return resetTime;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative', // For popup positioning
      }}
    >
      {/* Limit Reached Popup */}
      <LimitReachedPopup 
        show={showLimitPopup} 
        resetTime={getResetTime()}
      />

      <Box sx={{ p: 0 }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          value={value}
          onChange={onChange}
          placeholder="Provide important details to customize your creation..."
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#FFFFFF',
              fontSize: '1rem',
              lineHeight: '1.5',
              padding: '16px 20px',
              border: 'none',
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' }
            },
            '& .MuiOutlinedInput-input': {
              '&::placeholder': {
                color: '#94A3B8',
                opacity: 1
              }
            }
          }}
        />
      </Box>

      {/* Display rate limit message if rate limit exceeded */}
      {error === 'RATE_LIMIT_EXCEEDED' && (
        <Box sx={{ 
          px: 3, 
          py: 2.5, 
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderLeft: '4px solid #64748b'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ 
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Clock size={16} />
                Generation Limit Reached
              </Typography>
              
              <Typography sx={{ 
                color: '#64748b',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                mb: 1.5
              }}>
                You've used all <strong>{rateLimitInfo?.hourlyLimit || 3}</strong> of your hourly generations.
                {rateLimitInfo?.resetTime && (
                  <> Your limit resets in <strong>{rateLimitInfo.resetTime}</strong>.</>
                )}
              </Typography>

              <Box sx={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                p: 2,
                mb: 2
              }}>
                <Typography sx={{ 
                  fontSize: '0.8rem',
                  color: '#374151',
                  fontWeight: 500,
                  mb: 1
                }}>
                  Free Plan Limits:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    • 3 generations per hour
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    • 10 generations per month
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px',
                p: 2
              }}>
                <Typography sx={{ 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  mb: 1
                }}>
                  ✨ Upgrade to Premium
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', opacity: 0.9, mb: 1.5 }}>
                  Unlimited generations • Priority support • Advanced features
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                  onClick={() => {
                    window.open('https://buy.stripe.com/9AQbJAfWy9oMduU6oo', '_blank');
                  }}
                >
                  Upgrade Now
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Display other errors normally */}
      {error && error !== 'RATE_LIMIT_EXCEEDED' && (
        <Box sx={{ 
          px: 3, 
          py: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          backgroundColor: '#FEF2F2',
          borderTop: '1px solid #FECACA'
        }}>
          <AlertCircle size={18} color="#DC2626" />
          <Typography sx={{ 
            color: '#DC2626',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            {error.includes('Unexpected error') 
              ? 'Service temporarily unavailable. Please try again later.' 
              : error}
          </Typography>
          
          {(error.includes('generation limit') || error.includes('upgrade')) && (
            <Button 
              variant="outlined" 
              size="small"
              sx={{ 
                ml: 2, 
                borderColor: '#DC2626', 
                color: '#DC2626',
                '&:hover': {
                  backgroundColor: '#FEE2E2',
                  borderColor: '#DC2626'
                }
              }}
              onClick={() => window.open('/pricing', '_blank')}
            >
              Upgrade Account
            </Button>
          )}
        </Box>
      )}

      {/* Enhanced Progress Indicator */}
      {enhancedLoading?.isLoading && (
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
          <SleekProgress
            isLoading={enhancedLoading.isLoading}
            progress={enhancedLoading.progress}
            stage={enhancedLoading.stage}
            estimatedTime={enhancedLoading.loadingState?.estimatedTime}
            elapsed={enhancedLoading.loadingState?.startTime ? Math.max(0, Math.floor((Date.now() - enhancedLoading.loadingState.startTime) / 1000)) : 0}
            onRunInBackground={async () => {
              const email = (enhancedLoading.userEmail || '').trim();
              if (!email) return;
              setBgError('');
              setBgSuccess('');
              setBgLoading(true);
              try {
                await enhancedLoading.handleRunInBackground?.(email);
                setBgSuccess('Background job started. We will email you when it is ready.');
              } catch (err) {
                setBgError(err?.message || 'Failed to start background job.');
              } finally {
                setBgLoading(false);
              }
            }}
            userEmail={enhancedLoading.userEmail}
            setUserEmail={enhancedLoading.setUserEmail}
            bgError={bgError}
            bgLoading={bgLoading}
            accentColor={theme.palette.primary.main}
          />
          {/* Legacy background handoff block removed; use SleekProgress Notify me collapse instead. */}

          {/* Feedback messages for background actions */}
          {bgError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {bgError}
            </Alert>
          )}

          {bgSuccess && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {bgSuccess}
            </Alert>
          )}

          {/* Old ProgressIndicator removed; SleekProgress above is the single progress UI. */}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2.5,
          py: 1.5,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1
        }}>
          <Sparkles size={16} style={{ color: '#2563eb' }} />
          <span style={{ 
            color: '#1E293B',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            Try Example
          </span>
          <Switch
            checked={isExample}
            onChange={(e) => handleExampleToggle(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#166534'
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#22C55E'
              }
            }}
          />
        </Box>

        <Button 
          type="submit"
          disabled={isLoading || (isLimitReached && !isExample)}
          variant="contained"
          endIcon={!isLoading && <Rocket size={20} />}
          sx={{
            backgroundColor: isLimitReached && !isExample ? '#94A3B8' : '#035073',
            color: '#FFFFFF',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            padding: isLoading ? '6px 20px' : '6px 16px',
            minWidth: '120px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: isLimitReached && !isExample ? '#94A3B8' : 'rgb(45, 147, 249)',
              transform: isLimitReached && !isExample ? 'none' : 'translateY(-2px)',
              boxShadow: isLimitReached && !isExample ? 'none' : '0 4px 12px rgba(69, 162, 244, 0.1)'
            },
            '&.Mui-disabled': {
              backgroundColor: isLoading ? '#035073' : '#94A3B8',
              color: '#FFFFFF',
              boxShadow: 'none',
              transform: 'none'
            },
            '&::after': isLoading ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              animation: 'loading-shimmer 1.5s infinite'
            } : {}
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Creating...</span>
            </Box>
          ) : isLimitReached && !isExample ? (
            'Limit Reached'
          ) : (
            'Create'
          )}
        </Button>
      </Box>

  {/* Add keyframes for the shimmer effect */}
  <style>{`
        @keyframes loading-shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </Paper>
  );
};

export default CustomizationForm;