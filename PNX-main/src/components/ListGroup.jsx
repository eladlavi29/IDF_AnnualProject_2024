import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import BlurLinearRoundedIcon from '@mui/icons-material/BlurLinearRounded';
import FmdGoodRoundedIcon from '@mui/icons-material/FmdGoodRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';

import BuildQueryDialog from './BuildQueryDialog'

import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';

import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import {getQueriesOfType, getQueryTypes} from '../../DjangoCommunication';
import Query from '../../Query'

const drawerWidth = 320;    

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function QueryBuilderButton() {
  const possibleQueries = [].concat.apply([], 
    getQueryTypes().map((type) => 
    getQueriesOfType(type).map((query) => 
    new Query(query, type))));
    const theme = useTheme();
    
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
      setOpen(true);
    };
  
    const handleDrawerClose = () => {
      setOpen(false);
    };

  return (
    <div>
        <List>
            <ListItem key={'Query Builder'} disablePadding>
            <ListItemButton onClick={handleDrawerOpen}>
            <ListItemIcon>
            <ManageSearchRoundedIcon/>
            </ListItemIcon>
            <ListItemText primary= "Query Builder" />
            </ListItemButton>

                <Drawer
                    sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                    },
                    position: 'absolute',
                    left: 0
                    }}
                    variant="persistent"
                    anchor="left"
                    open={open}
                >   
                    <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                    </DrawerHeader>
                    <Divider />

                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={possibleQueries.map((query) => (
                          query.query
                      ))}
                      sx={{ width: 300 }}
                      renderInput={(params) => 
                        <div>
                          <TextField {...params} label="Query" />
                          {/* {(() => {
                              switch(type) {
                                  case 'Heat Map': return <BlurLinearRoundedIcon />
                                  case 'Marker Map': return <FmdGoodRoundedIcon />
                                  default: return <MapRoundedIcon />
                              }
                          })()} */}
                        </div>
                      }
                    />
                    
                    {/* <List>
                    {possibleQueries.map((query) => (
                      <BuildQueryDialog key={query.query} type={query.type} query={query.query}/>
                    ))}
                    </List> */}
                </Drawer>
            </ListItem>
        </List>
        <Divider />
    </div>
  );
}