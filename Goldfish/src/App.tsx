import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import HelpIcon from "@mui/icons-material/Help";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import HistoryIcon from "@mui/icons-material/History";
import { DataGrid } from "@mui/x-data-grid";
import Autocomplete from "@mui/material/Autocomplete";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import DataObjectIcon from "@mui/icons-material/DataObject";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
// import io from "socket.io-client";
import styled from "styled-components";
import SettingsIcon from "@mui/icons-material/Settings";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { WidthFull } from "@mui/icons-material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SaveIcon from "@mui/icons-material/Save";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import MapIcon from "@mui/icons-material/Map";
import TableChartIcon from "@mui/icons-material/TableChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import IosShareIcon from "@mui/icons-material/IosShare";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// const socket = io("ws://localhost:5000");
import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

export async function exeQuery(
  query: any,
  setOutput: any,
  setStatus: any,
  setSwitchModes: any
) {
  try {
    setStatus("Running");
    const { data, error } = await client.query({
      query: gql(query),
    });
    if (error) {
      setStatus("Error");
      setOutput(error);
      return;
    }
    console.log("DATA: ", data);
    setOutput(data);
    setStatus("Done");
  } catch (error) {
    setStatus("Error");
    setSwitchModes(0);
    setOutput(error);
    return;
  }
}

const getColumnsFromData = (data: any) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => ({
    field: key,
    headerName: key.toUpperCase(),
    width: 200,
  }));
};

const getRowsFromData = (data: any) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item, index) => ({
    ...item,
    id: index + 1,
  }));
};

