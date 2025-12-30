import uuid
import psycopg2
from datetime import datetime

DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
uid=str(uuid.uuid4())
email='smoke_user@example.com'
cur.execute("INSERT INTO users (user_id, first_name, last_name, email, password_hash, primary_role, status, created_at, updated_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (email) DO NOTHING",
            (uid,'Smoke','Tester', email, 'pbkdf2_sha256$260000$dummyhash', 'trainer','active', datetime.utcnow(), datetime.utcnow()))
conn.commit()
cur.close(); conn.close()
print('seeded user', email)