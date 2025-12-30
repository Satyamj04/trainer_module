import psycopg2
DB={'dbname':'postgres','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
conn.autocommit=True
cur=conn.cursor()
try:
    cur.execute("CREATE DATABASE LMS;")
    print('CREATE DATABASE issued')
except Exception as e:
    print('CREATE DB error:', e)
cur.execute("SELECT datname FROM pg_database WHERE datname='LMS'")
print('exists:', cur.fetchone())
cur.close()
conn.close()