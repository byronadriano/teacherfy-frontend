// src/components/sidebar/Sidebar.jsx - FIXED with proper loading state
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Popover, Paper, Modal, CircularProgress } from '@mui/material';
import { 
  Stars, 
  Home,
  History,
  Crown,
  User
} from 'lucide-react';
import RecentsList from './RecentsList';
import UserSettingsModal from '../modals/UserSettingsModal';
import PricingModal from '../modals/PricingModal';
import Logo from '../../assets/images/Teacherfyoai.png';
import { useAuth } from '../../contexts/AuthContext';

const SIDEBAR_WIDTH_COLLAPSED = 68; // Slightly wider for better icon visibility

// Navigation items
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, action: 'home' },
  { id: 'history', label: 'History', icon: History, action: 'history', hasPopover: true }
];

const NavButton = ({ item, isActive, onClick, onMouseEnter, onMouseLeave }) => {
  const Icon = item.icon;
  
  return (
    <Button
      fullWidth
      onClick={() => onClick(item.action)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={item.label}
      title={item.label}
      sx={{
        width: '44px',
        height: '44px',
        minWidth: '44px',
        minHeight: '44px',
        p: 0,
        borderRadius: '12px',
        backgroundColor: isActive ? '#f0f4f8' : 'transparent',
        color: isActive ? '#2563eb' : '#64748b',
        transition: 'all 0.2s ease',
        mb: 1,
        '&:hover': {
          backgroundColor: '#f8fafc',
          color: '#374151'
        },
        '@media (max-width: 600px)': {
          minHeight: '48px',
          minWidth: '48px',
          '&:active': {
            transform: 'scale(0.95)',
            transition: 'transform 0.1s ease'
          }
        }
      }}
    >
      <Icon size={20} />
    </Button>
  );
};

const HistoryPopover = ({ open, anchorEl, onClose, onHistoryItemSelect }) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          width: '320px',
          maxHeight: '500px',
          ml: 1,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          '@media (max-width: 600px)': {
            width: 'calc(100vw - 80px)',
            maxWidth: '300px',
            maxHeight: '60vh'
          }
        }
      }}
    >
      <Paper elevation={0} sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ 
          maxHeight: '500px', 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: '4px',
          },
          '@media (max-width: 600px)': {
            maxHeight: '60vh',
            '-webkit-overflow-scrolling': 'touch'
          }
        }}>
          <RecentsList onSelectItem={onHistoryItemSelect} />
        </Box>
      </Paper>
    </Popover>
  );
};

const LoginModal = ({ open, onClose, onLoginClick, isLoading }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="login-modal"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 'calc(100vw - 32px)', sm: 400 },
          maxWidth: '400px',
          bgcolor: 'background.paper',
          borderRadius: '12px',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          '@media (max-width: 600px)': {
            p: 3,
            gap: 2
          }
        }}
      >
        <img
          src={Logo}
          alt="Teacherfy Logo"
          style={{ 
            width: '60px',
            height: '60px',
            borderRadius: '12px'
          }}
        />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Welcome to Teacherfy AI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to save your lessons and access your history
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={onLoginClick}
          disabled={isLoading}
          sx={{
            backgroundColor: '#4285f4',
            color: 'white',
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            minHeight: '48px',
            '&:hover': {
              backgroundColor: '#3367d6'
            },
            '&:disabled': {
              backgroundColor: '#94a3b8'
            }
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Signing in...</span>
            </Box>
          ) : (
            'Sign in with Google'
          )}
        </Button>
        
        <Button 
          onClick={onClose}
          variant="text"
          color="inherit"
          size="small"
          disabled={isLoading}
          sx={{
            minHeight: '44px'
          }}
        >
          Continue without signing in
        </Button>
      </Box>
    </Modal>
  );
};

