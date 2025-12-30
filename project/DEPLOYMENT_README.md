# Trainer LMS - Complete Implementation Guide

This project contains **TWO complete implementations** of the same Learning Management System:

1. **React + Supabase** (Bolt/Cloud) - Currently running
2. **Django Backend** (Local Export) - For your local machine

## 🎯 Purpose

You can use **both systems** depending on your needs:
- **Use Bolt (React + Supabase)**: For cloud-based deployment, testing, and development
- **Use Django**: For local development, offline work, and full control

## 📁 Project Structure

```
.
├── src/                      # React frontend (works with Bolt)
├── django-backend/           # Django REST API (for local use)
│   ├── courses/              # Main Django app
│   ├── trainer_lms/          # Django project settings
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py             # Django management script
│   └── README.md             # Django setup instructions
├── supabase/                 # Supabase database migrations
└── README.md                 # This file
```

## 🚀 Quick Start

### Option 1: Use React + Supabase (Bolt)

**Already running!** This is the current Bolt implementation.

**Features:**
- ✅ Cloud-based database (Supabase)
- ✅ Automatic file storage
- ✅ Real-time updates
- ✅ No local installation needed

**Current URLs:**
- Frontend: Provided by Bolt
- Database: Supabase (configured in .env)

### Option 2: Export and Run Locally with Django

**Perfect for:** Local development, offline work, full control

#### Step 1: Export Files

Download all files from this project to your local machine.

#### Step 2: Set Up Django Backend

```bash
# Navigate to django-backend folder
cd django-backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

**Django will run at:** `http://127.0.0.1:8000/`

**Admin panel:** `http://127.0.0.1:8000/admin/`

#### Step 3: (Optional) Run React Frontend Locally

If you want to run the React frontend locally to connect to your Django backend:

```bash
# Install dependencies
npm install

# Update .env to point to Django
# Change API endpoints in src/lib/supabase.ts if needed

# Start dev server
npm run dev
```

## 🎓 Features

Both implementations support all 11 content unit types:

1. **Text** - Plain text content
2. **Video** - Video lessons with progress tracking
3. **Audio** - Audio lessons
4. **Presentation** - PDF/PowerPoint slides
5. **Page** - Rich content with multiple blocks
6. **Quiz** - Interactive quizzes with 7 question types
7. **Test** - Graded assessments
8. **Assignment** - File/text submissions with grading
9. **SCORM** - SCORM 1.2, 2004 packages
10. **xAPI** - Tin Can API packages
11. **Survey** - Feedback collection

### Additional Features

- ✅ Course creation and management
- ✅ User roles (Trainer/Learner)
- ✅ Progress tracking
- ✅ File uploads (videos, PDFs, PPTs, SCORM)
- ✅ Enrollment management
- ✅ Leaderboard system
- ✅ Reporting dashboard
- ✅ Admin panel (Django)

## 🔄 Switching Between Systems

### Currently Using: React + Supabase (Bolt)

**To switch to Django:**
1. Export all files
2. Follow "Option 2" setup instructions above
3. Run Django backend locally
4. Optionally update React frontend to use Django API

### Data Migration

**Supabase → Django:**
1. Export data from Supabase Dashboard
2. Format as JSON
3. Load into Django using management commands

**Django → Supabase:**
1. Export data: `python manage.py dumpdata`
2. Transform to SQL
3. Import into Supabase

## 📊 Database Schema

Both implementations use the same database schema:

**Core Tables:**
- profiles (users with roles)
- courses
- units (with 11 types)
- enrollments
- unit_progress

**Content Tables:**
- video_units, audio_units, text_units
- page_units, presentation_units
- quizzes, questions
- assignments, scorm_packages, surveys

**Tracking Tables:**
- quiz_attempts
- assignment_submissions
- leaderboard
- media_metadata

## 🔐 Authentication

### Bolt (Supabase)
- Email/password authentication
- Automatic session management
- Row Level Security (RLS)

### Django
- Token authentication
- Session authentication
- Role-based permissions

## 📤 File Storage

