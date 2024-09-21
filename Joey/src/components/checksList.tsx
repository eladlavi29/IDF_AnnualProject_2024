import { useEffect, useState } from "react";
import io from "socket.io-client";
import FormGroup from '@mui/material/FormGroup';
import { styled } from '@mui/material/styles';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";


// file for page of the list of available checks

const socket = io("http://127.0.0.1:5001/");

const Div = styled('div')(({ theme }) => ({
  ...theme.typography.h6,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
}));

function ChecksList(props:any){
    const [path, setPath] = useState<string>('');
    const [shortChecksList, setShortChecksList] = useState<Array<string>>([]);
    const [serverMessage, setServerMessage] = useState<string>('{"strings": []}');
    const [checked, setChecked] = useState<Array<string>>([]);
    const [displayErr, setDisplayErr] = useState(false);
    const [chosenCheck, setChosenCheck] = useState<string | null>(null);

    const handleCheck = (event: any) => {
        var updatedList = [...checked];
        if (event.target.checked) {
          updatedList = [...checked, event.target.value];
        } else {
          updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
    };
    
    const handleSelectAll = (event: any) => {

      let allSeenList:Array<string> = []
      if (chosenCheck!=null)
        allSeenList = shortChecksList.filter((item)=> item.slice(0,item.length-3).includes(chosenCheck))
      else
        allSeenList = shortChecksList

      var updatedList = [...checked];
      if (event.target.checked) {
        updatedList = [...new Set([...updatedList, ...allSeenList])];
      } else {
        updatedList = updatedList.filter((item)=> !(allSeenList.includes(item)))
      }
      setChecked(updatedList);
    };

    
    function createShortList(my_list : Array<string>){
        let temp : Array<string> = []
        for (let i = 0; i < my_list.length; i++) {
            let keep = -1
            for (let j = my_list[i].length-1; j > -1; j--) {
                if (my_list[i][j]==='/' || my_list[i][j]==='\\'){
                    keep = j;
                    break;
                }
            };
            if(keep===-1){
                console.log("PROBLEM- NO SEPERATOR FOUND: " + my_list[i]);
                process.exit(1);
            }
            temp.push(my_list[i].slice(keep-my_list[i].length+1))
            setPath(my_list[i].slice(0,keep+1))
        };
        setShortChecksList(temp)
    }

    function getChecksList() {    
        socket.emit("request-check-list", " ");
        
        useEffect(() => {
        socket.on("send-check-list", (msg:string) => {
            setServerMessage(msg);
        });
        }, []);
    
        useEffect(() => {
            let curr = JSON.parse(serverMessage).strings
            createShortList(curr);
        }, [serverMessage]);
    }

    getChecksList();


    function handlePresentResults(){
      if (checked.length === 0 ){
        setDisplayErr(true);
      }
      else{
        setDisplayErr(false);
        props.presentResults(true, checked, path);
      }
    }

    function onChosenCheckInput(evt:any){
      setChosenCheck(evt.target.value)
    }

    return (
        <>

        <FormGroup>

          <Div> CHOOSE CHECKS TO RUN </Div>
          

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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
                p: 1,
                m: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
              }}
            >
            

            {shortChecksList.map((item, index) => (
              <div key={index}>

                { (chosenCheck===null || item.slice(0,item.length-3).includes(chosenCheck)) &&
                  (
                  <>
                  <Checkbox 
                    id = {'checkBox-'+index.toString()}
                    value={item}
                    onChange={handleCheck} 
                    checked={checked.includes(item) } />
                  <span>{item.slice(0,item.length-3)}</span>
                  </>
                  )
                }



              </div>
            ))}
            
  
            
            <>
            <div>
            <Checkbox
                  id = {'checkBox-selectAll'}
                  value={'select all'}
                  onChange={handleSelectAll} 
                  
                  checked={(chosenCheck===null && checked.length===shortChecksList.length) ||
                   ((chosenCheck!==null) && (checked.filter((item)=> item.slice(0,item.length-3).includes(chosenCheck)).length===shortChecksList.filter((item)=> item.slice(0,item.length-3).includes(chosenCheck)).length))} />
            <span>{'select ALL'}</span>
            </div>
            </>
            

            </Box>
          </Box>
          
        </FormGroup>
        
        <div>
        <Box sx={{ color: 'error.main' }}>
          {displayErr && 'please choose atleast one before proceeding...'}
        </Box>

        <Button variant="outlined" color='inherit' onClick={()=> handlePresentResults()} >Send Checks...</Button>
        
        

        </div>


        </>
      );
}


export default ChecksList;