function App() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const textFieldRef = useRef(null);
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [info, setInfo] = useState("");
  const [queryName, setQueryName] = useState("");
  const [parameters, setParameters] = useState("");
  const [result, setResult] = useState('{"output": []}');
  const [startTime, setStartTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [numRows, setNumRows] = useState(1);
  const [switchModes, setSwitchModes] = useState(0);
  const [showSwitch, setShowSwitch] = useState(false);
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState({});
  const [columns, setColumns] = useState(getColumnsFromData([]));
  const [rows, setRows] = useState(getRowsFromData([]));
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [paramListToSend, setParamListToSend] = useState([]);
  const [typeListToSend, setTypeListToSend] = useState([]);
  useEffect(() => {
    console.log("output: ", output);
    if (output.hasOwnProperty("heat_map")) {
      setShowSwitch(true);
      setColumns(getColumnsFromData(output.heat_map));
      setRows(getRowsFromData(output.heat_map));
      setType("1");
    } else if (output.hasOwnProperty("marker_map")) {
      setShowSwitch(true);
      setColumns(getColumnsFromData(output.marker_map));
      setRows(getRowsFromData(output.marker_map));
      setType("2");
    } else if (output.hasOwnProperty("flight")) {
      if (output.flight.hasOwnProperty("heatmap_from_rows")) {
        setShowSwitch(true);
        setColumns(getColumnsFromData(output.flight.heatmap_from_rows));
        setRows(getRowsFromData(output.flight.heatmap_from_rows));
        setType("1");
      } else {
        setShowSwitch(false);
      }
    } else {
      setShowSwitch(false);
    }
  }, [output]);
  const startTimer = () => {
    setStartTime(new Date().getTime());
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    if (isTimerRunning) {
      const endTime = new Date().getTime();
      const elapsed = endTime - startTime;
      setElapsedTime(elapsed);
      setIsTimerRunning(false);
    }
  };

  useEffect(() => {
    let timerInterval;

    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        setElapsedTime(elapsed);
      }, 10); // Update every 10 milliseconds for more accuracy
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [isTimerRunning, startTime]);

  const formatTime = (milliseconds) => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);
    const formattedMilliseconds = Math.floor(milliseconds % 1000);
    return `${minutes}m ${remainingSeconds}s ${formattedMilliseconds}ms`;
  };

  const toggleSearch = () => {
    setIsSearchVisible((prev) => !prev);
  };

  const handleKeyDownForQuery = (event: any) => {
    if (event.key === "Tab" && textFieldRef.current) {
      event.preventDefault();

      // Get the current cursor position
      const { selectionStart, selectionEnd } = textFieldRef.current;

      // Insert a tab character at the cursor position
      const newText =
        textFieldRef.current.value.substring(0, selectionStart) +
        "\t" +
        textFieldRef.current.value.substring(selectionEnd);

      // Update the text field value and cursor position
      textFieldRef.current.value = newText;
      textFieldRef.current.setSelectionRange(
        selectionStart + 1,
        selectionStart + 1
      );
    }
    if (event.key === "/" && event.ctrlKey) {
      event.preventDefault();
      toggleCommentLines();
    }
  };

  const toggleCommentLines = () => {
    const textField = textFieldRef.current;

    if (textField) {
      // Get the selection range
      const selectionStart = textField.selectionStart;
      const selectionEnd = textField.selectionEnd;

      // Get the full text
      const fullText = textField.value;

      // Find the start and end indices of the selected lines
      let lineStart = selectionStart;
      let lineEnd = selectionEnd;

      while (lineStart > 0 && fullText[lineStart - 1] !== "\n") {
        lineStart--;
      }

      while (lineEnd < fullText.length && fullText[lineEnd] !== "\n") {
        lineEnd++;
      }

      // Get the selected lines
      const selectedLines = fullText.substring(lineStart, lineEnd);

      // Split the selected lines into lines
      const lines = selectedLines.split("\n");

      // Toggle comment for each line
      const toggledLines = lines.map((line) => {
        if (line.trim().startsWith("# ")) {
          return line.substring(3);
        } else {
          return `# ${line}`;
        }
      });

      // Replace the selected text with the modified lines
      textField.setRangeText(
        toggledLines.join("\n"),
        lineStart,
        lineEnd,
        "end"
      );

      // Clear the selection
      textField.setSelectionRange(lineEnd, lineEnd);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setType(event.target.value as string);
  };

  const handleInputChange = (event: any) => {
    setQuery(event.target.value);
  };

  const handleNameChange = (event: any) => {
    setQueryName(event.target.value);
  };
  const handleParamChange = (event: any) => {
    setParameters(event.target.value);
  };

  // const sendQueryToServer = (msg: string) => {
  //   console.log(msg);
  //   socket.emit("to-server-query", msg);
  // };

  const buttonClickSendQuery = () => {
    let newQuery = query;
    setParamListToSend([]);
    setTypeListToSend([]);
    const stringWithoutSpaces = parameters.replace(/\s/g, "");
    const keyValuePairs = stringWithoutSpaces.split(",");
    console.log("check2:", keyValuePairs);
    keyValuePairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      const [name, type] = key.split(":");
      //resultObject[key] = isNaN(value as any) ? value : parseFloat(value);
      newQuery = newQuery.replaceAll("$" + name + "$", value);
      setParamListToSend((prev) => [...prev, name]);
      setTypeListToSend((prev) => [...prev, type]);
    });
    console.log("params: ", paramListToSend);
    console.log("types: ", typeListToSend);
    console.log("check3:", newQuery);
    exeQuery(newQuery, setOutput, setStatus, setSwitchModes);
  };

  const toggleTypeShow = () => {
    setSwitchModes((switchModes + 1) % 2);
  };
  const buttonClickStopQuery = () => {
    // console.log(result);
    // console.log(JSON.parse(result).output);
    stopTimer();
  };

  const handleClear = () => {
    setQuery("");
    setQueryName("");
    setType("");
    setSwitchModes(0);
    setStartTime(0);
    setIsTimerRunning(false);
    setInfo("");
    setOutput({});
    setRows([]);
    setColumns([]);
    setStatus("");
    setOpenError(false);
    setOpenSuccess(false);
    setParamListToSend([]);
    setTypeListToSend([]);
    setParameters("");
  };

  const updateNumberOfLines = () => {
    setNumRows(Math.floor(window.innerHeight / 21) - 14);
    // setNumRows(Math.floor(window.innerHeight / 27) - 7);
  };

  useEffect(() => {
    if (status === "Done") setOpenSuccess(true);
    if (status === "Error") setOpenError(true);
  }, [status]);
  useEffect(() => {
    // Initial setup
    updateNumberOfLines();

    // Event listener for window resize
    window.addEventListener("resize", updateNumberOfLines);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateNumberOfLines);
    };
  }, []);

  // const handleLoad = () => {};

  const handleSave = () => {
    let typeName = "";
    if (type == "1") typeName = "Heat Map";
    if (type == "2") typeName = "Marker Map";
    if (type == "3") typeName = "Plane";
    let dict = {
      name: queryName,
      type: typeName,
      params: paramListToSend,
      params_types: typeListToSend,
      template: query,
    };
    console.log(
      "SENDING: ",
      `
      query {
        insert_query(name: "${dict.name}", template: """${
        dict.template
      }""", type: "${dict.type}", params: [${dict.params.map(
        (p) => '"' + p + '"'
      )}], params_types: [${dict.params_types.map((p) => '"' + p + '"')}]) {
          name
        }
      }
    `
    );
    client.query({
      query: gql`
      query {
        insert_query(name: "${dict.name}", template: """${
        dict.template
      }""", type: "${dict.type}", params: [${dict.params.map(
        (p) => '"' + p + '"'
      )}], params_types: [${dict.params_types.map((p) => '"' + p + '"')}]) {
          name
        }
      }
    `,
    });
  };

  useEffect(() => {
    if (type == "1") setInfo("HeatMap: list of 3-tuple: (lat, long, strength)");
    if (type == "2") setInfo("MarkerMap: list of 3-tuple: (lat, long, text)");
    if (type == "3") setInfo("Plane: list of fid");
  }, [type]);

  // useEffect(() => {
  //   socket.emit("to-server-params", "");
  // }, []);

  // useEffect(() => {
  //   socket.on("from-server-params", (msg) => {
  //     setGotParams(true);
  //     setParams(msg);
  //     //console.log(params);
  //   });
  // }, []);

  // useEffect(() => {
  //   socket.on("from-server-query", (msg) => {
  //     setResult(msg);

  //     //console.log(params);
  //   });
  // }, []);

  // useEffect(() => {
  //   socket.on("from-server-columns", (msg) => {
  //     setColumns(msg);

  //     //console.log(params);
  //   });
  // }, []);

  useEffect(() => {
    stopTimer();
  }, [result]);
  const iconStyle = { color: "#000000", fontSize: 20 }; // Adjust icon styles
  const buttonStyle = { color: "#000000", fontSize: 14 }; // Adjust button text styles
  const multilineString = `
  Type ∈ {Number, String, Date, Time}.
  `;

  return (
    <>
      {/* <Button variant="contained" onClick={handleOpenDialog}>
        Open Explanation
      </Button> */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Help</DialogTitle>
        <DialogContent dividers>
          <Typography>
            {" "}
            In Query write "$name$" and in Parameters write "name : Type =
            value".{" "}
          </Typography>
          <Typography> For example: </Typography>
          <Typography>
            {" "}
            Query: SELECT * FROM table WHERE name = $name${" "}
          </Typography>
          <Typography> Parameters: name : String = "John" </Typography>
          <Typography> Then click Run. </Typography>
          <Typography> For multiple parameters: </Typography>
          <Typography>
            {" "}
            Parameters: name : String = "John", age : Number = 20{" "}
          </Typography>
          <Typography> {multilineString}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setOpenSuccess(false)}
      >
        <Alert
          onClose={() => setOpenSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Query succeed!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openError}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setOpenError(false)}
      >
        <Alert
          onClose={() => setOpenError(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Error running query
        </Alert>
      </Snackbar>
      <AppBar position="static" style={{ backgroundColor: "#f5cf55" }}>
        <Toolbar
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "none",
          }}
        >
          <Avatar
            src="/src/assets/goldfish(2).png"
            alt="Logo"
            style={{ marginRight: "10px" }}
          />
          <Typography
            variant="h4"
            component="div"
            style={{
              fontFamily: '"Segoe UI"',
              color: "#000000",
              fontWeight: "bold",
            }}
          >
            Goldfish
          </Typography>
          <div style={{ width: "10px" }} />
          <Typography
            variant="h4"
            component="div"
            style={{
              fontFamily: '"Segoe UI"',
              color: "#000000",
            }}
          >
            Query Editor
          </Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <IconButton
              color="inherit"
              onClick={handleClear}
              style={buttonStyle}
              sx={{ "& > *:not(:last-child)": { marginRight: 0.5 } }}
            >
              <DeleteIcon style={iconStyle} />
              Clear
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleSave}
              style={buttonStyle}
              sx={{ "& > *:not(:last-child)": { marginRight: 0.5 } }}
            >
              <SaveIcon style={iconStyle} />
              Save
            </IconButton>
            {/* <IconButton
              color="inherit"
              onClick={handleLoad}
              style={buttonStyle}
              sx={{ "& > *:not(:last-child)": { marginRight: 0.5 } }}
            >
              <CloudDownloadIcon style={iconStyle} />
              Load
            </IconButton> */}
          </div>
        </Toolbar>
      </AppBar>

      <Box
        component="section"
        display="flex"
        sx={{
          p: 1,
          justifyContent: "flex-start",
          flexDirection: "row",
          marginTop: 1,
          gap: 2,
        }}
      >
        <TextField
          id="tf-1"
          label="Query Name"
          onChange={handleNameChange}
          variant="outlined"
          sx={{ width: "20%" }}
          value={queryName}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="sl-1">Type</InputLabel>
          <Select
            labelId="sl-1"
            id="s-1"
            value={type}
            label="Type"
            onChange={handleChange}
          >
            <MenuItem value={1}>Heat Map</MenuItem>
            <MenuItem value={2}>Marker Map</MenuItem>
            <MenuItem value={3}>Planes</MenuItem>
          </Select>
        </FormControl>
        {/* <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ alignSelf: "center", color: "grey" }}
        >
          {info}
        </Typography> */}
        <TextField
          id="tf-66"
          label="Parameters"
          onChange={handleParamChange}
          variant="outlined"
          sx={{ width: "50%" }}
          value={parameters}
        />
        <Box
          sx={{
            position: "fixed",
            right: 10,
            display: "flex",
            gap: 0.5,
            alignItems: "center",
          }}
        >
          {/* {isSearchVisible && (
            <Box sx={{ transition: "width 1s ease" }}>
              {gotParams && (
                <Autocomplete
                  disablePortal
                  autoHighlight
                  id="cm-1"
                  options={JSON.parse(params).output.map((x: any) => ({
                    label: x[1] + " (" + x[0] + ")",
                  }))}
                  sx={{ width: 300 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search for Parameters"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <SearchIcon sx={{ color: "grey", marginLeft: 0.5 }} />
                        ),
                      }}
                    />
                  )}
                />
              )}
            </Box>
          )} */}
          {/* <IconButton onClick={toggleSearch}>
            <Avatar sx={{ backgroundColor: "grey" }}>
              {isSearchVisible ? (
                <CloseIcon sx={{ color: "white" }} />
              ) : (
                <SearchIcon sx={{ color: "white" }} />
              )}
            </Avatar>
          </IconButton> */}
          {showSwitch && (
            <IconButton onClick={toggleTypeShow}>
              <Avatar sx={{ backgroundColor: "grey" }}>
                {switchModes == 0 ? (
                  <DataObjectIcon sx={{ color: "white" }} />
                ) : (
                  <BackupTableIcon sx={{ color: "white" }} />
                )}
              </Avatar>
            </IconButton>
          )}
          <IconButton onClick={handleOpenDialog}>
            <Avatar sx={{ backgroundColor: "grey" }}>
              <HelpIcon sx={{ color: "white" }} />
            </Avatar>
          </IconButton>
        </Box>
      </Box>

      <div>
        <Box
          component="section"
          display="flex"
          sx={{
            p: 1,
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: 4,
          }}
        >
          <TextField
            id="tf-1"
            label="Query"
            multiline
            rows={numRows}
            variant="outlined"
            sx={{ width: "50%" }}
            InputProps={{ style: { fontFamily: "Consolas", fontSize: 16 } }}
            onChange={handleInputChange}
            value={query}
            inputRef={textFieldRef}
            onKeyDown={handleKeyDownForQuery}
          />

          {/* <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 650, maxHeight: "50vh" }}
                size="small"
                aria-label="a dense table"
              >
                <TableHead>
                  <TableRow>
                    {JSON.parse(columns).output.map((column: any) => (
                      <TableCell key={Math.random()}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {column}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {JSON.parse(result).output.map((row: any) => (
                    <TableRow key={Math.random()}>
                      {row.map((cell: any) => (
                        <TableCell key={Math.random()}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> */}

          {switchModes == 0 ? (
            <TextField
              id="tf-2"
              label="Output"
              multiline
              rows={numRows}
              variant="filled"
              sx={{ width: "50%" }}
              InputProps={{
                readOnly: true,
                style: { fontFamily: "Consolas", fontSize: 16 },
              }}
              // onChange={handleInputChange}
              value={JSON.stringify(output, null, 2)}
              // inputRef={textFieldRef}
              // onKeyDown={handleKeyDownForQuery}
            />
          ) : (
            <Box
              sx={{
                maxHeight: `calc(${numRows} * 1.5em)`,
                overflow: "auto",
                width: "50%",
              }}
            >
              <DataGrid
                rows={rows}
                pageSize={5}
                // rowsPerPageOptions={[5, 10, 20]}
                pagination
                columns={columns}
                // rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            </Box>
          )}
        </Box>
      </div>

      <Box
        component="section"
        display="flex"
        sx={{
          p: 1,
          justifyContent: "flex-start",
          flexDirection: "row",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          onClick={buttonClickSendQuery}
          startIcon={<PlayArrowIcon />}
          sx={{
            backgroundColor: "black",
            color: "#f5cf55",
            "&:hover": {
              backgroundColor: "#333333",
            },
          }}
          style={{ textTransform: "none" }}
        >
          Run
        </Button>
        {/* <Button
          variant="contained"
          onClick={buttonClickStopQuery}
          startIcon={<StopIcon />}
          sx={{
            backgroundColor: "black",
            color: "#f5cf55",
            "&:hover": {
              backgroundColor: "#333333",
            },
          }}
          style={{ textTransform: "none" }}
        >
          Stop
        </Button> */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center", // Center children horizontally
            justifyContent: "center", // Center children vertically
            gap: 1, // Add space between children
          }}
        >
          {status !== "" && (
            <Typography variant="body1">Status: {status}</Typography>
          )}
          {status === "Running" && <CircularProgress size={20} />}
        </Box>
        <Box
          sx={{
            position: "fixed",
            right: 15,
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          {/* <Button
            variant="outlined"
            onClick={buttonClickStopQuery}
            startIcon={<HistoryIcon />}
            sx={{
              borderColor: "black",
              color: "black",
              borderWidth: "2px",
              "&:hover": {
                borderColor: "black",
                borderWidth: "2px", // Adjust the thickness on hover
              },
            }}
            style={{ textTransform: "none" }}
          >
            History
          </Button>
          <Button
            variant="contained"
            onClick={buttonClickStopQuery}
            startIcon={<IosShareIcon />}
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
            style={{ textTransform: "none" }}
          >
            Export
          </Button> */}
        </Box>
      </Box>
    </>
  );
}

export default App;
