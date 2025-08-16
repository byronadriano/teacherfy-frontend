# Teacherfy.ai Frontend

AI-powered educational resource creator that helps K-12 teachers generate personalized learning materials with optional student data integration for learning gap analysis.

## Overview

Teacherfy.ai is a React-based web application that enables teachers to create customized educational content using artificial intelligence. The platform analyzes optional student performance data to identify learning gaps and generates targeted resources including presentations, worksheets, quizzes, and lesson plans.

### Key Features

- **AI-Powered Resource Generation**: Create presentations, worksheets, quizzes, and lesson plans
- **Learning Gap Analysis**: Optional student data input for personalized content targeting
- **Multi-Format Export**: Download resources as PDF, PPTX, DOCX, and more
- **Real-Time Preview**: Inline editing and preview capabilities
- **Resource Library**: Save and organize generated materials
- **Privacy-First Design**: Secure handling of optional student data with clear consent flows

## Technology Stack

- **Frontend Framework**: React 18.3.1
- **UI Library**: Material-UI (MUI) 6.3.0 with Emotion styling
- **Routing**: React Router DOM 7.1.3
- **Icons**: Lucide React & MUI Icons
- **Build Tool**: Create React App 5.0.1
- **Authentication**: Context-based auth system

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd teacherfy-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm start` - Runs the development server
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── background/     # Background job panels
│   ├── common/         # Shared components
│   ├── filters/        # Filter components
│   ├── form/           # Form components
│   ├── loading/        # Loading indicators
│   ├── modals/         # Modal dialogs
│   └── sidebar/        # Sidebar components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   └── LessonBuilder/  # Main lesson builder interface
├── services/           # API and business logic
├── styles/             # Global styles and themes
└── utils/              # Utility functions and constants
```

## Core Workflows

### 1. Resource Creation Flow
Users select resource type → specify content details → optionally input student data → generate AI-powered content → preview and edit → download/save.

### 2. Student Data Integration (Optional)
Upload student performance data → system analyzes learning gaps → generates targeted content recommendations → creates personalized resources.

### 3. Resource Management
Generated resources are saved to a personal library with preview, edit, and re-download capabilities.

## Key Components

- **LessonBuilder** (`src/pages/LessonBuilder/`): Main interface for resource creation
- **OutlineDisplay** (`src/pages/LessonBuilder/components/OutlineDisplay.jsx`): Displays and renders generated content
- **CustomizationForm** (`src/components/form/CustomizationForm.jsx`): Resource customization interface
- **AuthContext** (`src/contexts/AuthContext.js`): Authentication state management

## Services

- **presentation.js**: Handles AI resource generation API calls
- **backgroundProcessor.js**: Manages asynchronous content processing
- **outline.js**: Manages content outline operations
- **analytics.js**: Tracks user interactions and performance

## Privacy & Security

- Optional student data usage with clear consent flows
- Data anonymization options
- Secure file upload handling
- Clear data retention policies
- GDPR-compliant data deletion workflows

## Development Guidelines

### Code Organization
- Edit existing files directly instead of creating copies
- Use git for version control instead of backup files
- Follow established React patterns and MUI conventions
- Maintain responsive design for teacher workflow efficiency

### Prohibited Actions
- Creating backup files with suffixes (`file_old.js`, `file_v2.js`)
- Multiple file versions in working directory
- Parallel file structures for similar functionality

## Contributing

1. Follow the existing code style and conventions
2. Ensure responsive design compatibility
3. Test with different resource types and data inputs
4. Maintain privacy-conscious data handling practices

## License

This project is proprietary software for educational use.

---

For detailed technical documentation, see `CLAUDE.md` and `FRONTEND_INTEGRATION_GUIDE.md`.
