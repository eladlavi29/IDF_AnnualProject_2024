import { Box, Button, TextField, styled } from "@mui/material";
import {  useEffect, useState } from "react";
import io from "socket.io-client";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// file for page of uploading a new script of check

const socket = io("http://127.0.0.1:5001");

const Div = styled('div')(({ theme }) => ({
    ...theme.typography.h6,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
}));

function ImportScript(_:any) {
    const [serverMessage, setServerMessage] = useState<string>('{"result": -1}');
    const [showMsg, setShowMsg] = useState(-1);
    const [inputValue, setInputValue] = useState("")
    const [correctPass, setCorrectPass] = useState(false)
    const [pass, setPass] = useState("") 
    const [wrongPass, setWrongPass] = useState(false)
    const [passTimeout, setPassTimeout] = useState<number|null>(null)
    const [showPassReset, setShowPassReset] = useState(false);


    useEffect(() => {
        socket.on('send-upload-result', (msg:string) => {
            setServerMessage(msg);
        });
    }, []);
    
    useEffect(() => {
        console.log(passTimeout)
        if(passTimeout==null)
            return 

        if(passTimeout===0){
           setPass("")
           setCorrectPass(false)
           setPassTimeout(null)
           setShowPassReset(true)
           return
        }
        
        const intervalId = setInterval(() => {
            setPassTimeout(passTimeout - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [passTimeout]);

    useEffect(() => {
        let curr = JSON.parse(serverMessage).result
        setShowMsg(curr)
    }, [serverMessage]);
    
    function handleInput(evt:any){
        setInputValue("")
        let file = evt.target.files[0]
        if (file!==null){
            let reader = new FileReader()

            reader.readAsText(file);

            
            reader.onload = function (_) {
                const content = reader?.result;

                if (content != undefined){
                    let dict = {"script" : content, "name": file.name}
                    socket.emit("send-script", JSON.stringify(dict)); 
                }
            }

            
        }
        setPass("")
    }

    function handleClick(){
        setShowMsg(-1)
        setServerMessage('{"result": -1}')
    }


    function onPasswordInput(evt: any) {
        setShowPassReset(false)
        setWrongPass(false)
        setPass(evt.target.value);
    }

    function HandlesubmitPassword(){
        setCorrectPass(pass=="makpitz")
        setWrongPass(pass!="makpitz")

        if(pass=="makpitz"){
            setPassTimeout(10)
        }
    }

    return (
        <>
            <Div>UPLOAD YOUR SCRIPT</Div>
            <br /><br /><br /><br />
            <div>
            <TextField error={wrongPass} value={pass} id="password-outlined-basic" label="password" variant="outlined" size="small" onChange={evt => onPasswordInput(evt)}/>
            <br /><br />
            <Button variant="outlined" color='inherit' onClick={()=> HandlesubmitPassword()}>
                submit password...
            </Button>
            { showPassReset &&
            (
            <Box sx={{ color: 'error.main' }}>
                {'password was reset due to timeout, please enter the password again...'}
            </Box>
            )
            }
            <br /><br /><br /><br />
            <Button disabled={!(correctPass)} component="label" variant="contained" startIcon={<CloudUploadIcon />} onClick={handleClick}>
                Upload file
                <input value={inputValue} style={{ display: "none" }} type="file" accept='.py' onChange={(evt)=>handleInput(evt)}/>
            </Button>

            
            </div>
            <br /><br />
            <Box sx={{ color: 'error.main' }}>
                {showMsg==0 && 'A script with this name already exists, please consider changing it...'}
            </Box>
            <Box sx={{ color: 'success.main' }}>
                {showMsg==1 && 'File Uploaded Successfully!'}
            </Box>

               
        </>
    );

}
 
export default ImportScript;