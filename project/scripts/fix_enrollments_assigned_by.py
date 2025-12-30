import psycopg2
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
# Add assigned_by_id if missing
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='enrollments' AND column_name='assigned_by_id'")
if not cur.fetchone():
    cur.execute("ALTER TABLE enrollments ADD COLUMN assigned_by_id uuid")
    print('Added assigned_by_id column')
    cur.execute("UPDATE enrollments SET assigned_by_id = assigned_by")
    print('Copied assigned_by -> assigned_by_id')
    # add foreign key
    try:
        cur.execute("ALTER TABLE enrollments ADD CONSTRAINT enrollments_assigned_by_fk FOREIGN KEY (assigned_by_id) REFERENCES users(user_id)")
        print('Added FK constraint on assigned_by_id')
    except Exception as e:
        print('Failed to add FK constraint:', e)
else:
    print('assigned_by_id already exists')
conn.commit(); cur.close(); conn.close()