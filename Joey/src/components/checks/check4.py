import sys
sys.path.append('../')
from manager import request_prompt
import psycopg2 as pg

conn = pg.connect(database = "postgres", user = "postgres", password = "amir")

def run_check(fid, socketio):
    cur = conn.cursor()
    cur.execute("SELECT draining,tail_num from flight_to_fid where fid={fid}".format(fid=fid))

    rows = cur.fetchall()
    cur.close()

    tailNum = rows[0][1]
    timestamp = rows[0][0].strftime("%Y-%m-%d %H:%M:%S")

    request_prompt("check4.py","check4.py", str(tailNum) + " : "+timestamp,socketio)




