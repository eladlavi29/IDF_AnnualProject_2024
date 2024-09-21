import './App.css'
import ChecksList from './components/checksList';
import Inputs from './components/inputs'
import React from 'react';
import Results from './components/results';
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import ImportScript from './components/import_script';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));


const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

  

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});

const commonStyles = {
  bgcolor: 'background.paper',
  m: 1,
  borderColor: 'text.primary',
  width: '45rem',
};

interface MyProps {}
interface MyState {
  milkingTime : string,
  tailNum : number,
  displayChecks: boolean,
  displayResults: boolean,
  requestedChecks: Array<string>,
  path:string,
  show:string,
  open: boolean
}

class App extends React.Component <MyProps, MyState> {
  constructor(props:MyProps) {
    super(props);
    this.state = 
      {
      milkingTime : '',
      tailNum : -1,
      displayChecks : false,
      displayResults : false,
      requestedChecks: [],
      path:'',
      show:"inputs",
      open: false
    };
  }

  toString(){
    return (
      'Tail #: ' + this.state.tailNum + '\n' +
      'Draining Time: ' + (this.state.milkingTime)
    )
  }


  showFlightsClicked = () =>{
    let curr_state : MyState = {
      milkingTime : this.state.milkingTime,
      tailNum : this.state.tailNum,
      displayChecks : this.state.displayChecks,
      displayResults : this.state.displayResults,
      requestedChecks: this.state.requestedChecks,
      path : this.state.path,
      show:"inputs",
      open: this.state.open
    };
    this.setState(curr_state);
  }

  setChecksWrap = (flag: boolean, milkingTime:string, tailNum: number) => {
    let curr_state : MyState = {
      milkingTime : milkingTime,
      tailNum : tailNum,
      displayChecks : flag,
      displayResults : false,
      requestedChecks: [],
      path:'',
      show:"checks",
      open: this.state.open
    };

    this.setState(curr_state);
  }

  displayResults = (flag: boolean, requestedChecks: Array<string>, path:string) => {
    let curr_state : MyState = {
      milkingTime : this.state.milkingTime,
      tailNum : this.state.tailNum,
      displayChecks : this.state.displayChecks,
      displayResults : flag,
      requestedChecks: requestedChecks,
      path : path,
      show:"results",
      open: this.state.open
    };
    this.setState(curr_state);
  }

  handlePage = (page:string) => {
    let curr_state : MyState = {
      milkingTime : this.state.milkingTime,
      tailNum : this.state.tailNum,
      displayChecks : this.state.displayChecks,
      displayResults : this.state.displayResults,
      requestedChecks: this.state.requestedChecks,
      path : this.state.path,
      show: page,
      open: this.state.open
    };
    this.setState(curr_state);
  }

  render(){
    const handleDrawerOpen = () => {
      let curr_state : MyState = {
        milkingTime : this.state.milkingTime,
        tailNum : this.state.tailNum,
        displayChecks : this.state.displayChecks,
        displayResults : this.state.displayResults,
        requestedChecks: this.state.requestedChecks,
        path : this.state.path,
        show: this.state.show,
        open: true
      };
      this.setState(curr_state);
    };
  
    const handleDrawerClose = () => {
      let curr_state : MyState = {
        milkingTime : this.state.milkingTime,
        tailNum : this.state.tailNum,
        displayChecks : this.state.displayChecks,
        displayResults : this.state.displayResults,
        requestedChecks: this.state.requestedChecks,
        path : this.state.path,
        show: this.state.show,
        open: false
      };
      this.setState(curr_state);
    };

    return (
      <>

      <ThemeProvider theme={darkTheme}>
      <AppBar position="fixed" open={this.state.open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(this.state.open && { display: 'none' }),
            }}
          >
            <MenuIcon/>
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Manatee
          </Typography>
        </Toolbar>
      </AppBar>
      </ThemeProvider>


      <CssBaseline />
      <Drawer variant="permanent" open={this.state.open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {<ArrowBackIcon/>}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['New Flight', 'Import Script'].map((text, _) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={()=>this.handlePage(text=='New Flight' ? 'inputs' : 'import script')}
                sx={{
                  minHeight: 48,
                  justifyContent: this.state.open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: this.state.open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {<div>{text=='New Flight' ? <ReplayIcon/> : <FileUploadIcon/>}</div>}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: this.state.open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>

      
      <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          p: 1,
          m: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}>
        
        
        { (this.state.show === 'inputs' ||this.state.show === 'checks' ||  this.state.show === 'results') &&
            (
              <Item>
              <Box sx={{ ...commonStyles,height: '28rem', border: 0, maxWidth: 400, overflow: 'auto'}} >
                <div>
                <Inputs presentChecks={this.setChecksWrap} showFlightsClicked={this.showFlightsClicked}/>
                </div>
              </Box>
              <br/>
              <br/>
              <br/>
              </Item>
            )
        }

        
        { (this.state.show === 'checks' ||  this.state.show === 'results') &&
          (
          <Item>
          <Box sx={{ ...commonStyles, height: '32rem',border: 0, maxWidth: 400, overflow: 'auto'}} >
            <div>
              {this.state.displayChecks && (<ChecksList presentResults = {this.displayResults}/>)}
            </div>
          </Box>
          </Item>
          )
        }
        
          
        { this.state.show === 'results' &&
        (
        <Item>
        <Box sx={{ ...commonStyles, height: '32rem',border: 0, maxWidth: 400, overflow: 'auto'}} >
          <div>
            {this.state.displayResults && (<Results requestedChecks = {this.state.requestedChecks} path = {this.state.path} 
                                        milkingTime = {this.state.milkingTime} tailNum = {this.state.tailNum}/>)}
          </div>
        </Box>
        </Item>
        )
        }


        
        { this.state.show === 'import script' &&
          (
          <Item>
          <Box sx={{ ...commonStyles, height: '32rem',border: 0, maxWidth: 400, overflow: 'auto'}} >
          <div>
              <ImportScript />
          </div>
          </Box>
          </Item>
          )
        }


      </Box>

      

      
      </>
    )
  }
};

export default App;
