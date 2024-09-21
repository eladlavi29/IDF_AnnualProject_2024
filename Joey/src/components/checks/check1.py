import json
import time
import sys
sys.path.append('../')
from manager import request_input


def run_check(_, socketio):
    request_input("check1.py", "check1.py", "Enter a number:", socketio)
