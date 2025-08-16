// src/components/filters/FiltersBar.jsx
import React, { useState } from 'react';
import { Box, Typography, Popover, Paper, Checkbox, FormControlLabel, Chip, TextField } from '@mui/material';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { FORM } from '../../utils/constants';
import StandardsModal from '../modals/StandardsModal';

const MenuOption = ({ 
    label, 
    isSelected, 
    hasSubmenu = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
    disabled = false,
    style = {}
}) => (
    <Box
        onClick={disabled ? undefined : onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 0.75,
            px: 2,
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
            transition: 'all 0.2s',
            opacity: disabled ? 0.5 : 1,
            '&:hover': {
                backgroundColor: disabled ? 'transparent' : (isSelected ? 'rgba(37, 99, 235, 0.15)' : '#F1F5F9')
            },
            ...style
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Checkbox 
                checked={isSelected}
                disabled={disabled}
                sx={{
                    padding: '2px',
                    '&.Mui-checked': {
                        color: '#2563EB'
                    }
                }}
            />
            <Typography sx={{ 
                fontSize: '0.9375rem',
                color: '#1E293B',
                fontWeight: isSelected ? 500 : 400
            }}>
                {label}
            </Typography>
        </Box>
        {hasSubmenu && <ChevronRight size={18} color="#94A3B8" />}
    </Box>
);

const FilterButton = ({ label, isSelected, selectedCount, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.2,
            py: 1.5,
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
            cursor: 'pointer',
            minWidth: '100px', // Reduced from 115px
            maxWidth: '200px', // Added max width
            position: 'relative',
            flexShrink: 0, // Prevent shrinking
            whiteSpace: 'nowrap', // Prevent text wrapping
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            '&:hover': {
                backgroundColor: '#F8FAFC',
                borderColor: isSelected ? '#2563EB' : '#CBD5E1'
            }
        }}
    >
        <Typography sx={{ 
            color: isSelected ? '#2563EB' : '#64748B',
            fontSize: '0.875rem', // Slightly smaller font
            fontWeight: isSelected ? 600 : 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }}>
            {label}
        </Typography>
        {selectedCount > 0 && (
            <Box
                sx={{
                    position: 'absolute',
                    top: -1,
                    right: -1,
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                }}
            >
                {selectedCount}
            </Box>
        )}
        <ChevronDown size={16} color={isSelected ? '#2563EB' : '#94A3B8'} />
    </Box>
);

const PresentationOptions = ({
    open,
    anchorEl,
    numSlides,
    includeImages,
    onSlideNumberSelect,
    onImageOptionChange,
    onClose
}) => (
    <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
        }}
        PaperProps={{
            sx: {
                mt: 0.5,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                border: '1px solid rgb(240, 226, 239)',
                borderRadius: '8px',
                minWidth: '200px'
            }
        }}
    >
        <Box sx={{ py: 1.5 }}>
            <Typography sx={{ px: 2, mb: 0.5, fontSize: '0.875rem', fontWeight: 500, color: '#64748B' }}>
                Number of Slides
            </Typography>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                <MenuOption
                    key={num}
                    label={`${num} ${num === 1 ? 'slide' : 'slides'}`}
                    isSelected={numSlides === num}
                    onClick={() => onSlideNumberSelect(num)}
                />
            ))}
            
            <Box sx={{ 
                borderTop: '1px solid #E2E8F0',
                mt: 1, 
                pt: 1,
                px: 2
            }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includeImages}
                            onChange={(e) => onImageOptionChange(e.target.checked)}
                            sx={{
                                '&.Mui-checked': {
                                    color: '#2563EB'
                                }
                            }}
                        />
                    }
                    label="Include images"
                    sx={{
                        '& .MuiFormControlLabel-label': {
                            fontSize: '0.9375rem',
                            color: '#1E293B'
                        }
                    }}
                />
            </Box>
        </Box>
    </Popover>
);

