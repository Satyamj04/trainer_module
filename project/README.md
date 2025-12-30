# LMS Trainer Module - Complete System

A comprehensive Learning Management System (LMS) Trainer Module built with React, TypeScript, and Supabase. This system provides trainers with complete control over course creation, content management, learner enrollment, progress tracking, and analytics.

## Features

### 🎯 Core Functionality

#### 1. **Trainer Dashboard**
- Real-time statistics (total courses, active learners, completion rates)
- Quick actions for course creation and reports
- Leaderboard widget showing top performers
- Recent activity tracking

#### 2. **Course Management**
- **Create Course** with all configuration options:
  - Basic Information: Title, Description, Category, Language
  - Thumbnail upload
  - Status: Draft/Published
  - Visibility: Private/Public/Restricted
  - Sequential access toggle
  - Completion rules: All units or Required units only
  - Certificate toggle
- **Course Builder** with drag-and-drop unit management
- Course preview functionality
- Bulk operations support

#### 3. **11 Unit Types Supported**
1. **Text** - Rich text content units
2. **Video** - Video content with completion tracking
   - Upload or embed videos
   - Completion type: Full watch or percentage
   - Allow/disallow skip and rewind
   - S3 storage integration
3. **Audio** - Audio file units
4. **Presentation** - PDF/PPT presentations
5. **SCORM** - SCORM 1.2 and 2004 packages
6. **xAPI** - Tin Can API packages
7. **Quiz** - Assessments with 7 question types
8. **Test** - Formal testing (same as Quiz)
9. **Assignment** - File/text submissions with grading
10. **Survey** - Learner feedback collection
11. **Page** - TalentCraft-style authored content

#### 4. **Quiz/Test Builder**
- **7 Question Types:**
  1. Multiple Choice (single answer)
  2. Multiple Answer (multiple correct answers)
  3. True/False
  4. Fill in the Blank
  5. Matching
  6. Ordering
  7. Free Text
- **Quiz Settings:**
  - Time limit configuration
  - Passing score (percentage)
  - Attempts allowed
  - Show answers toggle
  - Randomize questions
  - Mandatory completion

#### 5. **Assignment Module**
- **Submission Types:**
  - File upload
  - Text submission
  - Both file and text
- Due date management
- Manual grading system
- Feedback field for trainers
- Score tracking

#### 6. **SCORM/xAPI Support**
- Upload SCORM 1.2, SCORM 2004, xAPI packages
- Completion tracking
- Score tracking
- Launch and preview functionality
- S3 storage for packages

#### 7. **Enrollment Management**
- Assign courses to individual learners or groups
- Bulk enrollment support
- Track enrollment status:
  - Assigned
  - In Progress
  - Completed
- Progress percentage tracking
- Remove enrollments

#### 8. **Progress Tracking**
- Real-time learner progress monitoring
- Unit-level completion tracking
- Watch percentage for video units
- Quiz scores and attempts
- Assignment submissions and grades

#### 9. **Reports & Analytics**
- **Course Reports:**
  - Total enrollments
  - In progress count
  - Completed count
  - Average progress
  - Average quiz scores
- **Learner Reports:**
  - Courses enrolled
  - Courses completed
  - Progress percentage
  - Quiz performance
  - Last activity
- **Export Options:**
  - CSV export
  - PDF export (future)

#### 10. **Leaderboard (NEW FEATURE)**
- Ranking based on:
  - Total points (10 points per completed unit)
  - Quiz scores
  - Activity points
- **Filters:**
  - All courses view
  - Course-specific view
  - Time-based filtering (future)
- Visual ranking with medals for top 3
- Trainer read-only access
- Real-time updates

### 🔒 Security Features

- JWT-based authentication via Supabase Auth
- Role-based access control (Trainer/Learner)
- Row Level Security (RLS) policies on all tables
- Trainers can only access their own courses
- Secure file storage with access controls
- Password encryption

### 📦 Storage & Media

- **S3-Compatible Storage (Supabase Storage)**
- **Dedicated Buckets:**
  - Videos
  - Audio files
  - Presentations
  - SCORM packages
  - Thumbnails
  - Assignment files
  - Avatars
- Metadata tracking for all media files
- CDN delivery for optimal performance

## Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icons

### Backend
- **Supabase PostgreSQL** - Relational database
- **Supabase Auth** - Authentication
- **Supabase Storage** - S3-compatible file storage
- **Supabase Realtime** - Live updates (optional)

### Database Schema

