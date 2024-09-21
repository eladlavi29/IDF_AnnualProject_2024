import * as React from 'react';

import Box from '@mui/material/Box';

import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';


export default function InputParamDialog({param, type, content, setContent, index}) {

  const regions = ["Populars' Apartment", "True Friends' Apartment", "The Edge of Eli's pants"];
  const outputParams = ["fid", "Erez's scheducle", "Omer's grades", "Nitzan's Excel"]

  const handleChange = (event) => {
    setContent(index, event.target.value);
  };

  const margin_left = 25
  const margin_top = 20
  const width = 380

  return (
        <Box
            display="flex"
            alignItems="center"
            p={1}>
        {(type == "Number") && 
        <TextField
            sx={{   
                left: margin_left, width: width, margin_top: margin_top
            }}
            key= {param}
            required
            id={param}
            name= {param}
            label= {param}
            type="number"
            onChange={handleChange}
            value= {content}
            variant="outlined"
        />}

        {(type == "String") && 
        <TextField
            sx={{   
                left: margin_left, width: width, margin_top: margin_top
            }}
            key= {param}
            required
            id={param}
            name= {param}
            label= {param}
            onChange={handleChange}
            value= {content}
            variant="outlined"
        />}

        {(type == "Region") &&
            <FormControl sx={{ left: margin_left, width: width, margin_top: margin_top }}>
              <InputLabel htmlFor="demo-dialog-native">{param}</InputLabel>
              <Select
                autoFocus
                required
                native
                value={content}
                onChange={handleChange}
                input={<OutlinedInput label={param} id="demo-dialog-native" />}
              >
                <option aria-label="None" value="" />
                {regions.map((region) => (
                    <option value={region} key={region}>{region}</option>
            ))}

        </Select>
        </FormControl>}

        {(type == "Date") &&
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label={param}
                      required
                      sx={{
                        left: margin_left, width: width, margin_top: margin_top
                      }}
                      onChange={(newValue) => setContent(index, newValue)}/>
            </LocalizationProvider>
        }

        {(type == "Time") &&
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker label={param}
                      required
                      sx={{
                        left: margin_left, width: width, margin_top: margin_top
                      }}    
                      onChange={(newValue) => setContent(index, newValue)}/>
            </LocalizationProvider>
        }
        </Box>
  );
}