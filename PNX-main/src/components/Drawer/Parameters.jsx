import { useMemo, useEffect, useState } from "react";
import {
  Box,
  Drawer,
  Autocomplete,
  TextField,
  List,
  Stack,
  Button,
  Table,
  Divider,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChecklistIcon from "@mui/icons-material/Checklist";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export default function Parameters({ allParams, params, setParams }) {
  const drawerWidth = 320;
  const [textValue, setTextValue] = useState(null);
  const [open, setOpen] = useState(false);
  return (
    <ListItem key={"parameters"} disablePadding>
      <ListItemButton onClick={() => setOpen(true)}>
        <ListItemIcon>
          <ChecklistIcon />
        </ListItemIcon>
        <ListItemText primary="Parameters" />
      </ListItemButton>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
          position: "absolute",
          left: 0,
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Autocomplete
          // clearOnEscape
          disablePortal
          id="add-param"
          value={textValue}
          options={allParams}
          sx={{ width: 300, m: 1 }}
          renderInput={(params) => <TextField {...params} label="Parameters" />}
          onChange={(event, newParam) => {
            console.log(newParam);
            if (params.indexOf(newParam) == -1) {
              setParams([...params, newParam]);
            }
            setTextValue(null);
            console.log(params);
          }}
        />
        <List>
          {params.map((param) => (
            <ListItem key={param} disablePadding>
              <ListItemButton
                onClick={() => {
                  let newParams = params.slice();
                  newParams.splice(newParams.indexOf(param), 1);
                  setParams(newParams);
                }}
              >
                <ListItemText primary={param} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </ListItem>
  );
}
//     return (
//         <List>
//             <ListItem key={'Query Builder'} disablePadding>
//             <ListItemButton onClick={handleDrawerOpen}>
//             <ListItemIcon>
//             <ManageSearchRoundedIcon/>
//             </ListItemIcon>
//             <ListItemText primary= "Query Builder" />
//             </ListItemButton>

//                 <Drawer
//                     sx={{
//                     width: drawerWidth,
//                     flexShrink: 0,
//                     '& .MuiDrawer-paper': {
//                         width: drawerWidth,
//                     },
//                     position: 'absolute',
//                     left: 0
//                     }}
//                     variant="persistent"
//                     anchor="left"
//                     open={open}
//                 >
//                     <DrawerHeader>
//                     <IconButton onClick={handleDrawerClose}>
//                         {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//                     </IconButton>
//                     </DrawerHeader>
//                     <Divider />

//                     <Autocomplete
//                       disablePortal
//                       id="combo-box-demo"
//                       options={possibleQueries.map((query) => (
//                           query.query
//                       ))}
//                       sx={{ width: 300 , m:1}}
//                       renderInput={(params) =>
//                         <TextField {...params} label="Query" />
//                       }

//                       onChange={(event, newQuery) => {
//                         setInputQuery(
//                           possibleQueries.filter((query)=>query.query == newQuery)[0]
//                         );
//                       }}
//                     />

//                     <Button variant="text" onClick={handleQueryBuilderOpen}>Enter</Button>
//                     <Divider />

//                     <List>
//                       {history.map((query, index) => (
//                           <ListItem key={index} disablePadding>
//                           <ListItemButton
//                             onClick={() =>
//                               {setInputQuery(query);
//                                 setOpenDialog(true);
//                                 setOpen(false);}}>
//                           <ListItemIcon>
//                           {(() => {
//                               switch(query.type) {
//                                   case 'Heat Map': return <BlurLinearRoundedIcon />
//                                   case 'Marker Map': return <FmdGoodRoundedIcon />
//                                   default: return <MapRoundedIcon />
//                               }
//                           })()}
//                           </ListItemIcon>
//                           <ListItemText primary={query.query} />
//                           </ListItemButton>
//                         </ListItem>
//                       ))}
//                     </List>
//                 </Drawer>
//             </ListItem>
//         </List>);
// }
