import psycopg2, sys
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
if len(sys.argv) < 2:
    print('Usage: describe_table_generic.py <table_name>')
    sys.exit(1)
table = sys.argv[1]
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name=%s", [table])
rows=cur.fetchall()
if not rows:
    print('No table or no columns found for', table)
else:
    for r in rows:
        print(r)
cur.close(); conn.close()