import sys
sys.path.append('../')
from manager import request_input


def run_check(_, socketio):
    request_input("check1-CPY.py", "check1-CPY-1.py", "Enter a number:", socketio)
