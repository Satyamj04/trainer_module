"""Create or fetch a token for a user via direct SQL, avoiding Django runtime import issues.
Usage: python scripts/create_token_sql.py trainer_user@example.com
"""
import sys
import secrets
import psycopg2
from datetime import datetime

if len(sys.argv) < 2:
    print("Usage: python scripts/create_token_sql.py <email>")
    sys.exit(1)

email = sys.argv[1]
conn = psycopg2.connect(dbname='lms', user='postgres', password='admin@123', host='127.0.0.1', port=5432)
cur = conn.cursor()
# Find user
cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
row = cur.fetchone()
if not row:
    print(f"User with email {email} not found in users table")
    cur.close()
    conn.close()
    sys.exit(1)
user_id = row[0]
# Ensure authtoken table exists
cur.execute("""
CREATE TABLE IF NOT EXISTS authtoken_token (
    key varchar(40) PRIMARY KEY,
    created timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id uuid NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE
);
""")
conn.commit()
# Check existing token
cur.execute("SELECT key FROM authtoken_token WHERE user_id = %s", (user_id,))
row = cur.fetchone()
if row:
    print(f"Existing token for {email}: {row[0]}")
else:
    token = secrets.token_hex(20)
    cur.execute("INSERT INTO authtoken_token (key, created, user_id) VALUES (%s, %s, %s)", (token, datetime.utcnow(), user_id))
    conn.commit()
    print(f"Created token for {email}: {token}")
cur.close()
conn.close()
