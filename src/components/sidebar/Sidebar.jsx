// src/components/sidebar/Sidebar.jsx - FIXED for mobile visibility
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Popover, Paper, Modal } from '@mui/material';
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

const SIDEBAR_WIDTH_COLLAPSED = 60;

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
      sx={{
        width: '44px',
        height: '44px',
        minWidth: '44px',
        minHeight: '48px', // Increased for mobile
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
        // Mobile-specific touch improvements
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
          // Mobile adjustments
          '@media (max-width: 600px)': {
            width: 'calc(100vw - 80px)',
            maxWidth: '300px',
            maxHeight: '60vh'
          }
        }
      }}
    >
      <Paper elevation={0} sx={{ p: 0 }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <Typography sx={{ 
            fontWeight: 600, 
            fontSize: '0.875rem',
            color: '#1e293b'
          }}>
            Recent Resources
          </Typography>
        </Box>
        <Box sx={{ 
          maxHeight: '400px', 
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
          // Mobile scroll improvements
          '@media (max-width: 600px)': {
            maxHeight: '50vh',
            '-webkit-overflow-scrolling': 'touch'
          }
        }}>
          <RecentsList onSelectItem={onHistoryItemSelect} />
        </Box>
      </Paper>
    </Popover>
  );
};

const LoginModal = ({ open, onClose, onLoginClick }) => {
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
          // Mobile adjustments
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
          sx={{
            backgroundColor: '#4285f4',
            color: 'white',
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            minHeight: '48px', // Touch-friendly
            '&:hover': {
              backgroundColor: '#3367d6'
            }
          }}
        >
          Sign in with Google
        </Button>
        
        <Button 
          onClick={onClose}
          variant="text"
          color="inherit"
          size="small"
          sx={{
            minHeight: '44px' // Touch-friendly
          }}
        >
          Continue without signing in
        </Button>
      </Box>
    </Modal>
  );
};

