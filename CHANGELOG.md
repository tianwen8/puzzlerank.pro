# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-08-16

### Added
- **Optimized Timezone Logic**: Fixed critical timezone calculation issue for global collection
- **Multiple Cron Schedule**: 9 collection attempts covering New Zealand daylight saving scenarios
- **Enhanced Collection Timing**: Collects immediately when New Zealand enters new day (global earliest)
- **Comprehensive Documentation**: Complete project replication guide with all optimizations

### Fixed
- **Critical Timezone Bug**: System now uses New Zealand time instead of Beijing time for target date calculation
- **Collection Timing**: Prevents missing new answers when NZ is already in new day but Beijing is still previous day
- **Date Calculation Logic**: Ensures correct answer collection regardless of timezone differences

### Enhanced
- **Cron Job Configuration**: 
  - NZDT Coverage (UTC+13): 11:02, 11:06, 11:12 UTC → NZ 00:02, 00:06, 00:12
  - NZST Coverage (UTC+12): 12:02, 12:06, 12:12, 12:20, 12:40, 13:00 UTC → NZ 00:02-01:00
- **Idempotent Design**: Multiple triggers won't create duplicate data
- **Fallback Protection**: Multiple attempts ensure 99.9% collection success rate
- **Debug Logging**: Enhanced timezone and collection status logging

### Technical
- **Timezone Calculation**: Uses New Zealand time (UTC+12/+13) for accurate target date
- **Collection Strategy**: Targets global earliest timezone for immediate answer availability
- **Error Prevention**: Eliminates timezone-based collection delays and missed answers
- **Documentation**: Updated README with complete replication instructions

## [1.3.1] - 2025-08-10

### Fixed
- **SEO Structure**: Fixed H1/H2 heading hierarchy across all pages for better SEO compliance
- **Accessibility**: Improved heading structure for screen readers and web accessibility
- **Content Organization**: Corrected heading levels to follow proper semantic structure (H1 → H2 → H3)

### Enhanced
- **Page Structure**: Optimized heading hierarchy in main pages:
  - `app/page.tsx`: Fixed heading levels for better content organization
  - `app/todays-wordle-answer/page.tsx`: Corrected section headings and subheadings
  - All guide pages now follow proper heading hierarchy
- **SEO Optimization**: Improved semantic HTML structure for better search engine understanding
- **Web Standards**: Enhanced compliance with HTML5 semantic standards

### Technical
- **Code Quality**: Updated heading tags to follow proper nesting order
- **Documentation**: Updated project documentation with latest changes
- **Version Control**: Improved commit structure and change tracking

## [1.3.0] - 2025-08-10

### Added
- **Comprehensive Documentation**: Complete project replication guide in README
- **Database Schema**: Detailed database setup and migration instructions
- **Core Components Documentation**: Scheduler, collector, verifier, database layer docs
- **Troubleshooting Guide**: Common issues and solutions
- **Deployment Guide**: Vercel and other platforms deployment instructions
- **SEO Implementation**: Complete SEO optimization and performance features
- **Contribution Guidelines**: Development and maintenance procedures

### Enhanced
- **README Structure**: Reorganized for better readability and completeness
- **Setup Instructions**: Step-by-step project replication guide
- **Technical Documentation**: Detailed component and system architecture
- **Performance Optimization**: Documentation for speed and SEO improvements

## [1.2.0] - 2025-01-12

### Fixed
- **Google OAuth Login Data Sync**: Fixed issue where Google login users didn't see their statistics after authentication
- **User Statistics Creation**: Enhanced automatic user stats creation for OAuth users
- **Development Environment**: Fixed OAuth callback handling in local development

### Enhanced
- **Authentication Flow**: Improved user state management and data loading sequence
- **User Data Handling**: Better extraction of user information from Google OAuth response
- **Error Handling**: Added comprehensive error handling and logging for debugging

### Added
- **Troubleshooting Guide**: Comprehensive documentation for common issues
- **Development Setup**: Detailed instructions for local development with OAuth
- **Debug Logging**: Enhanced console logging for authentication and data sync issues

### Changed
- **Documentation**: Updated README with detailed setup instructions
- **Environment Configuration**: Improved guidance for development vs production setup
- **Code Comments**: Added detailed code comments for better maintainability

## [1.1.0] - 2025-01-11

### Added
- **Real-time Leaderboard**: Global player rankings with live updates
- **Statistics Dashboard**: Comprehensive player statistics tracking
- **Session Management**: Automatic token refresh and session handling
- **Mobile Optimization**: Enhanced mobile responsiveness and touch controls
- **PWA Support**: Progressive Web App capabilities for better user experience
- **SEO Optimization**: Complete meta tags, Open Graph, and structured data
- **Analytics Integration**: Google Analytics and Microsoft Clarity tracking

### Enhanced
- **User Interface**: Modern, responsive design with smooth animations
- **Game Performance**: Optimized game logic and rendering
- **Database Structure**: Improved database schema and RLS policies

### Fixed
- **Authentication Issues**: Resolved various login and registration problems
- **Data Persistence**: Fixed game state saving and loading
- **Mobile Compatibility**: Addressed mobile-specific UI issues

## [1.0.0] - 2025-01-10

### Added
- **Core Game Functionality**: Complete 2048 game implementation
- **User Authentication**: Email/password and Google OAuth login
- **Basic Statistics**: Score tracking and game history
- **Strategy Guide**: Comprehensive game tips and techniques
- **Database Integration**: Supabase backend with PostgreSQL
- **Responsive Design**: Mobile-first responsive layout

### Technical
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Database**: Supabase with real-time subscriptions
- **Deployment**: Vercel deployment configuration
- **TypeScript**: Full TypeScript implementation

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
- **Enhanced**: Improvements to existing features
- **Technical**: Technical/infrastructure changes 