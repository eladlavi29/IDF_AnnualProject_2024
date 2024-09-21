import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
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

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import {getQueriesOfType, getQueryTypes, deleteQuery, setShowall, setAllData} from '../../DjangoCommunication';
import Query from '../../Query'
import { ButtonGroup } from '@mui/material';
import { Edit } from '@mui/icons-material';

const drawerWidth = 320;    

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function QueryBuilderButton({insertedQueryJson, setHeatMapData, setShowHeatMap, 
  setFlights,setMarkerMapData, query_num, setQuery_num, setQueriesDict, QueriesDict, setShowMarkerMap,
  }) {
  
  const possibleQueries = [].concat.apply([], 
  getQueryTypes().map((type) => 
    getQueriesOfType(type).map((query) => 
    new Query(query, type))));

    const theme = useTheme();
    
    const [historyIndex, setHistoryIndex] = React.useState(0);

    const [inputQuery, setInputQuery] = React.useState(new Query('', ''));

    const [open, setOpen] = React.useState(false);

    const [openDialog, setOpenDialog] = React.useState(false);

    const handleDrawerOpen = () => {
      setOpen(true);
    };
  
    const handleDrawerClose = () => {
      setOpen(false);
    };

    const convertToOptionName = (query) => {
      switch(query.type) {
        case 'Heat Map': return "⛆ "+ query.query
        //📍  
        case 'Marker Map': return "🖈 " + query.query
        default: return "✈ " + query.query
      }
    }

    const [calledFromHistory, setCalledFromHistory] = React.useState(false);

    const handleQueryBuilderOpen = () => {
      if((inputQuery.query != '')){
        setOpenDialog(true);
        setOpen(false);
      }
    }

    const closeChildDialog = () => {
      setOpenDialog(false);
    }

    const [history, setHistory] = React.useState([]);

    const insertToHistory = (query) => {
      query.index = historyIndex;
      setHistoryIndex(historyIndex + 1); 
      //addHistoryType(query.type);

      if(query.type == "Heat Map"){
        setHistory([].concat(query, history.filter(item => item.type != 'Heat Map')));
        return;
      }

      setHistory([].concat(query, history));
    }

    const removeFromHistory = (query) => {
      switch(query.type) {
        case 'Heat Map': 
          let res = deleteQuery(query.index, query.type, setQueriesDict, QueriesDict, setHeatMapData);
          setShowall(setShowHeatMap, setShowMarkerMap, res)

        case 'Marker Map': 
          console.log("HERE-Marker Map, query.index: ", query.index)
          let res1 = deleteQuery(query.index, query.type, setQueriesDict, QueriesDict, setMarkerMapData);
          setShowall(setShowHeatMap, setShowMarkerMap, res1)

        case 'Plane':
          if (query.type=='Plane'){
            deleteQuery(query.index, query.type, setQueriesDict, QueriesDict, setFlights);
          }

      }
      setAllData(setHeatMapData, setMarkerMapData, setFlights, QueriesDict)

      setHistory(history.filter(item => item.index != query.index));
    }

    function instertAndRemoveFromHistory(query, newQuery) {
      switch(query.type) {
        case 'Heat Map': 
          let res = deleteQuery(query.index, query.type, setQueriesDict, QueriesDict, setHeatMapData);
          setShowHeatMap(res)

        case 'Marker Map': 
          console.log("HERE-Marker Map, query.index: ", query.index)
          let res1 = deleteQuery(query.index, query.type, setQueriesDict, QueriesDict, setMarkerMapData);
          setShowMarkerMap(res1)

        case 'Plane':
          if (query.type=='Plane'){
            deleteQuery(query.index, query.type, setQueriesDict, QueriesDict, setFlights);
          }

      }

      setHistory([].concat(newQuery, (history.filter(item => item.index != query.index))));

      query.index = historyIndex;
      setHistoryIndex(historyIndex + 1); 
    }

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
                        convertToOptionName(query)
                      ))}
                      sx={{ width: 300 , m:1}}
                      renderInput={(params) => 
                        <TextField {...params} label="Query" />
                      }

                      onChange={(event, newQuery) => {
                        let words = newQuery.split(" ");
    
                        setInputQuery(
                          possibleQueries.filter((query)=>query.query == words[1])[0]
                        );
                      }}
                    />

                    <Button variant="text" 
                    onClick={() => {setCalledFromHistory(false); handleQueryBuilderOpen();}}>
                    Enter</Button>    
                    <Divider />

                    <List>
                      {history.map((query, index) => (
                          <ListItem key={index} disablePadding>
                            
                          <ListItemIcon sx={{marginLeft: 2}}>
                          {(() => {
                              switch(query.type) {
                                  case 'Heat Map': return <BlurLinearRoundedIcon />
                                  case 'Marker Map': return <FmdGoodRoundedIcon />
                                  default: return <MapRoundedIcon />
                              }
                          })()}
                          </ListItemIcon>
                          <ListItemText primary={query.query} />
                          {/* <IconButton onClick={() => 
                            { setCalledFromHistory(true);
                              setInputQuery(query); 
                              setOpenDialog(true);
                              setOpen(false);}}>
                          <EditIcon fontSize='small'/>
                          </IconButton> */}
                          <IconButton>
                          <CloseIcon fontSize='small' onClick={() => removeFromHistory(query)}/>
                          </IconButton>
                        </ListItem>
                      ))}                    
                    </List>
                </Drawer>
            </ListItem>
        </List>
        <Divider />
        {(openDialog) && (inputQuery.query != '') &&
          <BuildQueryDialog insertedQueryJson={insertedQueryJson} key={inputQuery.query} query={inputQuery} updateQuery={setInputQuery} 
          insertToHistory={insertToHistory} instertAndRemoveFromHistory={instertAndRemoveFromHistory} calledFromHistory={calledFromHistory}
          setHeatMapData={setHeatMapData} updateOpen={closeChildDialog} setShowHeatMap={setShowHeatMap} setFlights={setFlights} setMarkerMapData={setMarkerMapData} query_num={query_num} setQuery_num={setQuery_num} setQueriesDict={setQueriesDict} QueriesDict={QueriesDict} setShowMarkerMap={setShowMarkerMap}/>}
    </div>
  );
}