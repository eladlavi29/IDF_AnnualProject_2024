import * as React from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import { styled, useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import TuneIcon from "@mui/icons-material/Tune";

const Input = styled(MuiInput)`
  width: 80px;
`;
const marks = [
  {
    value: 1,
    label: "x1",
  },
  {
    value: 10,
    label: "x10",
  },
];
const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export default function SettingsButton({
  switch1,
  setSwitch1,
  barSpeed,
  updateBarSpeed,
  tableWindowSize,
  setTableWindowSize,
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // const [value, setValue] = React.useState(1);

  const handleSliderChange = (event, newValue) => {
    updateBarSpeed(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === "" ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  return (
    <div>
      <List>
        <ListItem key={"Settings"} disablePadding>
          <ListItemButton onClick={handleDrawerOpen}>
            <ListItemIcon>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
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
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === "rtl" ? (
                  <ChevronLeftIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <Box sx={{ marginLeft: 1, marginTop: 2, height: 50 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={switch1}
                    onChange={setSwitch1}
                    sx={{ left: 10 }}
                  />
                }
                label={
                  <span style={{ marginLeft: "10px" }}>Flight Checks</span>
                }
              />
            </Box>
            <Divider />

            <Box sx={{ marginLeft: 2, marginTop: 2 }}>
              <Typography id="input-slider" alignItems="center" gutterBottom>
                Slider Speed
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Box sx={{ marginLeft: 1, marginRight: 1 }}>
                    <Slider
                      step={1}
                      min={1}
                      max={10}
                      marks={marks}
                      value={barSpeed}
                      onChange={(event, newValue) => {
                        updateBarSpeed(newValue);
                      }}
                      aria-labelledby="input-slider"
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
                <Grid item>
                  {/* <Input
                            value={value}
                            size="small"
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            inputProps={{
                            step: 10,
                            min: 0,
                            max: 100,
                            type: 'number',
                            'aria-labelledby': 'input-slider',
                            }}
                        /> */}
                </Grid>
              </Grid>
            </Box>
            <Divider />
            <Box sx={{ marginLeft: 2, marginTop: 2, height: 40 }}>
              <Typography id="input-slider" alignItems="center" gutterBottom>
                Parameter Table Size
              </Typography>
              <ToggleButtonGroup
                value={tableWindowSize}
                exclusive
                onChange={(event, newSize) => {
                  if (newSize) {
                    setTableWindowSize(newSize);
                  }
                }}
                aria-label="text alignment"
              >
                <ToggleButton value="0%" aria-label="absolute">
                  0%
                </ToggleButton>
                <ToggleButton value="20%" aria-label="absolute">
                  20%
                </ToggleButton>
                <ToggleButton value="33%" aria-label="relative">
                  33%
                </ToggleButton>
                <ToggleButton value="50%" aria-label="relative">
                  50%
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Drawer>
        </ListItem>
      </List>
      <Divider />
    </div>
  );
}
