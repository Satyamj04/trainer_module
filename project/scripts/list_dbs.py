import psycopg2
DB={'dbname':'postgres','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
cur.execute("SELECT datname FROM pg_database")
print([r[0] for r in cur.fetchall()])
cur.close(); conn.close()