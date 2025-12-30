# Trainer LMS - Django Backend

A complete Learning Management System (LMS) backend built with Django and Django REST Framework.

## Features

- Complete REST API for course management
- Support for 11 content unit types (video, audio, text, quiz, assignment, etc.)
- User authentication with Token Authentication
- Role-based access control (Trainer/Learner)
- File upload handling for media files
- Progress tracking and reporting
- Leaderboard system
- SQLite database (portable and easy to set up)
- Django Admin panel for management

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

### 1. Create a Virtual Environment

```bash
# Navigate to the django-backend folder
cd django-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update the values as needed
# For local development, the defaults are usually fine
```

### 4. Run Migrations

```bash
# Create database tables
python manage.py migrate

# Create a superuser account (for admin access)
python manage.py createsuperuser
```

### 5. Create Initial Data (Optional)

```bash
# You can use the Django shell to create initial data
python manage.py shell
```

Then in the shell:
```python
from courses.models import Profile

# Create a trainer user
trainer = Profile.objects.create_user(
    username='trainer',
    email='trainer@example.com',
    password='trainer123',
    full_name='John Trainer',
    role='trainer'
)

# Create a learner user
learner = Profile.objects.create_user(
    username='learner',
    email='learner@example.com',
    password='learner123',
    full_name='Jane Learner',
    role='learner'
)
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/`

The Django Admin panel will be available at: `http://127.0.0.1:8000/admin/`

## API Endpoints

### Authentication

- `POST /api/auth/login/` - Login and get auth token
  ```json
  {
    "username": "trainer",
    "password": "trainer123"
  }
  ```
  Response:
  ```json
  {
    "token": "your-auth-token-here"
  }
  ```

### Courses

- `GET /api/courses/` - List all courses
- `POST /api/courses/` - Create a new course
- `GET /api/courses/{id}/` - Get course details
- `PUT /api/courses/{id}/` - Update a course
- `DELETE /api/courses/{id}/` - Delete a course
- `GET /api/courses/{id}/units/` - Get all units for a course
- `POST /api/courses/{id}/publish/` - Publish a course

### Units

- `GET /api/units/?course_id={id}` - List units for a course
- `POST /api/units/` - Create a new unit
- `GET /api/units/{id}/` - Get unit details
- `PUT /api/units/{id}/` - Update a unit
- `DELETE /api/units/{id}/` - Delete a unit

### Unit Details (by type)

- `/api/video-units/` - Video unit details
- `/api/audio-units/` - Audio unit details
- `/api/text-units/` - Text unit details
- `/api/page-units/` - Page unit details
- `/api/presentation-units/` - Presentation unit details
- `/api/quizzes/` - Quiz details
- `/api/questions/` - Quiz questions
- `/api/assignments/` - Assignment details
- `/api/scorm-packages/` - SCORM package details
- `/api/surveys/` - Survey details

### Enrollments

- `GET /api/enrollments/?course_id={id}` - List enrollments
- `POST /api/enrollments/` - Enroll a user in a course
- `GET /api/enrollments/{id}/progress/` - Get enrollment progress

### Progress Tracking

- `GET /api/unit-progress/` - Get unit progress
- `POST /api/unit-progress/` - Update unit progress

### Assignments

- `GET /api/assignment-submissions/` - List submissions
- `POST /api/assignment-submissions/` - Submit an assignment
- `POST /api/assignment-submissions/{id}/grade/` - Grade a submission

### Quizzes

- `GET /api/quiz-attempts/` - List quiz attempts
- `POST /api/quiz-attempts/` - Submit a quiz attempt

### Leaderboard

- `GET /api/leaderboard/?course_id={id}` - Get leaderboard

### Media Upload

- `POST /api/media/upload/` - Upload a file
  ```
  Content-Type: multipart/form-data

  file: [file data]
  type: video|audio|presentation|scorm|thumbnail
  ```

## Using the API

All authenticated endpoints require an Authorization header:

```
Authorization: Token your-auth-token-here
```

Example using curl:

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"trainer","password":"trainer123"}'

# Create a course
curl -X POST http://127.0.0.1:8000/api/courses/ \
  -H "Authorization: Token your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Course",
    "description": "A comprehensive course",
    "status": "draft",
    "visibility": "private"
  }'
```

## Project Structure

```
django-backend/
├── trainer_lms/          # Django project settings
│   ├── settings.py       # Project configuration
│   ├── urls.py           # Main URL configuration
│   └── wsgi.py           # WSGI configuration
├── courses/              # Main app
│   ├── models.py         # Database models
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   ├── urls.py           # App URL configuration
│   └── admin.py          # Django admin configuration
├── media/                # Uploaded files (created automatically)
├── manage.py             # Django management script
└── requirements.txt      # Python dependencies
```

## Database Models

The system includes the following models:

- **Profile** - User accounts (trainers and learners)
- **Course** - Course information
- **Unit** - Course units (lessons)
- **VideoUnit, AudioUnit, TextUnit, etc.** - Specific unit type details
- **Quiz, Question** - Quiz and question data
- **Assignment** - Assignment details
- **Enrollment** - User course enrollments
- **UnitProgress** - Progress tracking
- **AssignmentSubmission** - Assignment submissions
- **QuizAttempt** - Quiz attempts
- **Leaderboard** - Leaderboard rankings
- **MediaMetadata** - Uploaded file metadata

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Database Backups

```bash
# Backup
python manage.py dumpdata > backup.json

# Restore
python manage.py loaddata backup.json
```

### Accessing the Admin Panel

1. Create a superuser (if not already done):
   ```bash
   python manage.py createsuperuser
   ```

2. Navigate to: `http://127.0.0.1:8000/admin/`

3. Login with your superuser credentials

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Set a strong `SECRET_KEY`
3. Configure `ALLOWED_HOSTS` with your domain
4. Use a production database (PostgreSQL, MySQL)
5. Configure static file serving
6. Use a production WSGI server (gunicorn, uwsgi)
7. Set up HTTPS

Example production settings:

```env
SECRET_KEY=very-strong-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## Troubleshooting

### Port Already in Use

If port 8000 is already in use, run on a different port:
```bash
python manage.py runserver 8080
```

### Database Locked Error

If you get a "database is locked" error with SQLite:
- Make sure only one server instance is running
- Close any database browser tools
- Consider using PostgreSQL for production

### CORS Issues

If you have CORS issues, update `CORS_ALLOWED_ORIGINS` in `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Support

For issues or questions, refer to the Django documentation:
- Django: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/

## License

This project is provided as-is for educational and commercial use.
