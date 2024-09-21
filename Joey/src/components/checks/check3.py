import sys
sys.path.append('../')
from manager import request_prompt


def run_check(fid, socketio):
    request_prompt("check3.py","check3.py", str(fid),socketio)