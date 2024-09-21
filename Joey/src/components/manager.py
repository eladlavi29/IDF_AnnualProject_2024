import concurrent.futures
from datetime import datetime
import os
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import json
import importlib.util
import psycopg2 as pg
import os

# manager script that manages the whole connection between the web page and the backend

conn = pg.connect(database = "flight_sem_6", user = "postgres", password = "amir")

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app,cors_allowed_origins="*")



@socketio.on('send-tailnum-draining')
def handle_request_draining_tailNum(msg):
    print("got request")
    
    request_dict = json.loads(msg)
    fid = request_dict["fid"]

    cur = conn.cursor()
    cur.execute("SELECT tail_number, draining from flight_to_fid where fid={fid}".format(fid=fid))
    row = cur.fetchall()[0]
    cur.close()

    res_dict = {'tail_number' : row[0], 'draining': row[1].strftime("%Y-%m-%d %H:%M:%S")}

    socketio.emit('recv-tailnum-draining', json.dumps(res_dict))



@socketio.on('request-check-list')
def handle_message(msg):
    res = []
    path = os.getcwd()
    path = os.path.join(path, 'checks')
    dir = os.listdir(path)
    for file in dir:
        totalPath = os.path.join(path, file)
        _, file_extension = os.path.splitext(file)
        if file_extension == '.py':
            res.append(totalPath)

    res_dict = {'strings' : res}

    socketio.emit('send-check-list', json.dumps(res_dict))


@socketio.on('request-draining-times')
def handle_request_draining(msg):
    request_dict = json.loads(msg)
    tail_num = request_dict["tail_num"]


    cur = conn.cursor()
    cur.execute("SELECT draining from flight_to_fid where tail_number={tail_num}".format(tail_num=tail_num))

    rows = cur.fetchall()
    cur.close()

    result = []
    for row in rows:
        result.append(row[0].strftime("%Y-%m-%d %H:%M:%S"))

    result.sort()

    res_dict = {'strings' : result}

    socketio.emit('send-draining-times', json.dumps(res_dict))
    

def run_function_from_file(file_path, fid):
    try:
        fileName = file_path[file_path.rfind(os.path.sep)+1:]
        spec = importlib.util.spec_from_file_location("module", file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        if hasattr(module, 'run_check') and callable(module.run_check):
            module.run_check(fid, socketio) 
        else:
            request_prompt(fileName,fileName,"Function 'run_check' not found or not callable in the specified file.",socketio)

    except FileNotFoundError:
        request_prompt(fileName,fileName,"File not found.",socketio)
    except Exception as e:
        request_prompt(fileName,fileName,"Error occured while running the script: {e}".format(e=e),socketio)


def valuesToTimeStamp(year,month,day,hour,min,sec):
    return str(year) + '-' +str(month) + '-' +str(day) + ' ' +str(hour) + ':' +str(min) + ':' +str(sec)

@socketio.on('request-run-checks')
def handleRunChecks(msg):
    request_dict = json.loads(msg)
    checks_list = request_dict["strings"]

    tailNum = request_dict["tailNum"]
    timestamp = request_dict["draining"]

    pool = concurrent.futures.ThreadPoolExecutor(max_workers=4)    
    
    cur = conn.cursor()
    cur.execute("select fid from flight_to_fid where tail_number={tail_num} and draining='{draining}'".format(tail_num=tailNum,
                                                                                                            draining = timestamp))
    
    rows = cur.fetchall()
    cur.close()

    fid = rows[0][0]

    for i in range(0,len(checks_list)):
        pool.submit(run_function_from_file, checks_list[i], fid)
    
        
    pool.shutdown(wait=True)


@socketio.on('request-reload-check')
def handleRunChecks(msg):
    request_dict = json.loads(msg)
    check = request_dict["check"]

    tailNum = request_dict["tailNum"]
    timestamp = request_dict["draining"]


    cur = conn.cursor()
    cur.execute("select fid from flight_to_fid where tail_number={tail_num} and draining='{draining}'".format(tail_num=tailNum,
                                                                                                            draining = timestamp))
    
    rows = cur.fetchall()
    cur.close()

    run_function_from_file(check, rows[0][0])
    

@socketio.on('send-script')
def handleSendScript(msg):
    request_dict = json.loads(msg)
    content = request_dict["script"]
    name = request_dict["name"]

    try:
        f = open(os.path.join(os.getcwd(), 'checks', name), "x")
        f.write(content)
        f.close()
    except FileExistsError:
        socketio.emit('send-upload-result', json.dumps({'result' : 0}))
    else:
        socketio.emit('send-upload-result', json.dumps({'result' : 1}))



def request_prompt(file_name,request_name,prompt,socketio1):
    request_dict = {"file": file_name,"name": request_name, "request_prompt": prompt}
    socketio1.emit('check-request-prompt-', json.dumps(request_dict))

def request_input(file_name, request_name, content,socketio1):
    request_dict = {"file": file_name,"name": request_name, "request": content}
    socketio1.emit('check-request-input-', json.dumps(request_dict))

"""
START OF: ZONE FOR INPUT REQUEST EVENT HANDLERS
"""

@socketio.on('check-request-input-check1.py')
def handleAnswerCheck1(msg):
    answer_dict = json.loads(msg)
    answer = answer_dict["answer"]

    request_input("check1.py", "check1.py-1", answer,socketio)


@socketio.on('check-request-input-check1-CPY-1.py')
def handleAnswerCheck1(msg):
    answer_dict = json.loads(msg)
    answer = answer_dict["answer"]

    request_prompt("check1-CPY.py", "check1-CPY.py", answer,socketio)


@socketio.on('check-request-input-check1.py-1')
def handleAnswerCheck1(msg):
    answer_dict = json.loads(msg)
    answer = answer_dict["answer"]

    request_prompt("check1.py", "check1.py-2", answer,socketio)

"""
END OF: ZONE FOR INPUT REQUEST EVENT HANDLERS
"""



if __name__ == '__main__':
    socketio.run(app, port=5001,host='0.0.0.0')



