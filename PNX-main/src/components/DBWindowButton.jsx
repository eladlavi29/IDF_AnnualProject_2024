import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';

import IconButton from '@mui/material/IconButton';

export default function DBWindowButton({setWindowOpen, windowOpen}) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex' }}>
      <IconButton   
        color="inherit"          
        sx= {{position: "absolute", right: 5, top: 2}}   
        onClick={() => setWindowOpen(!windowOpen)}>
        <AirplanemodeActiveIcon sx={{fontSize: 40}}/>
        </IconButton>
    </Box>
  );
}