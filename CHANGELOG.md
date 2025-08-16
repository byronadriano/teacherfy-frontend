# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Multi-Resource Visual Indicators**: Enhanced RecentsList with overlapping icons for multiple resource types
- **Smart Title Generation**: Resource previews now show actual content titles instead of generic names
- **Advanced Debugging System**: Environment-specific console logging with emoji indicators for better development experience
- **Enhanced UI Layout**: Improved sidebar history popover with better mobile responsiveness

### Changed
- Removed ResourceManager UI components and always show OutlineDisplay
- Simplified LessonBuilder interface by removing resource management tab
- Simplified recent resources list logic after backend duplicate prevention implementation
- **RecentsList Complete Rewrite**: Major enhancement with multi-resource support, content-aware titles, and improved visual hierarchy
- **History Service Optimization**: Environment-specific cache timeouts (1s dev, 5s prod) for better debugging
- **Code Cleanup**: Removed outdated optimization and integration guide files

### Fixed
- **Major**: Eliminated duplicate entries in recent resources list
  - Added client-side deduplication logic for history items with same content but different database IDs
  - Fixed infinite reloading issue in RecentsList component caused by useEffect dependency cycles
  - Removed `loading` state from fetchHistory callback dependencies to prevent render loops
  - Enhanced duplicate detection using content-based keys instead of database IDs
- **History Service Improvements**:
  - Fixed `trackLessonGeneration` to create single history items instead of multiple entries per resource type
  - Enhanced duplicate checking in `saveHistoryItem` with timestamp-based detection (5-minute windows)
  - Improved local storage duplicate detection for anonymous users
  - Added `cleanupDuplicates` function to remove existing duplicate entries
- **Resource Type Detection**: Enhanced logic to detect generated resources from `generatedResources` object
- **Git Workflow**: Resolved staging conflicts between basic fixes and advanced enhancements
- **Performance**: Reduced bundle size by 234B by removing unnecessary client-side deduplication after backend fixes
- Comprehensive resource display and download improvements
- IncludeImages flag properly passed to API endpoints
- CSS build error in mobile.css resolved
- Fixed React import warning by removing unused React import in RecentsList.jsx

### Backend Integration
- Coordinated with backend team to implement comprehensive duplicate prevention:
  - Database migration removed 80+ duplicate entries with unique constraints on (user_id, content_hash, activity_date)
  - Added content hashing for efficient duplicate detection
  - Implemented UPSERT logic with request deduplication middleware
  - Frontend now trusts backend data integrity and simplified duplicate prevention logic

### Technical Improvements
- **Enhanced Resource Preview**: Show actual section titles from presentations and worksheets
- **Multi-Resource Icons**: Visual indication when resources contain multiple types (presentation + quiz + worksheet)
- **Content-Aware Titles**: Display second section titles for presentations (skip generic "Learning Objectives")
- **Improved Error Handling**: Better debugging with detailed console logs for development
- **Mobile UI Enhancements**: Better touch interactions and responsive design for sidebar components

## [0.4.0] - 2025-08-14

### Added
- Enhanced lesson plan display with objectives, materials, procedures, activities, assessment, homework, standards, and teacher notes
- Improved worksheet display with structured_activities, exercises, and problems parsing
- Enhanced quiz display with structured_questions, answers, answer_key, and differentiation_tips
- Comprehensive fallback rendering for unknown data structures
- Smart download logic that regenerates resources when blob data is missing

### Changed
- Restructured switch statement in OutlineDisplay to eliminate ESLint warnings
- Temporarily disabled "Notify me" functionality pending backend implementation

### Fixed
- IncludeImages flag now properly passed to generateMultiResource and generatePptx API methods
- Resolved empty downloads from recent resources
- Fixed CSS build error caused by malformed comment in mobile.css

### Removed
- ResourceManager UI component and related files (ResourceCard.jsx, ResourceManager.jsx)
- Unused imports in LessonBuilder

### Security
- Enhanced resource regeneration logic to prevent serving stale blob data

---

## Version History Summary

- **0.4.0**: Major UI simplification and resource display improvements
- **0.3.x**: Resource management and download functionality
- **0.2.x**: Core lesson builder features
- **0.1.x**: Initial project setup and basic functionality