import psycopg2
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='enrollments'")
rows = cur.fetchall()
if not rows:
    print('No enrollments table found')
else:
    for r in rows:
        print(r)
cur.close(); conn.close()