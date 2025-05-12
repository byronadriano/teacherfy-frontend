// Updated Sidebar.jsx with scrolling fixes
import React, { useState } from 'react';
import { Box, Typography, Button, Avatar, IconButton, Divider, Paper } from '@mui/material';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ChevronLeft, ChevronRight, Settings, Stars } from 'lucide-react';
import RecentsList from './RecentsList';
import UserSettingsModal from '../modals/UserSettingsModal';
import PricingModal from '../modals/PricingModal';
import Logo from '../../assets/images/Teacherfyoai.png';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';

const Sidebar = ({ 
    isCollapsed,
    toggleSidebar,
    user,
    handleLogout,
    handleLoginSuccess,
    defaultSettings,
    onSettingsChange,
    onLogoReset,
    onHistoryItemSelect
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const [isToggleHovered, setIsToggleHovered] = useState(false);

    const handleLogoClick = () => {
        console.log("Logo clicked");
        onLogoReset && onLogoReset();
    };

    const handleSettingsSave = (newSettings) => {
        onSettingsChange?.(newSettings);
        setShowSettings(false);
    };

    const handlePlanSelect = (plan) => {
        if (plan === 'pro') {
            window.location.href = 'your-stripe-checkout-url';
        }
    };

    const handleHistoryItemSelect = (item) => {
        if (onHistoryItemSelect) {
            onHistoryItemSelect(item);
        }
    };

    // Sidebar background color - using the original color that matches the logo
    const sidebarColor = '#f5f5f5';

    return (
        <>
            <Box
                sx={{
                    width: isCollapsed ? '20px' : '240px',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: sidebarColor,
                    borderRight: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.3s ease',
                    zIndex: 10,
                    overflow: 'hidden' // Keep parent container from scrolling
                }}
                className="sidebar"
            >
                {/* Logo Section */}
                {!isCollapsed && (
                    <Box 
                        sx={{ 
                            p: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            transform: isLogoHovered ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: isLogoHovered 
                                ? '0 4px 15px rgba(37, 99, 235, 0.3)' 
                                : 'none',
                            borderRadius: '8px',
                            backgroundColor: 'transparent'
                        }}
                        onClick={handleLogoClick}
                        onMouseEnter={() => setIsLogoHovered(true)}
                        onMouseLeave={() => setIsLogoHovered(false)}
                    >
                        <Box sx={{ 
                            position: 'relative', 
                            display: 'flex', 
                            alignItems: 'center' 
                        }}>
                            <img
                                src={Logo}
                                alt="Teacherfy Logo"
                                style={{ 
                                    width: '150px',
                                    height: 'auto',
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                            {isLogoHovered && (
                                <Stars 
                                    size={24} 
                                    color="#2563eb" 
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-30px',
                                        animation: 'twinkle 1s infinite alternate'
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                )}

                {/* Content */}
                <Box sx={{ 
                    flex: 1, 
                    overflow: 'hidden', // Keep this as hidden
                    display: 'flex', 
                    flexDirection: 'column' 
                }}>
                    {/* Recents List - This is the only scrollable part */}
                    {!isCollapsed && (
                        <Box sx={{ 
                            overflowY: 'auto', // Only this section should scroll
                            flex: 1,
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
                            <RecentsList onSelectItem={handleHistoryItemSelect} />
                        </Box>
                    )}
                </Box>

                {/* Footer Section with clear divider - Non-scrollable */}
                {!isCollapsed && (
                    <Box sx={{ flexShrink: 0 }}> {/* Add flexShrink to prevent this section from scrolling */}
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Upgrade Section in a nicer card */}
                        <Box sx={{ 
                            px: 3,
                            pb: 2
                        }}>
                            <Paper
                                elevation={0}
                                onClick={() => setShowPricing(true)}
                                sx={{ 
                                    p: 2,
                                    bgcolor: '#f1f5f9',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: '#e2e8f0',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Typography sx={{ 
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    mb: 1
                                }}>
                                    Upgrade for unlimited creations
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#2563eb',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}
                                >
                                    View Plans
                                </Typography>
                            </Paper>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* User Info Section */}
                        {user && (
                            <Box sx={{ 
                                px: 3,
                                pb: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2,
                                    p: 1,
                                    borderRadius: '8px',
                                    backgroundColor: '#f5f5f5' // Match with sidebar background
                                }}>
                                    <Avatar 
                                        src={user.picture}
                                        alt={user.name}
                                        sx={{ width: 40, height: 40 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Typography sx={{ 
                                                fontWeight: 500,
                                                fontSize: '0.9rem',
                                                color: '#1E293B'
                                            }}>
                                                {user.name}
                                            </Typography>
                                            <IconButton
                                                onClick={() => setShowSettings(true)}
                                                sx={{
                                                    padding: '4px',
                                                    color: '#64748B',
                                                    '&:hover': {
                                                        color: '#475569'
                                                    }
                                                }}
                                            >
                                                <Settings size={18} />
                                            </IconButton>
                                        </Box>
                                        <Typography sx={{ 
                                            fontSize: '0.8rem',
                                            color: '#64748B'
                                        }}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleLogout}
                                    sx={{
                                        textTransform: 'none',
                                        borderColor: '#e5e7eb',
                                        color: '#374151'
                                    }}
                                >
                                    Log Out
                                </Button>
                            </Box>
                        )}

                        {/* Login Button */}
                        {!user && (
                            <Box sx={{ p: 3 }}>
                                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                                    <GoogleLogin
                                        onSuccess={handleLoginSuccess}
                                        onError={() => {
                                            console.error("Login Failed");
                                            alert("Login Failed. Please try again.");
                                        }}
                                        shape="pill"
                                        width="100%"
                                    />
                                </GoogleOAuthProvider>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* Floating Toggle Button - Completely outside the sidebar */}
            <Box
                onClick={toggleSidebar}
                onMouseEnter={() => setIsToggleHovered(true)}
                onMouseLeave={() => setIsToggleHovered(false)}
                className="sidebar-floating-toggle"
                sx={{
                    position: 'fixed',
                    left: isCollapsed ? '22px' : '242px', // Just outside the sidebar
                    top: '170px', // Positioned at eye level
                    transform: 'translateX(-50%)', // Center horizontally on the edge
                    cursor: 'pointer',
                    zIndex: 1100, // Higher z-index to stay on top
                    backgroundColor: isToggleHovered ? '#f0f9ff' : '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32, // Smaller, more discrete size
                    height: 32, // Smaller, more discrete size
                    boxShadow: isToggleHovered 
                        ? '0 0 12px rgba(37, 99, 235, 0.4)' 
                        : '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: '#e0f2fe',
                        transform: 'translateX(-50%) scale(1.1)'
                    }
                }}
            >
                {isCollapsed ? (
                    <ChevronRight 
                        size={18} 
                        color="#1e3a8a"
                        style={{
                            transition: 'all 0.3s ease'
                        }}
                    />
                ) : (
                    <ChevronLeft 
                        size={18} 
                        color="#1e3a8a"
                        style={{
                            transition: 'all 0.3s ease'
                        }}
                    />
                )}
            </Box>

            {/* Modals */}
            <UserSettingsModal 
                open={showSettings}
                onClose={() => setShowSettings(false)}
                defaultSettings={defaultSettings}
                onSave={handleSettingsSave}
            />

            <PricingModal 
                open={showPricing}
                onClose={() => setShowPricing(false)}
                onSelectPlan={handlePlanSelect}
            />

            {/* Global style for animations */}
            <style>{`
                @keyframes twinkle {
                    from { opacity: 0.6; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                /* Add pulse animation for the toggle button */
                @keyframes pulse-toggle {
                    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
                }
                
                .sidebar-floating-toggle {
                    animation: pulse-toggle 2s infinite;
                }
            `}</style>
        </>
    );
};

export default Sidebar;