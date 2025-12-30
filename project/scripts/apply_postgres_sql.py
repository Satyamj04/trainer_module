"""Apply an SQL file to Postgres using psycopg2. Intended for local dev only.
Usage: python apply_postgres_sql.py /path/to/file.sql
"""
import sys
import psycopg2
from pathlib import Path

SQL_FILE = sys.argv[1] if len(sys.argv) > 1 else 'postgres_table 1.sql'

DB = {
    'dbname': 'postgres',  # initial connection to create DB if needed
    'user': 'postgres',
    'password': 'admin@123',
    'host': 'localhost',
    'port': 5432,
}

TARGET_DBNAME = 'lms'

p = Path(SQL_FILE)
if not p.exists():
    print(f"SQL file not found: {p.resolve()}")
    sys.exit(2)

sql_text = p.read_text(encoding='utf-8')

# Naive split on ';' to execute statements individually
stmts = [s.strip() for s in sql_text.split(';') if s.strip()]

# Execute CREATE DATABASE statements first on 'postgres' DB
create_db_stmts = [s for s in stmts if s.strip().lower().startswith('create database')]
other_stmts = [s for s in stmts if not s.strip().lower().startswith('create database')]

failed = False

if create_db_stmts:
    conn = psycopg2.connect(**DB)
    conn.autocommit = True
    cur = conn.cursor()
    for i, stmt in enumerate(create_db_stmts, start=1):
        try:
            cur.execute(stmt)
            print(f"Executed CREATE DATABASE statement #{i}")
        except Exception as e:
            print(f"Warning: CREATE DATABASE statement #{i} failed (may already exist): {e}")
    cur.close()
    conn.close()

# Now connect to target DB to execute remaining statements
DB['dbname'] = TARGET_DBNAME
conn = psycopg2.connect(**DB)
conn.autocommit = True
cur = conn.cursor()

for i, stmt in enumerate(other_stmts, start=1):
    try:
        cur.execute(stmt)
        print(f"Executed statement #{i}")
    except Exception as e:
        failed = True
        print(f"Failed statement #{i}: {e}\n--- statement start ---\n{stmt[:1000]}\n--- statement end ---")

cur.close()
conn.close()

if failed:
    print("There were errors executing some statements. Check output.")
    sys.exit(1)

print("All statements executed successfully.")