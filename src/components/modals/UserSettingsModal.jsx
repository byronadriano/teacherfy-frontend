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
    Switch
} from '@mui/material';
import { FORM } from '../../utils/constants/form';

const UserSettingsModal = ({ open, onClose, defaultSettings, onSave }) => {
    const [settings, setSettings] = React.useState(defaultSettings || {
        defaultGrade: '',
        defaultSubject: '',
        defaultLanguage: '',
        defaultSlides: 5,
        alwaysIncludeImages: false
    });

    const handleSave = () => {
        onSave(settings);
        onClose();
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
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save Settings</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserSettingsModal;