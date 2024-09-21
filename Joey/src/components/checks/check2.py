import sys
sys.path.append('../')
from manager import request_prompt


def run_check(fid, socketio):
    request_prompt("check2.py","check2.py", str(fid),socketio)