# LMS Trainer Module - REST API Documentation

## Phase 2: Complete Backend API Endpoints

This document provides comprehensive REST API documentation for the LMS Trainer Module. All endpoints use Supabase PostgreSQL as the database and Supabase Storage for media files.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Courses](#courses)
3. [Units](#units)
4. [Video Units](#video-units)
5. [Audio Units](#audio-units)
6. [Presentation Units](#presentation-units)
7. [Text Units](#text-units)
8. [Page Units](#page-units)
9. [Quizzes & Questions](#quizzes--questions)
10. [Assignments](#assignments)
11. [SCORM/xAPI](#scormxapi)
12. [Surveys](#surveys)
13. [Enrollments](#enrollments)
14. [Progress Tracking](#progress-tracking)
15. [Reports](#reports)
16. [Leaderboard](#leaderboard)
17. [Storage/Media](#storagemedia)

---

## Base URL

All API calls are made through the Supabase client which automatically handles authentication and row-level security.

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## Authentication

### Sign Up

**Method:** `POST`
**Endpoint:** `supabase.auth.signUp()`

**Request Payload:**
```json
{
  "email": "trainer@example.com",
  "password": "SecurePassword123!",
  "options": {
    "data": {
      "full_name": "John Trainer",
      "role": "trainer"
    }
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "trainer@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid email or password
- `422` - User already exists

---

### Sign In

**Method:** `POST`
**Endpoint:** `supabase.auth.signInWithPassword()`

**Request Payload:**
```json
{
  "email": "trainer@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "trainer@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid credentials

---

### Get Profile

**Method:** `GET`
**Endpoint:** `supabase.from('profiles').select('*').eq('id', userId)`

**Response:**
```json
{
  "id": "uuid",
  "email": "trainer@example.com",
  "full_name": "John Trainer",
  "role": "trainer",
  "avatar_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Profile not found

---

## Courses

### Get All Courses (Trainer's)

**Method:** `GET`
**Endpoint:** `supabase.from('courses').select('*').eq('created_by', userId)`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "JavaScript Fundamentals",
    "description": "Learn JavaScript from scratch",
    "category": "Technology",
    "language": "English",
    "thumbnail_url": "https://...",
    "status": "published",
    "visibility": "public",
    "sequential_access": false,
    "completion_rule": "all_units",
    "certificate_enabled": true,
    "created_by": "trainer_uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Get Single Course

**Method:** `GET`
**Endpoint:** `supabase.from('courses').select('*').eq('id', courseId)`

**Response:**
```json
{
  "id": "uuid",
  "title": "JavaScript Fundamentals",
  "description": "Learn JavaScript from scratch",
  "category": "Technology",
  "language": "English",
  "thumbnail_url": "https://...",
  "status": "published",
  "visibility": "public",
  "sequential_access": false,
  "completion_rule": "all_units",
  "certificate_enabled": true,
  "created_by": "trainer_uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Course not found

---

### Create Course

**Method:** `POST`
**Endpoint:** `supabase.from('courses').insert()`

**Request Payload:**
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Learn JavaScript from scratch",
  "category": "Technology",
  "language": "English",
  "thumbnail_url": "https://...",
  "status": "draft",
  "visibility": "private",
  "sequential_access": false,
  "completion_rule": "all_units",
  "certificate_enabled": false,
  "created_by": "trainer_uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "JavaScript Fundamentals",
  "status": "draft",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

### Update Course

**Method:** `PUT`
**Endpoint:** `supabase.from('courses').update().eq('id', courseId)`

**Request Payload:**
```json
{
  "title": "Advanced JavaScript",
  "status": "published",
  "updated_at": "2024-01-02T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Advanced JavaScript",
  "status": "published",
  "updated_at": "2024-01-02T00:00:00Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid data
- `401` - Unauthorized
- `404` - Course not found

---

### Delete Course

**Method:** `DELETE`
**Endpoint:** `supabase.from('courses').delete().eq('id', courseId)`

**Response:**
```json
{
  "message": "Course deleted successfully"
}
```

**Status Codes:**
- `204` - No Content (Success)
- `401` - Unauthorized
- `404` - Course not found

---

## Units

### Get Units by Course

**Method:** `GET`
**Endpoint:** `supabase.from('units').select('*').eq('course_id', courseId).order('order')`

**Response:**
```json
[
  {
    "id": "uuid",
    "course_id": "course_uuid",
    "type": "video",
    "title": "Introduction to JavaScript",
    "order": 0,
    "is_required": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Create Unit

**Method:** `POST`
**Endpoint:** `supabase.from('units').insert()`

**Request Payload:**
```json
{
  "course_id": "course_uuid",
  "type": "video",
  "title": "Introduction to JavaScript",
  "order": 0,
  "is_required": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "course_id": "course_uuid",
  "type": "video",
  "title": "Introduction to JavaScript",
  "order": 0,
  "is_required": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

### Update Unit

**Method:** `PUT`
**Endpoint:** `supabase.from('units').update().eq('id', unitId)`

**Request Payload:**
```json
{
  "title": "Updated Title",
  "is_required": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "is_required": false
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid data
- `401` - Unauthorized

---

### Delete Unit

**Method:** `DELETE`
**Endpoint:** `supabase.from('units').delete().eq('id', unitId)`

**Response:**
```json
{
  "message": "Unit deleted successfully"
}
```

**Status Codes:**
- `204` - No Content (Success)
- `401` - Unauthorized
- `404` - Unit not found

---

## Video Units

### Get Video Unit by Unit ID

**Method:** `GET`
**Endpoint:** `supabase.from('video_units').select('*').eq('unit_id', unitId)`

**Response:**
```json
{
  "id": "uuid",
  "unit_id": "unit_uuid",
  "video_url": "https://storage.supabase.co/.../video.mp4",
  "video_storage_path": "videos/user_id/timestamp.mp4",
  "duration": 600,
  "completion_type": "percentage",
  "required_watch_percentage": 80,
  "allow_skip": false,
  "allow_rewind": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Video unit not found

---

### Create Video Unit

**Method:** `POST`
**Endpoint:** `supabase.from('video_units').insert()`

**Request Payload:**
```json
{
  "unit_id": "unit_uuid",
  "video_url": "https://storage.supabase.co/.../video.mp4",
  "video_storage_path": "videos/user_id/timestamp.mp4",
  "duration": 600,
  "completion_type": "percentage",
  "required_watch_percentage": 80,
  "allow_skip": false,
  "allow_rewind": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "unit_id": "unit_uuid",
  "video_url": "https://storage.supabase.co/.../video.mp4",
  "completion_type": "percentage",
  "required_watch_percentage": 80
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

### Update Video Unit Settings

**Method:** `PUT`
**Endpoint:** `supabase.from('video_units').update().eq('id', videoUnitId)`

**Request Payload:**
```json
{
  "completion_type": "full",
  "allow_skip": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "completion_type": "full",
  "allow_skip": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid data
- `401` - Unauthorized

---

## Quizzes & Questions

### Get Quiz by Unit ID

**Method:** `GET`
**Endpoint:** `supabase.from('quizzes').select('*').eq('unit_id', unitId)`

**Response:**
```json
{
  "id": "uuid",
  "unit_id": "unit_uuid",
  "time_limit": 30,
  "passing_score": 70,
  "attempts_allowed": 3,
  "show_answers": true,
  "randomize_questions": false,
  "mandatory_completion": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Create Quiz

**Method:** `POST`
**Endpoint:** `supabase.from('quizzes').insert()`

**Request Payload:**
```json
{
  "unit_id": "unit_uuid",
  "time_limit": 30,
  "passing_score": 70,
  "attempts_allowed": 3,
  "show_answers": true,
  "randomize_questions": false,
  "mandatory_completion": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "unit_id": "unit_uuid",
  "time_limit": 30,
  "passing_score": 70
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

### Update Quiz Settings

**Method:** `PUT`
**Endpoint:** `supabase.from('quizzes').update().eq('id', quizId)`

**Request Payload:**
```json
{
  "passing_score": 80,
  "attempts_allowed": 5
}
```

**Response:**
```json
{
  "id": "uuid",
  "passing_score": 80,
  "attempts_allowed": 5
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid data
- `401` - Unauthorized

---

### Get Questions by Quiz ID

**Method:** `GET`
**Endpoint:** `supabase.from('questions').select('*').eq('quiz_id', quizId).order('order')`

**Response:**
```json
[
  {
    "id": "uuid",
    "quiz_id": "quiz_uuid",
    "type": "multiple_choice",
    "text": "What is JavaScript?",
    "options": ["A programming language", "A markup language", "A database"],
    "correct_answer": "A programming language",
    "points": 1,
    "order": 0
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Create Question

**Method:** `POST`
**Endpoint:** `supabase.from('questions').insert()`

**Request Payload:**
```json
{
  "quiz_id": "quiz_uuid",
  "type": "multiple_choice",
  "text": "What is JavaScript?",
  "options": ["A programming language", "A markup language", "A database"],
  "correct_answer": "A programming language",
  "points": 1,
  "order": 0
}
```

**Supported Question Types:**
- `multiple_choice` - Single correct answer
- `multiple_answer` - Multiple correct answers
- `true_false` - True or False
- `fill_blank` - Fill in the blank
- `matching` - Match pairs
- `ordering` - Order items
- `free_text` - Open-ended text response

**Response:**
```json
{
  "id": "uuid",
  "quiz_id": "quiz_uuid",
  "type": "multiple_choice",
  "text": "What is JavaScript?",
  "points": 1
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

## Assignments

### Get Assignment by Unit ID

**Method:** `GET`
**Endpoint:** `supabase.from('assignments').select('*').eq('unit_id', unitId)`

**Response:**
```json
{
  "id": "uuid",
  "unit_id": "unit_uuid",
  "submission_type": "both",
  "due_date": "2024-12-31T23:59:59Z",
  "max_score": 100,
  "instructions": "Complete the JavaScript project"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Create Assignment

**Method:** `POST`
**Endpoint:** `supabase.from('assignments').insert()`

**Request Payload:**
```json
{
  "unit_id": "unit_uuid",
  "submission_type": "both",
  "due_date": "2024-12-31T23:59:59Z",
  "max_score": 100,
  "instructions": "Complete the JavaScript project"
}
```

**Submission Types:**
- `file` - File upload only
- `text` - Text submission only
- `both` - Both file and text allowed

**Response:**
```json
{
  "id": "uuid",
  "unit_id": "unit_uuid",
  "submission_type": "both",
  "max_score": 100
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

### Get Assignment Submissions

**Method:** `GET`
**Endpoint:** `supabase.from('assignment_submissions').select('*').eq('assignment_id', assignmentId)`

**Response:**
```json
[
  {
    "id": "uuid",
    "assignment_id": "assignment_uuid",
    "user_id": "user_uuid",
    "submission_type": "file",
    "submission_text": null,
    "submission_file_url": "https://...",
    "score": 85,
    "feedback": "Great work!",
    "status": "graded",
    "submitted_at": "2024-01-05T00:00:00Z",
    "graded_at": "2024-01-06T00:00:00Z",
    "graded_by": "trainer_uuid"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Grade Assignment Submission

**Method:** `PUT`
**Endpoint:** `supabase.from('assignment_submissions').update().eq('id', submissionId)`

**Request Payload:**
```json
{
  "score": 85,
  "feedback": "Great work! Well done.",
  "status": "graded",
  "graded_at": "2024-01-06T00:00:00Z",
  "graded_by": "trainer_uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "score": 85,
  "feedback": "Great work! Well done.",
  "status": "graded",
  "graded_at": "2024-01-06T00:00:00Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid data
- `401` - Unauthorized

---

## SCORM/xAPI

### Upload SCORM Package

**Method:** `POST`
**Endpoint:** `supabase.storage.from('scorm-packages').upload()`

**Request:**
- Multipart file upload

**Response:**
```json
{
  "url": "https://storage.supabase.co/.../package.zip",
  "path": "scorm/user_id/timestamp.zip"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid file
- `401` - Unauthorized

---

### Create SCORM Package Record

**Method:** `POST`
**Endpoint:** `supabase.from('scorm_packages').insert()`

**Request Payload:**
```json
{
  "unit_id": "unit_uuid",
  "package_type": "scorm_2004",
  "file_url": "https://storage.supabase.co/.../package.zip",
  "file_storage_path": "scorm/user_id/timestamp.zip",
  "version": "2004",
  "completion_tracking": true,
  "score_tracking": true
}
```

**Package Types:**
- `scorm_1_2` - SCORM 1.2
- `scorm_2004` - SCORM 2004
- `xapi` - xAPI (Tin Can API)

**Response:**
```json
{
  "id": "uuid",
  "unit_id": "unit_uuid",
  "package_type": "scorm_2004",
  "file_url": "https://...",
  "completion_tracking": true,
  "score_tracking": true
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

## Enrollments

### Get Enrollments by Course

**Method:** `GET`
**Endpoint:** `supabase.from('enrollments').select('*, user:profiles!enrollments_user_id_fkey(*)').eq('course_id', courseId)`

**Response:**
```json
[
  {
    "id": "uuid",
    "course_id": "course_uuid",
    "user_id": "user_uuid",
    "assigned_by": "trainer_uuid",
    "status": "in_progress",
    "progress_percentage": 45,
    "assigned_at": "2024-01-01T00:00:00Z",
    "started_at": "2024-01-02T00:00:00Z",
    "completed_at": null,
    "user": {
      "id": "user_uuid",
      "full_name": "Jane Learner",
      "email": "jane@example.com"
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Create Enrollment

**Method:** `POST`
**Endpoint:** `supabase.from('enrollments').insert()`

**Request Payload:**
```json
{
  "course_id": "course_uuid",
  "user_id": "user_uuid",
  "assigned_by": "trainer_uuid",
  "status": "assigned"
}
```

**Response:**
```json
{
  "id": "uuid",
  "course_id": "course_uuid",
  "user_id": "user_uuid",
  "status": "assigned",
  "assigned_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data (duplicate enrollment)
- `401` - Unauthorized

---

### Bulk Create Enrollments

**Method:** `POST`
**Endpoint:** `supabase.from('enrollments').insert([...])`

**Request Payload:**
```json
[
  {
    "course_id": "course_uuid",
    "user_id": "user_uuid_1",
    "assigned_by": "trainer_uuid",
    "status": "assigned"
  },
  {
    "course_id": "course_uuid",
    "user_id": "user_uuid_2",
    "assigned_by": "trainer_uuid",
    "status": "assigned"
  }
]
```

**Response:**
```json
{
  "count": 2,
  "message": "Enrollments created successfully"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

### Delete Enrollment

**Method:** `DELETE`
**Endpoint:** `supabase.from('enrollments').delete().eq('id', enrollmentId)`

**Response:**
```json
{
  "message": "Enrollment deleted successfully"
}
```

**Status Codes:**
- `204` - No Content (Success)
- `401` - Unauthorized
- `404` - Enrollment not found

---

## Reports

### Get Course Report

**Method:** `GET`
**Endpoint:** Custom aggregation query

**Response:**
```json
{
  "courseId": "uuid",
  "courseTitle": "JavaScript Fundamentals",
  "totalEnrollments": 50,
  "inProgress": 30,
  "completed": 20,
  "averageProgress": 65,
  "averageScore": 78
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Get Learner Report

**Method:** `GET`
**Endpoint:** Custom aggregation query

**Response:**
```json
{
  "userId": "uuid",
  "userName": "Jane Learner",
  "email": "jane@example.com",
  "coursesEnrolled": 5,
  "coursesCompleted": 3,
  "averageProgress": 80,
  "totalQuizScore": 425,
  "lastActivity": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Export Course Report CSV

**Method:** `GET`
**Endpoint:** Custom export function

**Response:**
```csv
User Name,Email,Status,Progress %,Assigned Date,Completed Date
Jane Learner,jane@example.com,completed,100,01/01/2024,01/15/2024
John Student,john@example.com,in_progress,65,01/05/2024,-
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

## Leaderboard

### Get Leaderboard (All Courses)

**Method:** `GET`
**Endpoint:** `supabase.from('leaderboard').select('*, user:profiles!leaderboard_user_id_fkey(*)').order('rank')`

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "user_uuid",
    "course_id": null,
    "total_points": 850,
    "completed_units": 45,
    "quiz_score_total": 400,
    "activity_points": 55,
    "rank": 1,
    "updated_at": "2024-01-15T00:00:00Z",
    "user": {
      "id": "user_uuid",
      "full_name": "Jane Learner",
      "email": "jane@example.com",
      "avatar_url": "https://..."
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### Get Leaderboard by Course

**Method:** `GET`
**Endpoint:** `supabase.from('leaderboard').select('*, user:profiles!leaderboard_user_id_fkey(*)').eq('course_id', courseId).order('rank')`

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "user_uuid",
    "course_id": "course_uuid",
    "total_points": 250,
    "completed_units": 15,
    "quiz_score_total": 100,
    "activity_points": 15,
    "rank": 1,
    "updated_at": "2024-01-15T00:00:00Z",
    "user": {
      "full_name": "Jane Learner",
      "email": "jane@example.com"
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

## Storage/Media

### Upload Video

**Method:** `POST`
**Endpoint:** `supabase.storage.from('videos').upload()`

**Request:**
- Multipart file upload
- Supported formats: mp4, webm, mov

**Response:**
```json
{
  "url": "https://storage.supabase.co/.../video.mp4",
  "path": "videos/user_id/timestamp.mp4"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid file
- `401` - Unauthorized
- `413` - File too large

---

### Upload Audio

**Method:** `POST`
**Endpoint:** `supabase.storage.from('audio').upload()`

**Request:**
- Multipart file upload
- Supported formats: mp3, wav, ogg

**Response:**
```json
{
  "url": "https://storage.supabase.co/.../audio.mp3",
  "path": "audio/user_id/timestamp.mp3"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid file
- `401` - Unauthorized

---

### Upload Presentation

**Method:** `POST`
**Endpoint:** `supabase.storage.from('presentations').upload()`

**Request:**
- Multipart file upload
- Supported formats: pdf, pptx, ppt

**Response:**
```json
{
  "url": "https://storage.supabase.co/.../presentation.pdf",
  "path": "presentations/user_id/timestamp.pdf"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid file
- `401` - Unauthorized

---

### Upload Thumbnail

**Method:** `POST`
**Endpoint:** `supabase.storage.from('thumbnails').upload()`

**Request:**
- Multipart file upload
- Supported formats: jpg, jpeg, png, webp

**Response:**
```json
{
  "url": "https://storage.supabase.co/.../thumbnail.jpg",
  "path": "thumbnails/user_id/timestamp.jpg"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid file
- `401` - Unauthorized

---

### Delete Media File

**Method:** `DELETE`
**Endpoint:** `supabase.storage.from(bucket).remove([path])`

**Request Parameters:**
- `bucket`: The storage bucket name (videos, audio, presentations, etc.)
- `path`: The file path to delete

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

**Status Codes:**
- `204` - No Content (Success)
- `401` - Unauthorized
- `404` - File not found

---

### Create Media Metadata

**Method:** `POST`
**Endpoint:** `supabase.from('media_metadata').insert()`

**Request Payload:**
```json
{
  "storage_path": "videos/user_id/timestamp.mp4",
  "file_name": "intro-video.mp4",
  "file_type": "video",
  "file_size": 15728640,
  "mime_type": "video/mp4",
  "duration": 600,
  "width": 1920,
  "height": 1080,
  "uploaded_by": "user_uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "storage_path": "videos/user_id/timestamp.mp4",
  "file_name": "intro-video.mp4",
  "file_type": "video",
  "uploaded_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Unauthorized

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

Supabase implements rate limiting at the API level:
- Free tier: 500 requests per second
- Pro tier: 1000 requests per second

---

## Authentication & Security

All API endpoints require authentication via JWT tokens provided by Supabase Auth. Include the token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Row Level Security (RLS) policies ensure trainers can only access their own courses and related data.

---

## Pagination

For endpoints that return lists, pagination is supported:

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .range(0, 9) // First 10 items
  .order('created_at', { ascending: false });
```

---

## Filtering & Sorting

All `SELECT` queries support filtering and sorting:

```typescript
// Filtering
.eq('status', 'published')
.neq('status', 'draft')
.in('category', ['Technology', 'Business'])
.gte('created_at', '2024-01-01')

// Sorting
.order('created_at', { ascending: false })
.order('title', { ascending: true })
```

---

## Websocket/Realtime Support

Supabase provides realtime subscriptions for live updates:

```typescript
const subscription = supabase
  .channel('courses')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'courses' },
    (payload) => {
      console.log('Course changed:', payload);
    }
  )
  .subscribe();
```

---

## Support

For API issues or questions, contact the development team or refer to Supabase documentation at https://supabase.com/docs