#### Core Tables
- `profiles` - User profiles with roles
- `courses` - Course metadata
- `units` - Course units (11 types)
- `video_units` - Video-specific settings
- `audio_units` - Audio-specific settings
- `presentation_units` - Presentation settings
- `text_units` - Text content
- `page_units` - Authored pages (JSON)
- `quizzes` - Quiz configuration
- `questions` - Quiz questions
- `assignments` - Assignment settings
- `scorm_packages` - SCORM/xAPI packages
- `surveys` - Survey configuration
- `enrollments` - Course assignments
- `unit_progress` - Progress tracking
- `assignment_submissions` - Submissions & grades
- `quiz_attempts` - Quiz attempt tracking
- `leaderboard` - Ranking & points
- `media_metadata` - File metadata

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install Dependencies

```bash
npm install
```

### Database Setup

The database schema is automatically applied via Supabase migrations. The migration file includes:
- All table definitions
- Row Level Security policies
- Indexes for performance
- Foreign key constraints

### Storage Buckets

Create the following storage buckets in Supabase:
1. `videos`
2. `audio`
3. `presentations`
4. `scorm-packages`
5. `thumbnails`
6. `assignments`
7. `avatars`

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Usage Guide

### 1. Sign Up as Trainer

- Navigate to the login page
- Click "Sign up"
- Enter email, password, full name
- Role is automatically set to "trainer"

### 2. Create Your First Course

1. From Dashboard, click "Create Course"
2. Fill in basic information:
   - Title (required)
   - Description
   - Category
   - Language
   - Upload thumbnail
3. Configure course settings:
   - Set visibility (Private/Public/Restricted)
   - Choose completion rule
   - Enable/disable certificate
   - Toggle sequential access
4. Click "Save as Draft" or "Publish"

### 3. Build Course Content

1. After creating a course, you're taken to the Course Builder
2. Click "Add Unit" to create content
3. Choose from 11 unit types
4. Configure unit settings:
   - Set title
   - Mark as required/optional
   - Reorder units via drag-and-drop
5. Click "Edit [type] Content" to configure unit-specific settings

### 4. Add Video Unit

1. Create a Video unit
2. Upload video file or paste embed URL
3. Configure completion settings:
   - Full watch or percentage-based
   - Set required watch percentage
   - Allow/disallow skip and rewind
4. Save settings

### 5. Create Quiz/Test

1. Create a Quiz or Test unit
2. Configure quiz settings:
   - Time limit (optional)
   - Passing score
   - Number of attempts
   - Show answers toggle
   - Randomize questions
3. Add questions (7 types available)
4. Set correct answers and points
5. Save quiz

### 6. Enroll Learners

1. From Course Builder, click "Manage Enrollments"
2. Click "Enroll Learners"
3. Search and select learners
4. Click "Enroll" to assign course

Trainer API notes:
- The backend exposes trainer-specific endpoints (aliases under `/api/trainer/v1/*`) for trainer-only actions such as duplicating a course (`POST /api/trainer/v1/course/{id}/duplicate/`).
- To call these endpoints from the frontend, create a DRF token for your trainer user and store it in localStorage under the key `trainerToken`.
  - Locally: run `python project/scripts/create_token_sql.py trainer_user@example.com` to print or create the token.
  - In the browser devtools console, run `localStorage.setItem('trainerToken', '<token>')`.
- The frontend `courseService.duplicateCourse(id)` method will use `trainerToken` automatically when present.

Changelog (2025-12-29):
- Applied the supplied PostgreSQL DDL to local DB and aligned Django models/migrations to match the DDL (users.user_id PK, modules, courses, sequencing, completions, etc.).
- Executed Mongo collection setup (validators & indexes) for module content items and media.
- Fixed migration mapping issues and added `courses.0003_create_authtoken_table` to create `authtoken_token` referencing `users(user_id)`.
- Added scripts for developer convenience:
  - `project/scripts/create_token_sql.py` — create/fetch a DRF token for a user.
  - `project/scripts/smoke_trainer_api.py` — authenticated smoke test hitting trainer endpoints.
  - other helper scripts for SQL/migration tasks.
- Implemented trainer-specific API actions and route aliases under `/api/trainer/v1/*` (duplicate, sequence GET/PUT, assign, module preview).
- Added minimal frontend support for trainer duplication (`src/services/courseService.ts::duplicateCourse`) and UI button in `src/components/CourseList.tsx` to trigger duplication.
- Added CI integration workflow `.github/workflows/integration.yml` that runs migrations and the authenticated smoke test to prevent regressions.

Notes:
- To duplicate a course in dev: create a DRF token for your trainer user (`python project/scripts/create_token_sql.py trainer_user@example.com`) and run `localStorage.setItem('trainerToken', '<token>')` in the browser; then use the Duplicate button in the Courses list.
- If you'd like, I can add a small success toast instead of `alert()` UI messaging and add an inline link to the duplicated course builder screen.

