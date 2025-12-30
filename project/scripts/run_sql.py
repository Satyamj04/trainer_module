import sys
from pathlib import Path
import psycopg2

DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}

p = Path(sys.argv[1])
if not p.exists():
    print('file not found', p)
    sys.exit(1)

sql = p.read_text()
conn = psycopg2.connect(**DB)
conn.autocommit = True
cur = conn.cursor()
cur.execute(sql)
print('Executed', p)
cur.close(); conn.close()