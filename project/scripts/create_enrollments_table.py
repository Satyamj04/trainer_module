import psycopg2
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
cur.execute('''
CREATE TABLE IF NOT EXISTS enrollments (
    id uuid PRIMARY KEY,
    course_id uuid NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES users(user_id),
    status varchar(20) NOT NULL DEFAULT 'assigned',
    progress_percentage integer NOT NULL DEFAULT 0,
    assigned_at timestamp without time zone NOT NULL DEFAULT now(),
    started_at timestamp without time zone,
    completed_at timestamp without time zone
);
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_course_user_idx ON enrollments(course_id, "user_id");
''')
conn.commit()
cur.close(); conn.close()
print('Ensured enrollments table present')