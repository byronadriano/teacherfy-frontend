import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent,
    DialogActions,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Snackbar,
    Alert
} from '@mui/material';
import { FORM } from '../../utils/constants/form';
import { DEFAULT_SETTINGS } from '../../services/userSettings';

const UserSettingsModal = ({ open, onClose, defaultSettings, onSave }) => {
    const [settings, setSettings] = React.useState(defaultSettings || DEFAULT_SETTINGS);
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Update settings when defaultSettings change
    React.useEffect(() => {
        if (defaultSettings) {
            setSettings(defaultSettings);
        }
    }, [defaultSettings]);

    const handleSave = () => {
        onSave(settings);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 1500);
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ 
                borderBottom: '1px solid #E2E8F0',
                fontSize: '1.25rem',
                fontWeight: 500
            }}>
                Default Settings
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <FormControl fullWidth>
                        <InputLabel>Default Grade Level</InputLabel>
                        <Select
                            value={settings.defaultGrade}
                            onChange={(e) => setSettings(prev => ({ ...prev, defaultGrade: e.target.value }))}
                            label="Default Grade Level"
                        >
                            <MenuItem value="">None</MenuItem>
                            {FORM.GRADES.map((grade) => (
                                <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Default Subject</InputLabel>
                        <Select
                            value={settings.defaultSubject}
                            onChange={(e) => setSettings(prev => ({ ...prev, defaultSubject: e.target.value }))}
                            label="Default Subject"
                        >
                            <MenuItem value="">None</MenuItem>
                            {FORM.SUBJECTS.map((subject) => (
                                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Default Language</InputLabel>
                        <Select
                            value={settings.defaultLanguage}
                            onChange={(e) => setSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                            label="Default Language"
                        >
                            <MenuItem value="">None</MenuItem>
                            {FORM.LANGUAGES.map((language) => (
                                <MenuItem key={language} value={language}>{language}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Default Number of Slides</InputLabel>
                        <Select
                            value={settings.defaultSlides}
                            onChange={(e) => setSettings(prev => ({ ...prev, defaultSlides: e.target.value }))}
                            label="Default Number of Slides"
                        >
                            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                <MenuItem key={num} value={num}>{num} slides</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch 
                                checked={settings.alwaysIncludeImages}
                                onChange={(e) => setSettings(prev => ({ 
                                    ...prev, 
                                    alwaysIncludeImages: e.target.checked 
                                }))}
                            />
                        }
                        label="Always include images in presentations"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                <Button onClick={handleReset} variant="text" color="secondary">
                    Reset to Defaults
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} variant="outlined">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save Settings</Button>
                </Box>
            </DialogActions>
            
            {/* Success Snackbar */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={1500}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" variant="filled">
                    Settings saved successfully! Defaults will be applied to new forms.
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default UserSettingsModal;