# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2025-08-16

### Added
- Persistent User Settings with localStorage via `UserSettingsService` and immediate application to forms
- Success feedback and Reset to Defaults in `UserSettingsModal`

### Changed
- Cleaned `LessonBuilder` by removing redundant localStorage loading effect and unused props
- Prefetch heavy components during idle for snappier UX
- Tightened useEffect dependencies to satisfy eslint without suppressions

### Fixed
- Subject filter “Other (specify)” now shows a validated custom input in `FiltersBar`, supports Enter-to-confirm, truncated display, and a removable chip
- Resolved eslint exhaustive-deps warnings in `LessonBuilder/index.js`

### Build
- Production build compiles clean with minor bundle reduction (~60B)

### Changed
- Removed ResourceManager UI components and always show OutlineDisplay
- Simplified LessonBuilder interface by removing resource management tab
- Simplified recent resources list logic after backend duplicate prevention implementation

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