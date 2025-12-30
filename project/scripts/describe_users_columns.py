import psycopg2

conn = psycopg2.connect(dbname='lms', user='postgres', password='admin@123', host='127.0.0.1', port=5432)
cur = conn.cursor()
cur.execute("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position")
rows = cur.fetchall()
for r in rows:
    print(r)
cur.close()
conn.close()
