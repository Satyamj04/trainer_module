import psycopg2
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
cur.execute("SELECT team_id, team_name, manager_id, created_by FROM teams")
for r in cur.fetchall():
    print('team:', r)
cur.execute("SELECT team_id, user_id, is_primary_team, assigned_by FROM team_members")
for r in cur.fetchall():
    print('member:', r)
cur.close(); conn.close()