// src/components/sidebar/Sidebar.jsx - FIXED VERSION without conflicting OAuth
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
        p: 0,
        borderRadius: '12px',
        backgroundColor: isActive ? '#f0f4f8' : 'transparent',
        color: isActive ? '#2563eb' : '#64748b',
        transition: 'all 0.2s ease',
        mb: 1,
        '&:hover': {
          backgroundColor: '#f8fafc',
          color: '#374151'
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
          overflow: 'hidden'
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
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: '12px',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
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

        {/* FIXED: Use custom login button instead of Google OAuth Provider */}
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
          p: 0,
          borderRadius: '12px',
          backgroundColor: 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#f8fafc'
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
            overflow: 'hidden'
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

    // Detect mobile device and add class to body
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 600;
            setIsMobile(mobile);
            
            if (mobile) {
                document.body.classList.add('is-mobile-device');
            } else {
                document.body.classList.remove('is-mobile-device');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            document.body.classList.remove('is-mobile-device');
        };
    }, []);

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
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                    zIndex: 10,
                    overflow: 'visible',
                    paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 50px)' : '16px',
                    boxSizing: 'border-box'
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
                        position: 'relative'
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
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
                <Box sx={{ flex: 1 }} />

                {/* Upgrade Button */}
                <Button
                    onClick={() => setShowPricing(true)}
                    sx={{
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        p: 0,
                        borderRadius: '12px',
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        mb: 2,
                        transition: 'all 0.2s ease',
                        ...(isMobile && {
                            minHeight: '48px',
                            minWidth: '48px',
                            mb: 3,
                        }),
                        '&:hover': {
                            backgroundColor: '#6d28d9',
                            transform: 'scale(1.05)'
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
                    />
                ) : (
                    <Button
                        onClick={handleUserButtonClick}
                        sx={{
                            width: '44px',
                            height: '44px',
                            minWidth: '44px',
                            p: 0,
                            borderRadius: '12px',
                            backgroundColor: 'transparent',
                            color: '#64748b',
                            transition: 'all 0.2s ease',
                            ...(isMobile && {
                                minHeight: '48px',
                                minWidth: '48px',
                                mb: 4,
                            }),
                            '&:hover': {
                                backgroundColor: '#f8fafc',
                                color: '#374151'
                            }
                        }}
                    >
                        <User size={20} />
                    </Button>
                )}
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
            `}</style>
        </>
    );
};

export default Sidebar;