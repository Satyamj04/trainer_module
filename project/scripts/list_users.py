import psycopg2
conn = psycopg2.connect(dbname='lms', user='postgres', password='admin@123', host='127.0.0.1', port=5432)
cur = conn.cursor()
cur.execute("SELECT user_id, email, primary_role FROM users ORDER BY created_at DESC LIMIT 10")
for r in cur.fetchall():
    print(r)
cur.close()
conn.close()