### Bolt (Supabase)
- Files stored in Supabase Storage
- Bucket: `course-media`
- Public URLs for content
- Automatic CDN

### Django
- Files stored in `media/` folder
- Organized by user and type
- Local file serving
- Can integrate with S3/Azure for production

## 🛠 Development

### React Frontend Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Django Backend Development

```bash
# Activate virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Run server
python manage.py runserver

# Run tests
python manage.py test

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Access shell
python manage.py shell
```

## 📖 API Documentation

### Django API

See `django-backend/README.md` for complete API documentation.

**Base URL:** `http://127.0.0.1:8000/api/`

**Authentication:** Token-based
```
Authorization: Token your-token-here
```

**Key Endpoints:**
- `/api/auth/login/` - Get auth token
- `/api/courses/` - Course management
- `/api/units/` - Unit management
- `/api/enrollments/` - Enrollment management
- `/api/media/upload/` - File uploads

### Supabase API

Automatically generated by Supabase based on your schema.

**Access through:**
- Supabase JavaScript client
- Direct REST API calls
- GraphQL (if enabled)

## 🚀 Deployment

### Deploying React + Supabase

**Already deployed on Bolt!**

For other platforms:
- **Vercel:** `npx vercel`
- **Netlify:** `npm run build` then drag `dist/` folder
- **Custom:** Build and serve `dist/` folder

### Deploying Django

**Local/Development:**
```bash
python manage.py runserver
```

**Production:**
1. Set `DEBUG=False`
2. Configure proper `SECRET_KEY`
3. Set up production database (PostgreSQL)
4. Use gunicorn: `gunicorn trainer_lms.wsgi`
5. Set up nginx for static files
6. Use systemd or supervisor for process management

**Platforms:**
- **Heroku:** `git push heroku main`
- **DigitalOcean:** App Platform or Droplet
- **AWS:** Elastic Beanstalk or EC2
- **Railway:** Connect GitHub repo

## 🎯 Use Cases

### Use Bolt (React + Supabase) When:
- Building quickly
- Need cloud hosting
- Want automatic scaling
- Prefer managed services
- Working in a team

### Use Django Locally When:
- Need full control
- Working offline
- Custom business logic
- Existing Django ecosystem
- Corporate requirements

## 📝 Common Tasks

### Add a New User (Django)

```bash
python manage.py shell
```

```python
from courses.models import Profile

# Create trainer
Profile.objects.create_user(
    username='trainer1',
    email='trainer1@example.com',
    password='secure123',
    full_name='John Doe',
    role='trainer'
)

# Create learner
Profile.objects.create_user(
    username='learner1',
    email='learner1@example.com',
    password='secure123',
    full_name='Jane Smith',
    role='learner'
)
```

### Create a Course

**Via Django Admin:**
1. Go to `http://127.0.0.1:8000/admin/`
2. Login with superuser
3. Click "Courses" → "Add Course"
4. Fill in details and save

**Via API:**
```bash
curl -X POST http://127.0.0.1:8000/api/courses/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Programming",
    "description": "Learn Python from scratch",
    "status": "draft"
  }'
```

## 🔧 Troubleshooting

### Django Issues

**"No module named 'courses'"**
- Make sure you're in the django-backend directory
- Activate virtual environment
- Install requirements: `pip install -r requirements.txt`

**"Port 8000 already in use"**
```bash
python manage.py runserver 8080
```

**Database locked**
- Close other connections to db.sqlite3
- Restart Django server

### React Issues

**"Module not found"**
```bash
npm install
```

**Build errors**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Learning Resources

- **Django:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **React:** https://react.dev/
- **Supabase:** https://supabase.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

## ✨ What's Next?

1. **Explore the Django Admin:** Manage all data visually
2. **Test the API:** Use Postman or curl to try endpoints
3. **Create Courses:** Build your first course with different unit types
4. **Customize:** Modify models, add features, extend functionality

## 🤝 Support

- Django Backend: See `django-backend/README.md`
- React Frontend: See main `README.md`
- Issues: Check Django/React documentation

## 📄 License

This project is provided as-is for educational and commercial use.

---

**Happy Learning! 🎓**
