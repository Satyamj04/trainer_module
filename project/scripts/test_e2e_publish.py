#!/usr/bin/env python
"""
Test end-to-end: Register trainer -> Login -> Create course -> Get course with units
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

# Use unique email for each run
email = f"trainer_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
password = "TestPass123!"

print(f"\n=== E2E Publish Course Test ===")
print(f"Email: {email}")
print(f"Password: {password}\n")

# 1. Register
print("1. Registering trainer...")
resp = requests.post(f"{BASE_URL}/api/auth/register/", json={
    "email": email,
    "password": password,
    "full_name": "Test Trainer",
    "role": "trainer"
})
print(f"   Status: {resp.status_code}")
if resp.status_code in [200, 201]:  # Accept both 200 and 201 for register
    data = resp.json()
    token = data.get('token')
    print(f"   Token: {token[:20]}...")
else:
    print(f"   Error: {resp.text}")
    exit(1)

# 2. Login
print("\n2. Logging in...")
resp = requests.post(f"{BASE_URL}/api/auth/login/", data={
    "username": email,
    "password": password
})
print(f"   Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    token = data.get('token')
    print(f"   Token: {token[:20]}...")
else:
    print(f"   Error: {resp.text}")
    exit(1)

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

# 3. Create course
print("\n3. Creating course...")
resp = requests.post(f"{BASE_URL}/api/trainer/v1/course/", 
    headers=headers,
    json={
        "title": f"Test Course {datetime.now().strftime('%H%M%S')}",
        "description": "A test course",
        "status": "draft",
        "thumbnail_url": ""
    }
)
print(f"   Status: {resp.status_code}")
if resp.status_code == 201:
    course = resp.json()
    course_id = course.get('id')
    print(f"   Course ID: {course_id}")
    print(f"   Course Title: {course.get('title')}")
else:
    print(f"   Error: {resp.text}")
    exit(1)

# 4. Get course details
print("\n4. Getting course details...")
resp = requests.get(f"{BASE_URL}/api/trainer/v1/course/{course_id}/", headers=headers)
print(f"   Status: {resp.status_code}")
if resp.status_code == 200:
    course = resp.json()
    print(f"   Course: {course.get('title')}")
    print(f"   Units: {course.get('units', [])}")
else:
    print(f"   Error: {resp.text}")

# 5. Get units
print("\n5. Getting units for course...")
resp = requests.get(f"{BASE_URL}/api/units/?course_id={course_id}", headers=headers)
print(f"   Status: {resp.status_code}")
print(f"   Response type: {type(resp.json())}")
print(f"   Raw response: {resp.text[:200]}")
if resp.status_code == 200:
    units_data = resp.json()
    units = units_data if isinstance(units_data, list) else units_data.get('results', [])
    print(f"   Total units: {len(units)}")
    for unit in units:
        if isinstance(unit, dict):
            print(f"     - {unit.get('title')} ({unit.get('type')})")
else:
    print(f"   Error: {resp.text}")

print("\n✅ Test complete!")
