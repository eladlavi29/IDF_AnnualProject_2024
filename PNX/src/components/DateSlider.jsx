import React, { useState, useRef, useEffect } from "react";
import {
  Slider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
  Container,
  Drawer,
} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import FastForwardIcon from "@mui/icons-material/FastForward";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FastRewindIcon from "@mui/icons-material/FastRewind";
function relShift(number) {
  return number / 4;
}
function absShift(number) {
  return number * 10;
}
const DateSlider = ({
  start,
  end,
  value,
  setValue,
  mode,
  setMode,
  show,
  speed,
}) => {
  //const [start, setStart] = useState(new Date("2023-02-11T11:23:00"));
  //const [end, setEnd] = useState(new Date("2023-02-12T19:43:00"));
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [step, setStep] = useState(1); // Default step is 1 second
  //setValue(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef();

  const calculateDateDifferenceInSeconds = (date1, date2) => {
    // Convert dates to timestamps in milliseconds
    const timestamp1 = date1.getTime();
    const timestamp2 = date2.getTime();

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = Math.abs(timestamp2 - timestamp1);

    // Convert milliseconds to seconds
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

    return differenceInSeconds;
  };
  useEffect(() => {
    if (isPlaying) {
      handlePlayStop();
    }
    if (mode === "REL") {
      setStep(relShift(speed));
    } else {
      setStep(absShift(speed));
    }
  }, [speed]);

  useEffect(() => {
    //changed
    let differenceInSeconds = calculateDateDifferenceInSeconds(start, end);
    setMax(differenceInSeconds);
    setValue(differenceInSeconds / 2);
    if (isPlaying) {
      handlePlayStop();
    }
    setMode("ABS");
  }, [start, end]);

  useEffect(() => {
    // solved problem #1 - need to be before the next
    if (value >= max) {
      setValue(max);
      if (isPlaying) {
        handlePlayStop();
      }
    }
    if (value <= min) {
      console.log("value is less than min");
      setValue(min);
    }
  }, [value, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      //solved problem #2
      handlePlayStop();
    }
    if (mode === "REL") {
      setMax(100);
      setValue(50);
      setStep(relShift(speed));
    } else {
      let differenceInSeconds = calculateDateDifferenceInSeconds(start, end);
      setMax(differenceInSeconds);
      setValue(differenceInSeconds / 2);
      setStep(absShift(speed));
    }
  }, [mode]);

  const handlePlayStop = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
    } else {
      intervalRef.current = setInterval(() => {
        setValue((prevValue) => Math.min(prevValue + step, max));
      }, 1); // Adjust the interval as needed
    }
    // console.log(value);
    // console.log(max);
    setIsPlaying(!isPlaying);
  };

  const handleIncrease = () => {
    setValue((prevValue) => prevValue + step);
  };

  const handleDecrease = () => {
    setValue((prevValue) => prevValue - step);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode === null) {
      return;
    }
    setMode(newMode);
  };

  const getNiceDateTime = (now) => {
    if (!now) {
      return "N/A";
    }
    const date = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time}`;
  };

  //   const marks = [
  //     {
  //       value: 0,
  //       label: getNiceDateTime(start),
  //     },
  //     {
  //       value: 100,
  //       label: getNiceDateTime(end),
  //     },
  //   ];
  const calculateNewDate = (secondsToAdd) => {
    // Create a new Date object based on the start date
    const newDate = new Date(start);

    // Add seconds to the new Date object
    newDate.setSeconds(newDate.getSeconds() + secondsToAdd);

    return getNiceDateTime(newDate);
  };

  const calculatePercantage = (value) => {
    return value + "%";
  };

  return (
    <Drawer
      anchor="bottom"
      variant="persistent"
      open={show}
      sx={{
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          boxSizing: "border-box",
          bottom: "15px",
          left: "10%", // Positioned 15% from the left edge of the screen
          width: "80%", // Occupying 70% of the screen width
          borderRadius: "10px",
        },
      }}
      style={{ zIndex: 3 }}
    >
      <Box
        style={{
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "20px",
          }}
        >
          <IconButton onClick={handleDecrease}>
            <FastRewindIcon />
          </IconButton>
          <IconButton onClick={handlePlayStop}>
            {isPlaying ? <PauseCircleIcon /> : <PlayCircleIcon />}
          </IconButton>
          <IconButton onClick={handleIncrease}>
            <FastForwardIcon />
          </IconButton>
        </Box>
        <Box
          style={{
            margin: 0,
            marginRight: "20px",
          }}
        >
          <Typography
            style={{
              color: "black",
            }}
          >
            {mode === "REL" ? "0%" : getNiceDateTime(start)}
          </Typography>
        </Box>

        <Slider
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          aria-labelledby="continuous-slider"
          style={{ flex: "2", marginRight: "20px" }}
          min={min}
          max={max}
          step={1}
          getAriaValueText={
            mode == "REL" ? calculatePercantage : calculateNewDate
          }
          valueLabelFormat={
            mode == "REL" ? calculatePercantage : calculateNewDate
          }
          valueLabelDisplay="auto"
        />
        <Box
          style={{
            margin: 0,
            marginRight: "20px",
          }}
        >
          <Typography
            style={{
              color: "black",
            }}
          >
            {mode === "REL" ? "100%" : getNiceDateTime(end)}
          </Typography>
        </Box>
        <div>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="text alignment"
          >
            <ToggleButton value="ABS" aria-label="absolute">
              ABS
            </ToggleButton>
            <ToggleButton value="REL" aria-label="relative">
              REL
            </ToggleButton>
          </ToggleButtonGroup>
          {/* <IconButton onClick={handleDecrease}>
          <AddIcon />
        </IconButton>
        <Typography>fun</Typography>
        <IconButton onClick={handleIncrease}>
          <RemoveIcon />
        </IconButton> */}
        </div>
      </Box>
    </Drawer>
  );
};

export default DateSlider;
