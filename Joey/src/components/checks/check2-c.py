import sys
sys.path.append('../')
from manager import request_prompt


def run_check(fid, socketio):
    request_prompt("check2-c.py","check2-c.py", str(fid),socketio)