const UserMenu = ({ user, onSettings, onLogout, isLoading }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (!isLoading) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        sx={{
          width: '48px',
          height: '48px',
          minWidth: '48px',
          minHeight: '48px',
          p: 0,
          borderRadius: '16px',
          backgroundColor: 'transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isLoading ? 0.7 : 1,
          position: 'relative',
          '&:hover': {
            backgroundColor: '#f8fafc',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.95)',
          },
          '@media (max-width: 600px)': {
            width: '52px',
            height: '52px',
            minHeight: '52px',
            minWidth: '52px',
            '&:hover': {
              transform: 'none',
            },
            '&:active': {
              transform: 'scale(0.95)',
              transition: 'transform 0.1s ease'
            }
          }
        }}
      >
        {isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : user ? (
          <Avatar 
            src={user.picture}
            alt={user.name}
            sx={{ 
              width: 36, 
              height: 36,
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {!user.picture && getUserInitials(user.name)}
          </Avatar>
        ) : (
          <User size={20} color="#64748b" />
        )}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: '240px',
            ml: 1,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            '@media (max-width: 600px)': {
              width: 'calc(100vw - 80px)',
              maxWidth: '280px'
            }
          }
        }}
      >
        <Paper elevation={0} sx={{ p: 0 }}>
          {/* User Info */}
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {user.picture ? (
                <Avatar 
                  src={user.picture}
                  alt={user.name}
                  sx={{ width: 40, height: 40 }}
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    backgroundColor: '#2563eb',
                    color: 'white'
                  }}
                >
                  {getUserInitials(user.name)}
                </Avatar>
              )}
              <Box>
                <Typography sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#1e293b',
                  lineHeight: 1.2
                }}>
                  {user.name}
                </Typography>
                <Typography sx={{ 
                  fontSize: '0.75rem',
                  color: '#64748b',
                  lineHeight: 1.2
                }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Menu Options */}
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              onClick={() => {
                onSettings();
                handleClose();
              }}
              sx={{
                justifyContent: 'flex-start',
                px: 2,
                py: 1.5,
                borderRadius: '8px',
                color: '#374151',
                textTransform: 'none',
                fontSize: '0.875rem',
                minHeight: '44px',
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }}
            >
              Settings
            </Button>
            
            <Button
              fullWidth
              onClick={() => {
                onLogout();
                handleClose();
              }}
              sx={{
                justifyContent: 'flex-start',
                px: 2,
                py: 1.5,
                borderRadius: '8px',
                color: '#dc2626',
                textTransform: 'none',
                fontSize: '0.875rem',
                minHeight: '44px',
                '&:hover': {
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Paper>
      </Popover>
    </>
  );
};

const Sidebar = ({ 
    defaultSettings,
    onSettingsChange,
    onLogoReset,
    onHistoryItemSelect
}) => {
    const { user, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();
    
    // FIXED: Add local loading state for sidebar operations
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const [activeNav, setActiveNav] = useState('home');
    const [historyPopoverOpen, setHistoryPopoverOpen] = useState(false);
    const [historyAnchorEl, setHistoryAnchorEl] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    
    const historyButtonRef = useRef(null);
    const popoverTimeoutRef = useRef(null);

    // Enhanced mobile detection and class management - OPTIMIZED
    useEffect(() => {
        let timeoutId;
        
        const checkMobile = () => {
            // Clear any pending timeout
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            // Debounce the mobile check to prevent excessive calls
            timeoutId = setTimeout(() => {
                const mobile = window.innerWidth <= 600;
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isTouch = 'ontouchstart' in window;
                
                setIsMobile(mobile);
                
                // Batch DOM class updates
                const body = document.body;
                const classesToRemove = ['is-mobile-device', 'is-ios-device', 'is-touch-device'];
                const classesToAdd = [];
                
                if (mobile) {
                    classesToAdd.push('is-mobile-device');
                    if (isIOS) classesToAdd.push('is-ios-device');
                    if (isTouch) classesToAdd.push('is-touch-device');
                }
                
                // Remove all classes first, then add the needed ones
                body.classList.remove(...classesToRemove);
                if (classesToAdd.length > 0) {
                    body.classList.add(...classesToAdd);
                }
            }, 100); // 100ms debounce
        };
        
        // Initial check
        checkMobile();
        
        // Add event listeners with passive option for better performance
        window.addEventListener('resize', checkMobile, { passive: true });
        window.addEventListener('orientationchange', checkMobile, { passive: true });
        
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('orientationchange', checkMobile);
            document.body.classList.remove('is-mobile-device', 'is-ios-device', 'is-touch-device');
        };
    }, []); // Keep empty dependency array

    // Handle viewport changes for mobile keyboards
    useEffect(() => {
        if (!isMobile) return;

        const handleVisualViewportChange = () => {
            if (window.visualViewport) {
                const viewport = window.visualViewport;
                const heightDiff = window.innerHeight - viewport.height;
                
                if (heightDiff > 150) {
                    document.body.classList.add('keyboard-active');
                } else {
                    document.body.classList.remove('keyboard-active');
                }
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleVisualViewportChange);
            window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
                window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
            }
            document.body.classList.remove('keyboard-active');
        };
    }, [isMobile]);

    const handleLogoClick = () => {
        console.log("Logo clicked");
        setActiveNav('home');
        onLogoReset && onLogoReset();
    };

    const handleNavClick = (action) => {
        setActiveNav(action);
        
        switch(action) {
            case 'home':
                onLogoReset && onLogoReset();
                break;
            case 'history':
                break;
            default:
                console.log(`Navigation clicked: ${action}`);
        }
    };

    const handleHistoryMouseEnter = () => {
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
        }
        setHistoryAnchorEl(historyButtonRef.current);
        setHistoryPopoverOpen(true);
    };

    const handleHistoryMouseLeave = () => {
        popoverTimeoutRef.current = setTimeout(() => {
            setHistoryPopoverOpen(false);
            setHistoryAnchorEl(null);
        }, 300);
    };

    const handlePopoverMouseEnter = () => {
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
        }
    };

    const handlePopoverMouseLeave = () => {
        setHistoryPopoverOpen(false);
        setHistoryAnchorEl(null);
    };

    const handleSettingsSave = (newSettings) => {
        onSettingsChange?.(newSettings);
        setShowSettings(false);
    };

    const handlePlanSelect = (plan) => {
        if (plan === 'pro') {
            window.location.href = 'https://buy.stripe.com/9AQbJAfWy9oMduU6oo';
        }
    };

    const handleHistoryItemSelect = (item) => {
        setHistoryPopoverOpen(false);
        if (onHistoryItemSelect) {
            onHistoryItemSelect(item);
        }
    };

    const handleUserButtonClick = () => {
        if (!user && !isLoading) {
            setShowLoginModal(true);
        }
    };

    // FIXED: Enhanced login with proper loading state and error handling
    const handleLoginClick = async () => {
        try {
            console.log('🔐 Starting login process...');
            setShowLoginModal(false); // Close modal immediately
            setIsLoading(true);
            
            await login();
            console.log('✅ Login successful');
            
            // Don't reopen the modal on success
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Enhanced error handling with specific error types
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message.includes('popup blocker')) {
                errorMessage = 'Please disable popup blockers and try again.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Login timed out. Please check your connection and try again.';
            } else if (error.message.includes('cancelled')) {
                errorMessage = 'Login was cancelled.';
                // Don't show error for cancellation - user chose to cancel
                return;
            } else if (error.message.includes('Cross-Origin-Opener-Policy')) {
                errorMessage = 'Browser security settings are blocking login. Please try refreshing the page and logging in again.';
            }
            
            // Show error to user
            alert(errorMessage);
            
            // Only reopen login modal for actual errors (not cancellation)
            if (!error.message.includes('cancelled')) {
                setShowLoginModal(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // FIXED: Enhanced logout with proper loading state and error handling
    const handleLogout = async () => {
        try {
            console.log('🚪 Logout requested');
            setIsLoading(true);
            
            await logout();
            console.log('✅ Logout successful');
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            console.log('ℹ️ Logout completed (with minor issues)');
        } finally {
            setIsLoading(false);
        }
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (popoverTimeoutRef.current) {
                clearTimeout(popoverTimeoutRef.current);
            }
        };
    }, []);

    // Show loading state while auth is being checked
    if (authLoading) {
        return (
            <Box
                sx={{
                    width: `${SIDEBAR_WIDTH_COLLAPSED}px`,
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                }}
            >
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    width: `${SIDEBAR_WIDTH_COLLAPSED}px`,
                    height: '100vh', // Use regular viewport height
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                    zIndex: 1000,
                    overflow: 'visible',
                    boxSizing: 'border-box',
                    
                    // Enhanced mobile layout with safe area support
                    '@media (max-width: 600px)': {
                        height: '100vh',
                        paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)', // Ensure minimum 24px padding
                        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
                        justifyContent: 'flex-start'
                    },
                    
                    // iOS-specific safe area adjustments
                    '@supports (-webkit-touch-callout: none)': {
                        '@media (max-width: 600px)': {
                            paddingTop: 'max(env(safe-area-inset-top, 0px), 32px)', // More padding for iOS
                            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)'
                        }
                    }
                }}
            >
                {/* Clean Logo Section */}
                <Box 
                    sx={{ 
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        transform: isLogoHovered ? 'scale(1.05)' : 'scale(1)',
                        backgroundColor: isLogoHovered ? '#f0f4f8' : 'transparent',
                        mb: 3,
                        position: 'relative',
                        '@media (max-width: 600px)': {
                            width: '48px',
                            height: '48px',
                            mb: 2.5
                        }
                    }}
                    onClick={handleLogoClick}
                    onMouseEnter={() => setIsLogoHovered(true)}
                    onMouseLeave={() => setIsLogoHovered(false)}
                    role="button"
                    aria-label="Teacherfy Home"
                    tabIndex={0}
                >
                    <img
                        src={Logo}
                        alt="Teacherfy AI"
                        style={{ 
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            objectFit: 'contain'
                        }}
                    />
                    {isLogoHovered && (
                        <Stars 
                            size={14} 
                            color="#2563eb" 
                            style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                animation: 'twinkle 1s infinite alternate'
                            }}
                        />
                    )}
                </Box>

                {/* Main Navigation */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    '@media (max-width: 600px)': {
                        gap: 1.5
                    }
                }}>
                    {NAV_ITEMS.map((item) => (
                        <Box
                            key={item.id}
                            ref={item.id === 'history' ? historyButtonRef : null}
                        >
                            <NavButton
                                item={item}
                                isActive={activeNav === item.action}
                                onClick={handleNavClick}
                                onMouseEnter={item.hasPopover ? handleHistoryMouseEnter : undefined}
                                onMouseLeave={item.hasPopover ? handleHistoryMouseLeave : undefined}
                            />
                        </Box>
                    ))}
                </Box>

                {/* Spacer */}
                <Box sx={{ 
                    flex: 1,
                    '@media (max-width: 600px)': {
                        flex: 0,
                        minHeight: '20px'
                    }
                }} />
                {/* Bottom buttons container */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    '@media (max-width: 600px)': {
                        bottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
                        gap: 1.5
                    },
                    // Additional safety for newer iPhones with larger home indicators
                    '@media (max-width: 600px) and (min-height: 800px)': {
                        bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))'
                    },
                    // iOS-specific safe area support - increased clearance for home indicator
                    '@supports (-webkit-touch-callout: none)': {
                        '@media (max-width: 600px)': {
                            bottom: 'calc(50px + env(safe-area-inset-bottom, 30px))',
                            zIndex: 1001
                        },
                        '@media (max-width: 600px) and (min-height: 800px)': {
                            bottom: 'calc(70px + env(safe-area-inset-bottom, 40px))',
                            zIndex: 1001
                        }
                    }
                }}>
                    {/* Upgrade Button */}
                    <Button
                        onClick={() => setShowPricing(true)}
                        disabled={isLoading}
                        sx={{
                            width: '44px',
                            height: '44px',
                            minWidth: '44px',
                            minHeight: '48px',
                            p: 0,
                            borderRadius: '12px',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            transition: 'all 0.2s ease',
                            opacity: isLoading ? 0.7 : 1,
                            '&:hover': {
                                backgroundColor: '#6d28d9',
                                transform: 'scale(1.05)'
                            },
                            '@media (max-width: 600px)': {
                                minHeight: '48px',
                                minWidth: '48px',
                                '&:active': {
                                    transform: 'scale(0.95)',
                                    transition: 'transform 0.1s ease'
                                }
                            }
                        }}
                    >
                        <Crown size={20} />
                    </Button>

                    {/* User Section */}
                    {isAuthenticated && user ? (
                        <UserMenu 
                            user={user}
                            onSettings={() => setShowSettings(true)}
                            onLogout={handleLogout}
                            isLoading={isLoading}
                        />
                    ) : (
                        <Button
                            onClick={handleUserButtonClick}
                            disabled={isLoading}
                            sx={{
                                width: '44px',
                                height: '44px',
                                minWidth: '44px',
                                minHeight: '48px',
                                p: 0,
                                borderRadius: '12px',
                                backgroundColor: 'transparent',
                                color: '#64748b',
                                transition: 'all 0.2s ease',
                                opacity: isLoading ? 0.7 : 1,
                                '&:hover': {
                                    backgroundColor: '#f8fafc',
                                    color: '#374151'
                                },
                                '@media (max-width: 600px)': {
                                    minHeight: '48px',
                                    minWidth: '48px',
                                    position: 'relative',
                                    '&:active': {
                                        transform: 'scale(0.95)',
                                        transition: 'transform 0.1s ease'
                                    }
                                }
                            }}
                        >
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : <User size={20} />}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* History Popover */}
            <Box
                onMouseEnter={handlePopoverMouseEnter}
                onMouseLeave={handlePopoverMouseLeave}
            >
                <HistoryPopover
                    open={historyPopoverOpen}
                    anchorEl={historyAnchorEl}
                    onClose={() => setHistoryPopoverOpen(false)}
                    onHistoryItemSelect={handleHistoryItemSelect}
                />
            </Box>

            {/* Login Modal */}
            <LoginModal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginClick={handleLoginClick}
                isLoading={isLoading}
            />

            {/* Settings Modal */}
            <UserSettingsModal 
                open={showSettings}
                onClose={() => setShowSettings(false)}
                defaultSettings={defaultSettings}
                onSave={handleSettingsSave}
            />

            {/* Pricing Modal */}
            <PricingModal 
                open={showPricing}
                onClose={() => setShowPricing(false)}
                onSelectPlan={handlePlanSelect}
            />

            {/* Global styles for animations */}
            <style>{`
                @keyframes twinkle {
                    from { opacity: 0.6; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
};

export default Sidebar;