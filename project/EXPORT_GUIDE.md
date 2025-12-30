# 📦 Export Guide - Running Locally

This guide explains how to export and run the project on your local machine.

## 🎯 What You're Getting

**TWO Complete Systems:**
1. ✅ React + Supabase (for Bolt/cloud)
2. ✅ Django REST API (for local machine)

Both have the **exact same features** and support all 11 content unit types!

## 📥 Step 1: Export from Bolt

1. Click the **"Download"** or **"Export"** button in Bolt
2. Save the ZIP file to your computer
3. Extract the ZIP file to a folder (e.g., `trainer-lms`)

## 💻 Step 2: Run Django Backend Locally

### Prerequisites
- Python 3.8+ installed
- pip package manager

### Setup Commands

```bash
# Open terminal/command prompt
# Navigate to the project folder
cd path/to/trainer-lms

# Go to Django backend
cd django-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies (takes 1-2 minutes)
pip install -r requirements.txt

# Create database
python manage.py migrate

# Create admin user (follow prompts)
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

**✅ Done!** Django is running at: `http://127.0.0.1:8000/`

### Test It

1. **Admin Panel:** Open `http://127.0.0.1:8000/admin/`
   - Login with your superuser credentials
   - Explore all the models

2. **API:** Open `http://127.0.0.1:8000/api/`
   - You'll see the API root

3. **Login via API:**
   ```bash
   curl -X POST http://127.0.0.1:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"your-username","password":"your-password"}'
   ```

## 🎨 Step 3: (Optional) Run React Frontend Locally

If you want the full UI:

```bash
# Go back to project root
cd ..

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Note:** The React app is already running in Bolt, so this is optional for local development.

## 📊 What's Included

### Django Backend (`django-backend/`)
- ✅ Complete REST API
- ✅ SQLite database (ready to use)
- ✅ Admin panel
- ✅ File upload handling
- ✅ Authentication system
- ✅ All 11 content unit types

### React Frontend (`src/`)
- ✅ Full UI for trainers
- ✅ Course builder with drag-drop
- ✅ Unit editors for all types
- ✅ Enrollment management
- ✅ Progress tracking
- ✅ Reports and leaderboard

### Database Migrations (`supabase/migrations/`)
- ✅ Complete schema
- ✅ RLS policies
- ✅ Storage configuration

## 🚀 Quick Start Guide

### 1. Create Your First User (Django)

```bash
# In django-backend folder with venv activated
python manage.py shell
```

```python
from courses.models import Profile

# Create a trainer
trainer = Profile.objects.create_user(
    username='trainer',
    email='trainer@example.com',
    password='trainer123',
    full_name='John Trainer',
    role='trainer'
)

# Create a learner
learner = Profile.objects.create_user(
    username='learner',
    email='learner@example.com',
    password='learner123',
    full_name='Jane Learner',
    role='learner'
)

print("Users created successfully!")
```

### 2. Get API Token

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"trainer","password":"trainer123"}'
```

You'll get:
```json
{
  "token": "abc123xyz..."
}
```

### 3. Create Your First Course

```bash
curl -X POST http://127.0.0.1:8000/api/courses/ \
  -H "Authorization: Token abc123xyz..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Python",
    "description": "Learn Python programming from scratch",
    "language": "English",
    "status": "draft",
    "visibility": "private"
  }'
```

### 4. Add a Unit to the Course

```bash
curl -X POST http://127.0.0.1:8000/api/units/ \
  -H "Authorization: Token abc123xyz..." \
  -H "Content-Type: application/json" \
  -d '{
    "course": "course-id-from-step-3",
    "type": "video",
    "title": "Introduction Video",
    "order": 0,
    "is_required": true
  }'
```

## 🎓 Using the System

### For Trainers:
1. Login to admin panel or use API
2. Create courses
3. Add units (video, quiz, assignment, etc.)
4. Enroll learners
5. Track progress
6. Grade assignments

### For Learners:
1. Login via API
2. View enrolled courses
3. Complete units
4. Take quizzes
5. Submit assignments
6. Track progress

## 📁 File Uploads

Upload files (videos, PDFs, SCORM packages):

```bash
curl -X POST http://127.0.0.1:8000/api/media/upload/ \
  -H "Authorization: Token abc123xyz..." \
  -F "file=@/path/to/your/file.mp4" \
  -F "type=video"
```

Files are stored in `django-backend/media/`

## 🔧 Troubleshooting

### "Python not found"
- Install Python from python.org
- Make sure it's in your PATH

### "pip not found"
- Reinstall Python with pip included
- Or install pip separately

### "Port 8000 in use"
- Use a different port:
  ```bash
  python manage.py runserver 8080
  ```

### "Permission denied" (Mac/Linux)
- Use `python3` instead of `python`
- Use `pip3` instead of `pip`

### "Module not found"
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

## 📚 Next Steps

1. **Read the Full Documentation:**
   - `DEPLOYMENT_README.md` - Complete guide for both systems
   - `django-backend/README.md` - Django-specific documentation

2. **Explore Django Admin:**
   - Go to `http://127.0.0.1:8000/admin/`
   - Click through all the models
   - Create test data

3. **Test API Endpoints:**
   - Use Postman, Insomnia, or curl
   - Try creating courses, units, enrollments
   - Upload files

4. **Customize:**
   - Modify models in `courses/models.py`
   - Add custom views in `courses/views.py`
   - Extend the API

## ✅ You're All Set!

You now have a complete, working LMS running on your local machine!

**Both systems (Bolt + Django) work identically** - use whichever fits your needs.

---

Need help? Check:
- `DEPLOYMENT_README.md` for detailed info
- `django-backend/README.md` for API docs
- Django docs: https://docs.djangoproject.com/

**Happy coding! 🚀**
