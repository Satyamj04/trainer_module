import psycopg2
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
cur.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'")
tables=[r[0] for r in cur.fetchall()]
print('tables count:', len(tables))
print('\n'.join(sorted(tables)))
cur.close(); conn.close()