5. Track progress in enrollment table

### 7. Monitor Progress

- View enrollment status (Assigned/In Progress/Completed)
- Check progress percentage
- Review quiz scores
- Grade assignment submissions

### 8. View Reports

1. Navigate to "Reports" from sidebar
2. Select a course
3. View statistics:
   - Total enrollments
   - In progress
   - Completed
   - Average scores
4. Export to CSV

### 9. Check Leaderboard

1. Navigate to "Leaderboard" from sidebar
2. Filter by course or view all
3. See top performers with:
   - Total points
   - Completed units
   - Quiz scores
   - Rankings with medals for top 3

## API Documentation

Complete REST API documentation is available in `API_DOCUMENTATION.md`, including:

- Authentication endpoints
- Course management APIs
- Unit management APIs
- Quiz/Question APIs
- Assignment APIs
- Enrollment APIs
- Report APIs
- Leaderboard APIs
- Storage/Media APIs

All endpoints include:
- Request/response formats
- Status codes
- Error handling
- Examples

## Architecture

### Frontend Architecture

```
src/
├── components/           # React components
│   ├── Login.tsx        # Authentication
│   ├── Layout.tsx       # App layout with sidebar
│   ├── Dashboard.tsx    # Trainer dashboard
│   ├── CourseList.tsx   # Course listing
│   ├── CreateCourse.tsx # Course creation form
│   ├── CourseBuilder.tsx # Course builder UI
│   ├── Enrollment.tsx   # Enrollment management
│   ├── Reports.tsx      # Reports & analytics
│   ├── Leaderboard.tsx  # Leaderboard view
│   └── units/           # Unit type editors
│       ├── VideoUnitEditor.tsx
│       ├── QuizEditor.tsx
│       └── ...
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── services/            # API services
│   ├── courseService.ts
│   ├── unitService.ts
│   ├── quizService.ts
│   ├── enrollmentService.ts
│   ├── reportService.ts
│   ├── leaderboardService.ts
│   └── storageService.ts
├── types/               # TypeScript types
│   └── index.ts
├── lib/                 # Libraries & config
│   └── supabase.ts      # Supabase client
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

### Database Architecture

- **PostgreSQL** for relational data
- **Row Level Security** for authorization
- **Foreign keys** for referential integrity
- **Indexes** for query performance
- **JSONB columns** for flexible data (quiz options, page content)

### Storage Architecture

- **Supabase Storage** (S3-compatible)
- **Bucket-based organization** for different media types
- **Metadata tracking** in database
- **CDN delivery** for fast access

## Security Considerations

### Authentication
- JWT tokens with secure expiration
- Password hashing via Supabase Auth
- Session management

### Authorization
- Role-based access control (RBAC)
- Row Level Security policies
- Trainers can only access their own data

### Data Protection
- RLS ensures data isolation
- Encrypted connections (HTTPS)
- Secure file upload validation
- CORS configuration

### Input Validation
- Frontend validation
- Database constraints
- Type checking via TypeScript

## Performance Optimization

- **Code splitting** via Vite
- **Lazy loading** for components
- **Database indexes** on frequently queried columns
- **CDN delivery** for media files
- **Optimistic UI updates**
- **Pagination** for large datasets

## Future Enhancements

### Planned Features
1. **AI Content Generation** (TalentCraft)
   - Auto-generate course content
   - Import from documents
   - Content templates

2. **Advanced Analytics**
   - Learning path analysis
   - Predictive analytics
   - Engagement heatmaps

3. **Communication Features**
   - In-app messaging
   - Announcements
   - Discussion forums

4. **Mobile App**
   - React Native mobile app
   - Offline support
   - Push notifications

5. **Integrations**
   - Zoom/Teams for live sessions
   - Slack/Discord notifications
   - Calendar integrations

6. **Advanced Leaderboard**
   - Time-based competitions
   - Team leaderboards
   - Badges and achievements

## Troubleshooting

### Common Issues

**Issue: Login fails**
- Verify Supabase credentials in `.env`
- Check if user profile was created
- Ensure RLS policies are active

**Issue: File upload fails**
- Check storage bucket permissions
- Verify file size limits
- Ensure correct bucket names

**Issue: Data not loading**
- Check browser console for errors
- Verify RLS policies allow access
- Check network tab for failed requests

## Support

For issues, questions, or contributions:
- Review the API documentation
- Check the troubleshooting section
- Contact the development team

## License

This project is proprietary software. All rights reserved.

## Credits

Built with:
- React & TypeScript
- Supabase
- Tailwind CSS
- Lucide Icons
- Vite

---

**Version:** 1.0.0
**Last Updated:** December 2024
