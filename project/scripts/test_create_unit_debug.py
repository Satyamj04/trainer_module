#!/usr/bin/env python
"""
Test creating a unit to see what error the backend returns
"""
import requests
import json

BASE_URL = "http://localhost:8000"
TOKEN = "4d4106b40f4d1804df8343302fc3e21b999dec78"  # trainer456@gmail.com token

headers = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}

# First, get a course to use
print("Getting courses...")
resp = requests.get(f"{BASE_URL}/api/trainer/v1/course/", headers=headers)
if resp.ok:
    courses = resp.json()
    if isinstance(courses, list) and len(courses) > 0:
        course_id = courses[0].get('id')
        print(f"Using course: {courses[0].get('title')} ({course_id})")
    else:
        print("No courses found")
        exit(1)
else:
    print(f"Failed to get courses: {resp.status_code}")
    exit(1)

# Try to create a unit
print("\nCreating a unit...")
payload = {
    "course": course_id,
    "type": "video",
    "module_type": "video",
    "title": "Test Video Unit",
    "description": "A test video unit",
    "is_mandatory": True
}
print(f"Payload: {json.dumps(payload, indent=2)}")

resp = requests.post(f"{BASE_URL}/api/units/", headers=headers, json=payload)
print(f"\nStatus: {resp.status_code}")
print(f"Response: {resp.text}")

if resp.ok:
    unit = resp.json()
    print(f"\n✅ Unit created!")
    print(f"Unit ID: {unit.get('id')}")
    print(f"Unit title: {unit.get('title')}")
else:
    print(f"\n❌ Failed to create unit")
