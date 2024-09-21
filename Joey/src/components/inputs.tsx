import { useEffect, useState } from "react"; 
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import io from "socket.io-client";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { MenuItem } from "@mui/material";
import { Dayjs } from "dayjs";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

// file for page of getting inputs for the flight info

const socket = io("http://127.0.0.1:5001");

const Div = styled('div')(({ theme }) => ({
  ...theme.typography.h6,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
}));

function Inputs(props:any) {
  const [milkingTime, setMilkingTime] = useState<string>('')
  const [tailNum, setTailNum] = useState(-1)
  const [tailNumString, setTailNumString] = useState("")
  const [displayErr, setDisplayErr] = useState(false);
  const [displayErrChecks, setDisplayErrChecks] = useState(false);
  const [serverMsg, setServerMsg] = useState('{"strings": []}');
  const [data, setData] = useState([]);
  const [shortData, setShortData] = useState([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [showFlights, setShowFlights] = useState(false);
  const [flight, setFlight] = useState('');
  // const [fid, setFid] = useState("");

  var pid = "";

  useEffect(() => {
  socket.on("send-draining-times", (msg:string) => {
    setServerMsg(msg)
  });
  }, []);

  useEffect(() => {
    socket.on("recv-tailnum-draining", (msg:string) => {
      let curr = JSON.parse(msg);
      console.log(curr.tail_number, curr.draining);
      setTailNum(parseInt(curr.tail_number));
      setTailNumString(curr.tail_number);
      setMilkingTime(curr.draining);
      setFlight(curr.draining as string);
      let keep = curr.draining as string;
      console.log("try: ", curr.draining, keep.length)
      
      
      let temp = {'tail_num' : parseInt(curr.tail_number)}
      socket.emit("request-draining-times", JSON.stringify(temp));
      
      props.showFlightsClicked()
      setDisplayErr(false);
      setShowFlights(true)

    });
    }, []);

  useEffect(() => {
    if(pid!=""){
      let temp = {'fid' : pid}
      socket.emit("send-tailnum-draining", JSON.stringify(temp));
    }
    }, []);

  useEffect(() => {
    let curr = JSON.parse(serverMsg).strings
    setData(curr)
  }, [serverMsg]);

  useEffect(() => {
    if (date!==null){
      setShortData(data.filter((item:string) => ( 
        (item.includes(date.format('YYYY-MM-DD'))))
      ))
    }
    else{
      setShortData(data)
    }
  }, [date, data]);

  

  function HandleSearchChecks(){
    if (flight != ''){
      setDisplayErrChecks(false);
      props.presentChecks(true, milkingTime, tailNum)
    }
    else{
      setDisplayErrChecks(true);
    }
  }

  // function strToTime(str:string){
  //   let ind1 : number = str.indexOf('-')
  //   let ind2 : number= str.lastIndexOf('-')
  //   let ind3 : number =  str.indexOf(' ')
  //   let ind4 : number= str.indexOf(':')
  //   let ind5 : number = str.lastIndexOf(':')

  //   let year = parseInt(str.slice(0,ind1))
  //   let month = parseInt(str.slice(ind1+1,ind2))
  //   let day = parseInt(str.slice(ind2+1,ind3))
  //   let hour = parseInt(str.slice(ind3+1,ind4))
  //   let minute = parseInt(str.slice(ind4+1,ind5))
  //   let sec = parseInt(str.slice(ind5+1))

  //   return ({
  //     'year' : year,
  //     'month' : month,
  //     'day' : day,
  //     'hour' : hour,
  //     'min' : minute,
  //     'sec' : sec,
  //   });
  // }
          
  function onTailNumInput(evt: any) {
    setTailNum(+(evt.target.value));
    setTailNumString(evt.target.value);
  }

  function HandleShowFlights(){
    if(tailNum===-1){
        setDisplayErr(true);
    }
    else{
      let temp = {'tail_num' : tailNum}

      socket.emit("request-draining-times", JSON.stringify(temp));
      
      console.log("HERE");
      props.showFlightsClicked()
      if(pid.length==0){
        setFlight('')
      }
      setDisplayErr(false);
      setShowFlights(true)
    }
  }

  function handleFlightInput(event: SelectChangeEvent){
    setFlight(event.target.value as string);
    let str = event.target.value as string
    console.log("real=", str, str.length);
    setMilkingTime(event.target.value)
  }

  function changeOrder(str:string){
    let ind1 : number = str.indexOf('-')
    let ind2 : number= str.lastIndexOf('-')
    let ind3 : number =  str.indexOf(' ')
    let ind4 : number= str.indexOf(':')
    let ind5 : number = str.lastIndexOf(':')

    let year = (str.slice(0,ind1))
    let month = (str.slice(ind1+1,ind2))
    let day = (str.slice(ind2+1,ind3))
    let hour = (str.slice(ind3+1,ind4))
    let min = (str.slice(ind4+1,ind5))
    let sec = (str.slice(ind5+1))

    return day+"-"+month+"-"+year+" "+hour+":"+min+":"+sec
  }

  const Wrapper = () => {
    const [searchParams] = useSearchParams();
    pid = searchParams.get('pid') || "";

    return (
      <></>
    );
  };

  useEffect(() => {
    console.log("Current flight value:", flight);
  }, [flight]);


  return (

    <Router>
      <Routes>
        <Route path="/" element={
      
    <>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Div>{"ENTER FLIGHT INFO"}</Div>
      <Wrapper />
      <div>
      <br></br>
      </div>
      <div>
      <TextField value={tailNumString} id="TailNum-outlined-basic" label="Tail #" variant="outlined" size="small" onChange={evt => onTailNumInput(evt)}/>
      </div>
      <br></br>
      <br></br>
      <Button variant="outlined" color='inherit' onClick={()=> HandleShowFlights()}>
        SHOW AVAILABLE FLIGHTS...
      </Button>
      <br></br>
      <br></br>
      <br></br>

      <Box sx={{ color: 'error.main' }}>
        {displayErr && 'please enter the tail number before proceeding...'}
      </Box>

      <div>
      
      { showFlights && 
      (
      <>

      <Box display="flex" justifyContent="center" alignItems="center">
        <Box sx={{ minWidth: 180, maxWidth: 240 }}>
          <DatePicker
              label="Date of Flight"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              format="DD/MM/YYYY"
          />
          <br/><br/>


          <FormControl fullWidth>

            <InputLabel htmlFor="uncontrolled-native"> Flight</InputLabel>
            <Select
              inputProps={{
                name: 'STAM',
                id: 'uncontrolled-native',
              }}
              id="demo-simple-select"
              label="Flight"
              value = {flight}
              onChange={handleFlightInput}
            >


            {shortData.map((item, index) => (
              <MenuItem key={index} value = {(item)}> {changeOrder(item)} </MenuItem>
            ))}


              
              
            </Select>

          </FormControl>
        </Box>
      </Box>

      <div>
      <br></br><br></br>
      <Button variant="outlined" color='inherit' onClick={()=> HandleSearchChecks()}>
        Search Available Checks...</Button>

      <Box sx={{ color: 'error.main' }}>
        {displayErrChecks && 'please choose draining time before proceeding...'}
      </Box>
      </div>
      </>
      )
      }

      </div>

    </LocalizationProvider>
    </>}
      />
      </Routes>
    </Router>
  );
};

export default Inputs;