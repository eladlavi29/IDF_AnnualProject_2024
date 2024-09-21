import sys
sys.path.append('../')
from manager import request_prompt


def run_check(fid, socketio):
    request_prompt("check3-c.py","check3-c.py", str(fid),socketio)