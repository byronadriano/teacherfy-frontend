// src/components/sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { Box, Typography, Button, Avatar, IconButton } from '@mui/material';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ChevronLeft, Settings } from 'lucide-react';
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
    onSettingsChange
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    const handleSettingsSave = (newSettings) => {
        onSettingsChange?.(newSettings);
        setShowSettings(false);
    };

    const handlePlanSelect = (plan) => {
        if (plan === 'pro') {
            window.location.href = 'your-stripe-checkout-url';
        }
    };

    return (
        <>
            <Box
                sx={{
                    width: isCollapsed ? '20px' : '280px',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: '#f5f5f5',
                    borderRight: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.3s ease',
                    zIndex: 10,
                    overflow: 'hidden'
                }}
            >
                {/* Logo Section */}
                {!isCollapsed && (
                    <Box sx={{ 
                        p: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <img
                            src={Logo}
                            alt="Teacherfy Logo"
                            style={{ 
                                width: '180px',
                                height: 'auto'
                            }}
                        />
                    </Box>
                )}

                {/* Toggle Button */}
                <Box
                    onClick={toggleSidebar}
                    sx={{
                        position: 'absolute',
                        right: -2,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#9ca3af',
                        transition: 'color 0.2s ease',
                        '&:hover': {
                            color: '#6b7280'
                        },
                        bgcolor: 'transparent'
                    }}
                >
                    <ChevronLeft 
                        size={20} 
                        style={{
                            transform: isCollapsed ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.3s ease'
                        }}
                    />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {!isCollapsed && <RecentsList />}
                </Box>

                {/* Footer Section */}
                {!isCollapsed && (
                    <Box sx={{ 
                        borderTop: '1px solid #e5e7eb',
                        mt: 'auto'
                    }}>
                        {/* Upgrade Section */}
                        <Box sx={{ 
                            p: 3,
                            pb: 2
                        }}>
                            <Box 
                                onClick={() => setShowPricing(true)}
                                sx={{ 
                                    p: 2,
                                    bgcolor: '#f3f4f6',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: '#e5e7eb'
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
                            </Box>
                        </Box>

                        {/* User Info Section */}
                        {user && (
                            <Box sx={{ 
                                px: 3,
                                pb: 2
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2
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
                                            fontSize: '0.875rem',
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
        </>
    );
};

export default Sidebar;