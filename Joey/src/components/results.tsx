import {  Box, Button, styled } from "@mui/material";
import TextField from '@mui/material/TextField';
import { useEffect, useState } from "react";
import io from "socket.io-client";
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
  } from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import React from "react";
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import IconButton from '@mui/material/IconButton';
import CachedIcon from '@mui/icons-material/Cached';
import ReactDOMServer from 'react-dom/server';

// file for page of the results of the checks

const socket = io("http://127.0.0.1:5001");

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
      expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
}));

const Div = styled('div')(({ theme }) => ({
    ...theme.typography.h6,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
}));
  
interface Dictionary<T> {
    [Key: string]: T;
}

function Results(props:any){
    const [tryData, setTryData] = useState<Dictionary<any>>({});
    const [myInput, setMyInput] = useState<Dictionary<any>>({});
    const [buttonP, setButtonP] = useState(false);
    const [evtName, setEvtName] = useState('');
    const [chosenCheck, setChosenCheck] = useState<string | null>(null);

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);

    function sendDataToScript(evtName:string, file:any, request:any, name:any){
        if (myInput[evtName]===undefined || myInput[evtName]===''){
            console.log('detected')

            let curr = tryData
            curr[file] = 
            <div>
                <div>
                    {request}
                </div>
                <br/>
                <TextField error required label='Required' key={name} id={"outlined-basic"+name} variant="outlined" size="small" onChange={evt=>
                    handleRequestSendData(evt,'check-request-input-'+name)}/>
                <br/><br></br>
                <Button variant="outlined" color='inherit' onClick={()=> sendDataToScript('check-request-input-'+name, 
                file, request, name)}>
                    Finished Entering Data...
                </Button>
            </div>
            
            setTryData(curr)
            forceUpdate()
        }
        else{
            setEvtName(evtName)
            setButtonP(true)

            let curr = tryData
            curr[file] = 
            <div>
                <div>
                    {request}
                </div>
                <br/>
                <TextField required label='Required' key={name} id={"outlined-basic"+name} variant="outlined" size="small" onChange={evt=>
                    handleRequestSendData(evt,'check-request-input-'+name)}/>
                <br/><br></br>
                <Button variant="outlined" color='inherit' onClick={()=> sendDataToScript('check-request-input-'+name, 
                file, request, name)}>
                    Finished Entering Data...
                </Button>
            </div>
            
            setTryData(curr)
            forceUpdate()
        }

    }

    useEffect(() => {
        console.log(myInput[evtName])
        if (buttonP &&  myInput[evtName]!==undefined && myInput[evtName]!==''){
            let dict = {"answer" : myInput[evtName]}
            socket.emit(evtName, JSON.stringify(dict));
            let curr = myInput
            curr[evtName] = undefined
            setMyInput(curr)
        }
        setButtonP(false)
    }, [buttonP,myInput]);

    function handleRequestSendData(evt:any, eevtName:string){ 
        let curr = myInput
        curr[eevtName] = evt.target.value
        setMyInput(curr)
    }
    
    socket.on('check-request-input-', (msg:string) => {
        let request = JSON.parse(msg).request
        let name = JSON.parse(msg).name
        let file = JSON.parse(msg).file
        let curr = tryData
        if (name!=''){
            curr[file] = 
            <div>
                <div>
                    {request}
                </div>
                <br/>
                <TextField required label='Required' key={name} id={"outlined-basic"+name} variant="outlined" size="small" onChange={evt=>
                    handleRequestSendData(evt,'check-request-input-'+name)}/>
                <br/><br></br>
                <Button variant="outlined" color='inherit' onClick={()=> sendDataToScript('check-request-input-'+name, 
                file, request, name)}>
                    Finished Entering Data...
                </Button>
            </div>
            
            setTryData(curr)
            forceUpdate()
        }

    });

    socket.on('check-request-prompt-', (msg:string) => {
        let request_prompt = JSON.parse(msg).request_prompt
        let name = JSON.parse(msg).name
        let file = JSON.parse(msg).file
        let curr = tryData
        if (name!=''){
            curr[file] = request_prompt
            
            setTryData(curr)
            forceUpdate()
        }
    });


    function fixChecksList(l:Array<string>){
        return (
            l.map((item:string) => (
            props.path + item
            ))
        )
    }

    useEffect(() => {
        if (Object.keys(tryData).length===0){
            let dict = {"strings" : fixChecksList(props.requestedChecks),
            "tailNum": props.tailNum, "draining": props.milkingTime}
            
            socket.emit("request-run-checks", JSON.stringify(dict));
        }
    }, [tryData]);

    useEffect(() => {
        setTryData({})
    }, [props.requestedChecks]);
    
    function onChosenCheckInput(evt:any){
        setChosenCheck(evt.target.value)
    }

    function reloadCheck(k:string){
        let dict = {"check" : props.path + k,
        "tailNum": props.tailNum, "draining": props.milkingTime}
            
        socket.emit("request-reload-check", JSON.stringify(dict));
    }

    function HandleDownLoadResults(){
        const element = document.createElement("a");
        let res = <div/>;
        for (const [key, value] of Object.entries(tryData)) {
            res = 
            <div>
                {res}
                <br/>
                <header>
                    <h2> {key.slice(0,key.length-3)} </h2>
                    {value}
                </header>
            </div>
        }
        const htmlString = ReactDOMServer.renderToString(res);
        const file = new Blob([htmlString], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "results.html";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    return (
        <>
        <div> 
        {(tryData)  && 
        (<>
        <div className="List">
          <Div> CHECKS RESULTS </Div>
          <br />


          <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            m: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
          >
            <TextField label="Search Check..." sx={{ width: 200 }} onChange={evt => onChosenCheckInput(evt)}/>
            
          </Box>




          <div className="list-container">
            {Object.entries(tryData).map(([k,v], index) => (
            <div key={index}>
            { ((chosenCheck===null) || (chosenCheck!==null && (k.slice(0,k.length-3).includes(chosenCheck)))) &&
                (
                <MuiAccordion>
                    <AccordionSummary 
                    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography> {k.slice(0,k.length-3)} </Typography>
                    </AccordionSummary>
                    
                    <AccordionDetails>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                p: 0,
                                m: 0,
                                bgcolor: 'background.paper',
                                borderRadius: 0,
                            }}>
                            <IconButton aria-label="delete" size="small" onClick={()=>reloadCheck(k)}>
                                <CachedIcon />
                            </IconButton>
                        </Box>
                            {v}
                        
                    </AccordionDetails>
                </MuiAccordion>
                )
            }
            
            </div> 
            ))}
          </div>
          <br></br>
          <br></br>
          <Button variant="outlined" color='inherit' onClick={()=> HandleDownLoadResults()}>
            DOWNLOAD RESULTS
          </Button>

        </div>  

        </>)}

        </div>
        </>
    )
}


export default Results;