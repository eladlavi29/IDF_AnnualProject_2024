import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import QueryBuilderButton from "./Drawer/QueryBuilderButton";
import HistoryButton from "./Drawer/HistoryButton";
import SettingsButton from "./Drawer/SettingsButton";
import HelpButton from "./Drawer/HelpButton";
import Parameters from "./Drawer/Parameters";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export default function DrawerButton({
  insertedQueryJson,
  switch1,
  setSwitch1,
  barSpeed,
  updateBarSpeed,
  setHeatMapData,
  setShowHeatMap,
  setFlights,
  setMarkerMapData,
  query_num,
  setQuery_num,
  setQueriesDict,
  QueriesDict,
  setShowMarkerMap,
  allParams,
  params,
  setParams,
  historyIndex,
  setHistoryIndex,
  addHistoryType,
  removeFromHistory,
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

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <IconButton
        sx={{ position: "absolute", left: 10, top: 5 }}
        color="inherit"
        onClick={handleDrawerOpen}
      >
        <MenuIcon sx={{ fontSize: 40 }} />
      </IconButton>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
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
        <List>
          {["Build Query", "Parameters", "Settings"].map((text) => (
            <div key={text}>
              {(() => {
                switch (text) {
                  case "Build Query":
                    return (
                      <QueryBuilderButton
                        insertedQueryJson={insertedQueryJson}
                        setHeatMapData={setHeatMapData}
                        setShowHeatMap={setShowHeatMap}
                        setFlights={setFlights}
                        setMarkerMapData={setMarkerMapData}
                        query_num={query_num}
                        setQuery_num={setQuery_num}
                        setQueriesDict={setQueriesDict}
                        QueriesDict={QueriesDict}
                        setShowMarkerMap={setShowMarkerMap}
                      />
                    );

                  case "History":
                    return <HistoryButton />;
                  case "Settings":
                    return (
                      <SettingsButton
                        switch1={switch1}
                        setSwitch1={setSwitch1}
                        barSpeed={barSpeed}
                        updateBarSpeed={updateBarSpeed}
                        tableWindowSize={tableWindowSize}
                        setTableWindowSize={setTableWindowSize}
                      />
                    );
                  case "Parameters":
                    return (
                      <Parameters
                        allParams={allParams}
                        params={params}
                        setParams={setParams}
                      />
                    );
                  case "Help":
                    return <HelpButton />;
                  default:
                    return null;
                }
              })()}
            </div>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
