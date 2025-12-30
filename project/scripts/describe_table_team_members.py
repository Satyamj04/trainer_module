import psycopg2
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='team_members'")
for r in cur.fetchall():
    print(r)
cur.close(); conn.close()