const FiltersBar = ({ formState, handleFormChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const [showStandardsModal, setShowStandardsModal] = useState(false);

    const handleFilterClick = (event, filter) => {
        if (filter === 'standards') {
            setShowStandardsModal(true);
        } else {
            setAnchorEl(event.currentTarget);
            setActiveFilter(filter);
            setSubmenuAnchorEl(null);
            setActiveSubmenu(null);
        }
    };

    const handleOptionHover = (event, option) => {
        // Removed hover behavior completely to prevent blocking other options
        // Users must click on Presentation to access slide count options
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSubmenuAnchorEl(null);
        setActiveFilter(null);
        setActiveSubmenu(null);
    };

    const handleOptionSelect = (option, event, field = activeFilter) => {
        if (field === 'resourceType') {
            // Toggle the option in the array (normal behavior for all resource types)
            handleFormChange(field, option, true);
            
            // For Presentation, show submenu immediately after selection
            if (option === 'Presentation') {
                // Check if it was just selected (will be in the array after toggle)
                const willBeSelected = Array.isArray(formState.resourceType) 
                    ? !formState.resourceType.includes('Presentation')
                    : formState.resourceType !== 'Presentation';
                
                if (willBeSelected) {
                    // Use setTimeout to ensure state update completes first
                    setTimeout(() => {
                        setSubmenuAnchorEl(event.currentTarget);
                        setActiveSubmenu('presentation');
                    }, 0);
                }
            }
        } else if (field === 'subjectFocus') {
            handleFormChange(field, option);
            
            if (option === 'Other (specify)') {
                // Clear any existing custom subject when "Other (specify)" is selected
                handleFormChange('customSubject', '');
                // Don't call handleClose() to keep the menu open for custom input
            } else {
                // Clear custom subject when selecting any other subject
                handleFormChange('customSubject', '');
                handleClose();
            }
        } else {
            handleFormChange(field, option);
            handleClose();
        }
    };

    // Count selected resource types
    const selectedResourceCount = Array.isArray(formState.resourceType) 
        ? formState.resourceType.length 
        : (formState.resourceType ? 1 : 0);

return (
    <Box sx={{ 
        display: 'flex',
        gap: 1.5,
        mb: 3,
        flexWrap: 'wrap',
        justifyContent: 'center', // Changed from flex-start to center
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
        // Ensure items don't grow beyond their content
        '& > *': {
            flexShrink: 0
        }
    }}>
        {/* Resource Button */}
        <FilterButton
            label="Resources"
            isSelected={selectedResourceCount > 0}
            selectedCount={selectedResourceCount}
            onClick={(e) => handleFilterClick(e, 'resourceType')}
        />

        {/* Grade Level Button */}
        <FilterButton
            label={formState.gradeLevel || "Grade"}
            isSelected={!!formState.gradeLevel}
            onClick={(e) => handleFilterClick(e, 'gradeLevel')}
        />

        {/* Subject Button */}
        <FilterButton
            label={(() => {
                if (!formState.subjectFocus) return "Subject";
                if (formState.subjectFocus === 'Other (specify)' && formState.customSubject?.trim()) {
                    // Show custom subject with truncation
                    const customSubject = formState.customSubject.trim();
                    return customSubject.length > 15 ? `${customSubject.substring(0, 15)}...` : customSubject;
                }
                return formState.subjectFocus;
            })()}
            isSelected={!!formState.subjectFocus}
            onClick={(e) => handleFilterClick(e, 'subjectFocus')}
        />

        {/* Standards Button */}
        <FilterButton
            label={
                formState.selectedStandards?.length
                    ? `${formState.selectedStandards.length} Standard${
                        formState.selectedStandards.length === 1 ? '' : 's'
                      } `
                    : "Standards"
            }
            isSelected={formState.selectedStandards?.length > 0}
            onClick={(e) => handleFilterClick(e, 'standards')}
        />

        {/* Language Button */}
        <FilterButton
            label={formState.language || "Language"}
            isSelected={!!formState.language}
            onClick={(e) => handleFilterClick(e, 'language')}
        />

        {/* Display selected resource types as chips - moved to second row */}
        {Array.isArray(formState.resourceType) && formState.resourceType.length > 0 && (
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1, 
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%', // Take full width to force new row
                mt: 1 // Add margin top for spacing
            }}>
                {formState.resourceType.map(type => (
                    <Chip
                        key={type}
                        label={type === 'Presentation' && formState.numSlides 
                            ? `${type} (${formState.numSlides} slide${formState.numSlides === 1 ? '' : 's'})`
                            : type
                        }
                        onClick={type === 'Presentation' ? (e) => {
                            // Open presentation settings when clicking on the chip
                            setSubmenuAnchorEl(e.currentTarget);
                            setActiveSubmenu('presentation');
                        } : undefined}
                        onDelete={() => {
                            const newTypes = formState.resourceType.filter(t => t !== type);
                            handleFormChange('resourceType', newTypes.length ? newTypes : '');
                        }}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(147, 51, 234, 0.1)', // Light purple background
                            color: '#7c3aed', // Purple text
                            fontWeight: '500',
                            border: '1px solid rgba(147, 51, 234, 0.2)',
                            cursor: type === 'Presentation' ? 'pointer' : 'default',
                            '& .MuiChip-deleteIcon': {
                                color: '#7c3aed',
                                '&:hover': {
                                    color: '#6d28d9'
                                }
                            },
                            '&:hover': {
                                bgcolor: 'rgba(147, 51, 234, 0.15)'
                            }
                        }}
                        deleteIcon={<X size={14} />}
                    />
                ))}
            </Box>
        )}

        {/* Custom Subject Chip */}
        {formState.subjectFocus === 'Other (specify)' && formState.customSubject?.trim() && (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                width: '100%',
                mt: 1
            }}>
                <Chip
                    label={`Custom Subject: ${formState.customSubject}`}
                    onDelete={() => {
                        handleFormChange('subjectFocus', '');
                        handleFormChange('customSubject', '');
                    }}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(34, 197, 94, 0.1)', // Light green background
                        color: '#16a34a', // Green text
                        fontWeight: '500',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        '& .MuiChip-deleteIcon': {
                            color: '#16a34a',
                            '&:hover': {
                                color: '#15803d'
                            }
                        },
                        '&:hover': {
                            bgcolor: 'rgba(34, 197, 94, 0.15)'
                        }
                    }}
                    deleteIcon={<X size={14} />}
                />
            </Box>
        )}

        {/* Standards Modal */}
        <StandardsModal
            open={showStandardsModal}
            onClose={() => setShowStandardsModal(false)}
            selectedStandards={formState.selectedStandards || []}
            onStandardsChange={(standards) => {
                handleFormChange('selectedStandards', standards);
                setShowStandardsModal(false);
            }}
            // Add these new props
            defaultGrade={formState.gradeLevel}
            defaultSubject={formState.subjectFocus}
        />


            {/* Main Popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
                PaperProps={{
                    sx: {
                        mt: 0.5,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        minWidth: '200px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }
                }}
            >
                <Paper elevation={0} sx={{ py: 0.5 }}>
                    {activeFilter === 'resourceType' && [
                        { label: 'Presentation', type: 'presentation', hasSubmenu: true, disabled: false },
                        { label: 'Lesson Plan', type: 'lessonPlan', disabled: false },
                        { label: 'Worksheet', type: 'worksheet', disabled: false },
                        { label: 'Quiz/Test', type: 'quiz', disabled: false }
                    ].map((option) => {
                        // Check if this option is selected in the array
                        const isSelected = Array.isArray(formState.resourceType) 
                            ? formState.resourceType.includes(option.label)
                            : formState.resourceType === option.label;
                            
                        return (
                            <MenuOption
                                key={option.type}
                                label={option.label}
                                isSelected={isSelected}
                                hasSubmenu={option.hasSubmenu}
                                disabled={option.disabled}
                                onClick={(e) => handleOptionSelect(option.label, e)}
                                onMouseEnter={(e) => handleOptionHover(e, option)}
                            />
                        );
                    })}
                    
                    {activeFilter === 'gradeLevel' && FORM.GRADES.map((grade) => (
                        <MenuOption
                            key={grade}
                            label={grade}
                            isSelected={formState.gradeLevel === grade}
                            onClick={() => handleOptionSelect(grade)}
                        />
                    ))}

                    {activeFilter === 'subjectFocus' && (
                        <>
                            {FORM.SUBJECTS.map((subject) => (
                                <MenuOption
                                    key={subject}
                                    label={subject}
                                    isSelected={formState.subjectFocus === subject}
                                    onClick={() => handleOptionSelect(subject)}
                                />
                            ))}
                            
                            {/* Custom Subject Input */}
                            {formState.subjectFocus === 'Other (specify)' && (
                                <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E2E8F0' }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Enter custom subject, then press Enter..."
                                        value={formState.customSubject || ''}
                                        onChange={(e) => {
                                            // Allow only letters, spaces, and basic punctuation
                                            const sanitizedValue = e.target.value
                                                .replace(/[^a-zA-Z\s\-'&().]/g, '')
                                                .slice(0, 50);
                                            handleFormChange('customSubject', sanitizedValue);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (formState.customSubject?.trim()) {
                                                    // Brief success feedback before closing
                                                    e.target.style.backgroundColor = '#dcfce7';
                                                    e.target.style.borderColor = '#16a34a';
                                                    setTimeout(() => {
                                                        handleClose();
                                                    }, 200);
                                                }
                                            }
                                        }}
                                        helperText={
                                            (() => {
                                                const length = (formState.customSubject || '').length;
                                                const hasValidContent = formState.customSubject?.trim();
                                                
                                                if (hasValidContent) {
                                                    return `${length}/50 characters • Press Enter to confirm ✓`;
                                                } else if (length > 0) {
                                                    return `${length}/50 characters • Enter at least one letter`;
                                                } else {
                                                    return `${length}/50 characters • e.g., "Robotics", "AP Biology"`;
                                                }
                                            })()
                                        }
                                        error={formState.customSubject && !/^[a-zA-Z\s\-'&().]+$/.test(formState.customSubject)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '0.875rem',
                                                backgroundColor: formState.customSubject?.trim() ? '#f0f9ff' : 'white',
                                                borderColor: formState.customSubject?.trim() ? '#0ea5e9' : undefined,
                                            },
                                            '& .MuiFormHelperText-root': {
                                                fontSize: '0.75rem',
                                                margin: '4px 0 0 0',
                                                color: formState.customSubject?.trim() ? '#0ea5e9' : undefined,
                                            }
                                        }}
                                        autoFocus
                                    />
                                </Box>
                            )}
                        </>
                    )}

                    {activeFilter === 'language' && FORM.LANGUAGES.map((language) => (
                        <MenuOption
                            key={language}
                            label={language}
                            isSelected={formState.language === language}
                            onClick={() => handleOptionSelect(language)}
                        />
                    ))}
                </Paper>
            </Popover>

            {/* Presentation Options */}
            {Array.isArray(formState.resourceType) && 
             formState.resourceType.includes('Presentation') && (
                <PresentationOptions
                    open={activeSubmenu === 'presentation'}
                    anchorEl={submenuAnchorEl}
                    numSlides={formState.numSlides}
                    includeImages={formState.includeImages}
                    onSlideNumberSelect={(num) => {
                        handleFormChange('numSlides', num);
                        handleClose();
                    }}
                    onImageOptionChange={(checked) => {
                        handleFormChange('includeImages', checked);
                    }}
                    onClose={handleClose}
                />
            )}
        </Box>
    );
};

export default FiltersBar;