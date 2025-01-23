import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { Check } from 'lucide-react';

const PricingModal = ({ open, onClose, onSelectPlan }) => {
    const plans = [
        {
            name: 'Free',
            price: 0,
            features: [
                'Up to 5 presentations per month',
                'Basic templates',
                'Standard support',
                'Export to PowerPoint',
                'Export to Google Slides'
            ],
            buttonText: 'Continue with Free',
            highlighted: false
        },
        {
            name: 'Pro',
            price: 7.99,
            features: [
                'Unlimited presentations',
                'Premium templates',
                'Priority support',
                'Export to PowerPoint',
                'Export to Google Slides',
                'Advanced customization options',
                'Bulk generation',
                'Team sharing'
            ],
            buttonText: 'Upgrade to Pro',
            highlighted: true
        }
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogContent sx={{ px: 0, py: 4 }}>
                <Typography
                    variant="h4"
                    align="center"
                    sx={{ 
                        mb: 1,
                        fontWeight: 600,
                        color: '#1E293B'
                    }}
                >
                    Choose Your Plan
                </Typography>
                <Typography
                    align="center"
                    sx={{ 
                        mb: 4,
                        color: '#64748B',
                        fontSize: '1.125rem'
                    }}
                >
                    Select the perfect plan for your needs
                </Typography>

                <Box sx={{ 
                    display: 'flex',
                    gap: 3,
                    px: 3
                }}>
                    {plans.map((plan) => (
                        <Box
                            key={plan.name}
                            sx={{
                                flex: 1,
                                borderRadius: '12px',
                                border: plan.highlighted ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                bgcolor: plan.highlighted ? '#F8FAFF' : '#FFFFFF',
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{ 
                                    fontWeight: 600,
                                    color: '#1E293B',
                                    mb: 1
                                }}
                            >
                                {plan.name}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                                <Typography
                                    variant="h3"
                                    sx={{ 
                                        fontWeight: 700,
                                        color: '#1E293B'
                                    }}
                                >
                                    ${plan.price}
                                </Typography>
                                {plan.price > 0 && (
                                    <Typography
                                        sx={{ 
                                            color: '#64748B',
                                            ml: 1
                                        }}
                                    >
                                        /month
                                    </Typography>
                                )}
                            </Box>

                            <List sx={{ mb: 'auto' }}>
                                {plan.features.map((feature) => (
                                    <ListItem key={feature} sx={{ px: 0, py: 1 }}>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <Check size={18} color="#2563EB" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={feature}
                                            primaryTypographyProps={{
                                                sx: { 
                                                    color: '#475569',
                                                    fontSize: '0.9375rem'
                                                }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Button
                                variant={plan.highlighted ? 'contained' : 'outlined'}
                                fullWidth
                                size="large"
                                onClick={() => {
                                    onSelectPlan(plan.name.toLowerCase());
                                    onClose();
                                }}
                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '0.9375rem'
                                }}
                            >
                                {plan.buttonText}
                            </Button>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PricingModal;