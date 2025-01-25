import React, { useState } from 'react';
import { Box, Typography, Popover, Paper, Checkbox, FormControlLabel } from '@mui/material';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FORM } from '../../utils/constants/form';
import StandardsModal from '../modals/StandardsModal';

const MenuOption = ({ 
    label, 
    isSelected, 
    hasSubmenu = false,
    onClick,
    onMouseEnter,
    disabled = false,
    style = {}
}) => (
    <Box
        onClick={disabled ? undefined : onClick}
        onMouseEnter={onMouseEnter}
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 0.75,
            px: 2,
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: 'transparent',
            transition: 'all 0.2s',
            opacity: disabled ? 0.5 : 1,
            '&:hover': {
                backgroundColor: disabled ? 'transparent' : '#F1F5F9'
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

const FilterButton = ({ label, isSelected, onClick }) => (
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
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            minWidth: '115px',
            '&:hover': {
                backgroundColor: '#F8FAFC',
                borderColor: '#CBD5E1'
            }
        }}
    >
        <Typography sx={{ 
            color: isSelected ? '#1E293B' : '#64748B',
            fontSize: '0.9375rem',
            fontWeight: isSelected ? 600 : 500
        }}>
            {label}
        </Typography>
        <ChevronDown size={18} color={isSelected ? '#1E293B' : '#94A3B8'} />
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
            vertical: 'top',
            horizontal: 'right'
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
        }}
        PaperProps={{
            sx: {
                mt: 0,
                ml: -0.5,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                border: '1px solid #E2E8F0',
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
        if (option.hasSubmenu && option.type === 'presentation') {
            setSubmenuAnchorEl(event.currentTarget);
            setActiveSubmenu(option.type);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSubmenuAnchorEl(null);
        setActiveFilter(null);
        setActiveSubmenu(null);
    };

    const handleOptionSelect = (option) => {
        if (activeFilter === 'resourceType') {
            if (option === 'Presentation') {
                handleFormChange(activeFilter, option);
                if (!formState.numSlides) {
                    handleFormChange('numSlides', 5);
                }
            }
        } else {
            handleFormChange(activeFilter, option);
            handleClose();
        }
    };

    return (
        <Box sx={{ 
            display: 'flex',
            gap: 1.5,
            mb: 3,
            flexWrap: 'wrap', // Allow wrapping on smaller screens
            justifyContent: 'flex-start'
          }}>
            {/* Resource Button */}
            <FilterButton
                label={formState.resourceType || "Resource"}
                isSelected={!!formState.resourceType}
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
                label={formState.subjectFocus || "Subject"}
                isSelected={!!formState.subjectFocus}
                onClick={(e) => handleFilterClick(e, 'subjectFocus')}
            />

            {/* Standards Button */}
            <FilterButton
                label={
                    formState.selectedStandards?.length
                        ? `${formState.selectedStandards.length} Standard${
                            formState.selectedStandards.length === 1 ? '' : 's'
                          } Selected`
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

            {/* Standards Modal */}
            <StandardsModal
                open={showStandardsModal}
                onClose={() => setShowStandardsModal(false)}
                selectedStandards={formState.selectedStandards || []}
                onStandardsChange={(standards) => {
                    handleFormChange('selectedStandards', standards);
                    setShowStandardsModal(false);
                }}
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
                        { label: 'Lesson Plan', type: 'lessonPlan', disabled: true },
                        { label: 'Worksheet', type: 'worksheet', disabled: true },
                        { label: 'Quiz/Test', type: 'quiz', disabled: true }
                    ].map((option) => (
                        <MenuOption
                            key={option.type}
                            label={option.label}
                            isSelected={formState.resourceType === option.label}
                            hasSubmenu={option.hasSubmenu}
                            disabled={option.disabled}
                            onClick={() => handleOptionSelect(option.label)}
                            onMouseEnter={(e) => handleOptionHover(e, option)}
                        />
                    ))}
                    
                    {activeFilter === 'gradeLevel' && FORM.GRADES.map((grade) => (
                        <MenuOption
                            key={grade}
                            label={grade}
                            isSelected={formState.gradeLevel === grade}
                            onClick={() => handleOptionSelect(grade)}
                        />
                    ))}

                    {activeFilter === 'subjectFocus' && FORM.SUBJECTS.map((subject) => (
                        <MenuOption
                            key={subject}
                            label={subject}
                            isSelected={formState.subjectFocus === subject}
                            onClick={() => handleOptionSelect(subject)}
                        />
                    ))}

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
            {formState.resourceType === 'Presentation' && (
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