const UserMenu = ({ user, onSettings, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
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
        sx={{
          width: '44px',
          height: '44px',
          minWidth: '44px',
          minHeight: '48px', // Mobile-friendly
          p: 0,
          borderRadius: '12px',
          backgroundColor: 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#f8fafc'
          },
          // Mobile touch improvements
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
        {user.picture ? (
          <Avatar 
            src={user.picture}
            alt={user.name}
            sx={{ 
              width: 36, 
              height: 36,
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          />
        ) : (
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36,
              backgroundColor: '#2563eb',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {getUserInitials(user.name)}
          </Avatar>
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
            // Mobile adjustments
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
                minHeight: '44px', // Touch-friendly
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
                minHeight: '44px', // Touch-friendly
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
    const { user, isAuthenticated, login, logout, isLoading } = useAuth();
    
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

    // Enhanced mobile detection and class management
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 600;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isTouch = 'ontouchstart' in window;
            
            setIsMobile(mobile);
            
            // Add multiple classes for better targeting
            if (mobile) {
                document.body.classList.add('is-mobile-device');
                if (isIOS) {
                    document.body.classList.add('is-ios-device');
                }
                if (isTouch) {
                    document.body.classList.add('is-touch-device');
                }
            } else {
                document.body.classList.remove('is-mobile-device', 'is-ios-device', 'is-touch-device');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('orientationchange', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('orientationchange', checkMobile);
            document.body.classList.remove('is-mobile-device', 'is-ios-device', 'is-touch-device');
        };
    }, []);

    // Handle viewport changes for mobile keyboards
    useEffect(() => {
        if (!isMobile) return;

        const handleVisualViewportChange = () => {
            if (window.visualViewport) {
                const viewport = window.visualViewport;
                const heightDiff = window.innerHeight - viewport.height;
                
                if (heightDiff > 150) { // Keyboard is likely open
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
        if (!user) {
            setShowLoginModal(true);
        }
    };

    const handleLoginClick = async () => {
        try {
            console.log('🔐 Starting login process...');
            setShowLoginModal(false);
            await login();
            console.log('✅ Login successful');
        } catch (error) {
            console.error('❌ Login error:', error);
            alert(`Login failed: ${error.message}`);
        }
    };

    const handleLogout = async () => {
        try {
            console.log('🚪 Logout requested');
            await logout();
        } catch (error) {
            console.error('❌ Logout error:', error);
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

    if (isLoading) {
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
                <Typography variant="body2">Loading...</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    width: `${SIDEBAR_WIDTH_COLLAPSED}px`,
                    height: '100dvh', // Dynamic viewport height for mobile, fallback handled in media query
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                    zIndex: 1000, // Increased z-index for mobile
                    overflow: 'visible',
                    boxSizing: 'border-box',
                    
                    // Critical mobile improvements
                    paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
                    paddingBottom: isMobile 
                        ? 'max(80px, calc(env(safe-area-inset-bottom, 0px) + 60px))' 
                        : '16px',
                    
                    // Mobile-specific adjustments
                    '@media (max-width: 600px)': {
                        height: '100vh', // Fallback for older browsers
                        paddingBottom: 'max(100px, calc(env(safe-area-inset-bottom, 0px) + 80px))',
                        justifyContent: 'space-between' // Better spacing on mobile
                    },
                    
                    // Support for dynamic viewport height
                    '@supports (height: 100dvh)': {
                        height: '100dvh'
                    }
                }}
            >
                {/* Logo Section */}
                <Box 
                    sx={{ 
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        transform: isLogoHovered ? 'scale(1.1)' : 'scale(1)',
                        backgroundColor: isLogoHovered ? '#f0f4f8' : 'transparent',
                        mb: 3,
                        position: 'relative',
                        // Mobile touch improvements
                        '@media (max-width: 600px)': {
                            width: '48px', // Ensure consistent sizing
                            height: '48px', // Single height declaration
                            mb: 2
                        }
                    }}
                    onClick={handleLogoClick}
                    onMouseEnter={() => setIsLogoHovered(true)}
                    onMouseLeave={() => setIsLogoHovered(false)}
                >
                    <img
                        src={Logo}
                        alt="Teacherfy Logo"
                        style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            objectFit: 'contain'
                        }}
                    />
                    {isLogoHovered && (
                        <Stars 
                            size={16} 
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
                        gap: 1.5 // More space on mobile
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

                {/* Spacer - Modified for mobile */}
                <Box sx={{ 
                    flex: 1,
                    '@media (max-width: 600px)': {
                        flex: 0, // Don't stretch on mobile
                        minHeight: '20px' // Minimal spacer
                    }
                }} />

                {/* Bottom buttons container - Critical for mobile positioning */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    '@media (max-width: 600px)': {
                        // Fixed positioning from bottom on mobile
                        marginTop: 'auto',
                        paddingBottom: 0,
                        gap: 3
                    }
                }}>
                    {/* Upgrade Button */}
                    <Button
                        onClick={() => setShowPricing(true)}
                        sx={{
                            width: '44px',
                            height: '44px',
                            minWidth: '44px',
                            minHeight: '48px', // Mobile-friendly
                            p: 0,
                            borderRadius: '12px',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: '#6d28d9',
                                transform: 'scale(1.05)'
                            },
                            // Mobile improvements
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

                    {/* User Section - Critical mobile positioning */}
                    {isAuthenticated && user ? (
                        <UserMenu 
                            user={user}
                            onSettings={() => setShowSettings(true)}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <Button
                            onClick={handleUserButtonClick}
                            sx={{
                                width: '44px',
                                height: '44px',
                                minWidth: '44px',
                                minHeight: '48px', // Mobile-friendly
                                p: 0,
                                borderRadius: '12px',
                                backgroundColor: 'transparent',
                                color: '#64748b',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#f8fafc',
                                    color: '#374151'
                                },
                                // Mobile improvements
                                '@media (max-width: 600px)': {
                                    minHeight: '48px',
                                    minWidth: '48px',
                                    // Ensure this button is always visible
                                    position: 'relative',
                                    '&:active': {
                                        transform: 'scale(0.95)',
                                        transition: 'transform 0.1s ease'
                                    }
                                }
                            }}
                        >
                            <User size={20} />
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
                
                /* Debug helper - remove in production */
                .debug-mobile .sidebar {
                    background-color: rgba(255, 0, 0, 0.1) !important;
                }
                
                .debug-mobile .sidebar > *:last-child {
                    background-color: rgba(0, 255, 0, 0.3) !important;
                }
            `}</style>
        </>
    );
};

export default Sidebar;