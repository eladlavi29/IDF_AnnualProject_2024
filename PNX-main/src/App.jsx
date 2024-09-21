import * as React from "react";
import Mapkpitz from "./components/Mapkpitz/Mapkpitz";
import TopBar from "./components/TopBar";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import DateSlider from "./components/DateSlider.jsx";
import { Button } from "@mui/material";
import MultiFlightTable from "./components/MultiPlaneTable.jsx";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import {
  CalculateFlights,
  CalculateDateRange,
} from "./components/CalculateFlights.jsx";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

function App() {
  const [switch1, setSwitch1] = useState(false);
  const [barSpeed, setBarSpeed] = useState(1);
  // boolean to open and close the plane data table
  const [DBWindowOpen, setDBWindowOpen] = useState(false);
  const [insertedQueryJson, setInsertedQueryJson] = useState();
  // boolean to determine whether a heatmap should be shown
  const [showHeatMap, setShowHeatMap] = useState(true);

  // list of lists in the format [lat, long, strngth]. this is the data for the heatmap
  const [heatMapData, setHeatMapData] = useState([
    [(32 * Math.PI) / 180.0, (34.75 * Math.PI) / 180.0, 0],
  ]);
  // boolean to determine whether a markermap should be shown
  const [showMarkerMap, setShowMarkerMap] = useState(true);
  // list of all possible params, in the future will come from GQL
  const allParams = [
    "time",
    "tele_pp_lat",
    "tele_pp_long",
    "tele_altitude",
    "tele_fuel_kilo",
    "ecu_fuel_press",
    "tele_fuel_cnspt",
    "eng_throt_cmd",
    "tele_rpm",
    "air_temp",
    "tele_eng_air_temp",
    "ecu_air_temp_0",
    "ecu_water_temp_0",
    "ecu_air_temp_1",
    "ecu_water_temp_1",
    "eng_ref_temp_filter",
    "tele_ap_pitch",
    "tele_heading",
    "tele_ap_roll",
    "cas_knots",
    "lights_stat",
    "tele_roc",
  ];
  // list of lists in the format [lat, long, strngth]. this is the data for the heatmap
  // const [queriesDict, setQueriesDict] = useState({"Marker Map":{}, "Heat Map":{}, "Plane":{"unique":({1: [new Date("2024-01-14T23:40:06"), new Date("2024-01-15T00:40:01")], 2: [new Date("2024-01-17T09:07:51"), new Date("2024-01-17T09:25:44")]})   }})
  const [queriesDict, setQueriesDict] = useState({"Marker Map":{}, "Heat Map":{}, "Plane":{}})
  const [markerMapData, setMarkerMapData] = useState([])
  const [query_num, setQuery_num] = useState(0)
  const [tableSize, setTableSize] = useState("25%")
  
    // [
    //   [
    //       {"lat": 0.57, "lon": 0.618, "content": "temperature: 25, humidity: 40"},
    //       {"lat": 0.56, "lon": 0.619, "content": "temperature: 28, humidity: 35"}
    //   ],
    //   [
    //       {"lat": 0.54, "lon": 0.6122, "content": "altitude: 500, pressure: 1010"},
    //       {"lat": 0.57, "lon": 0.61, "content": "altitude: 550, pressure: 1005"},
    //       {"lat": 0.51, "lon": 0.614, "content": "altitude: 480, pressure: 1015"}
    //   ],
    //   [
    //       {"lat": 0.59, "lon": 0.612, "content": "wind_speed: 15, wind_direction: 120"},
    //       {"lat": 0.58, "lon": 0.6111, "content": "wind_speed: 10, wind_direction: 90"},
    //       {"lat": 0.575, "lon": 0.613, "content": "wind_speed: 20, wind_direction: 150"}
    //   ],
    //   [
    //       {"lat": 0.568, "lon": 0.611, "content": "battery_level: 80, power_consumption: 30"},
    //       {"lat": 0.577, "lon": 0.615, "content": "battery_level: 90, power_consumption: 25"},
    //       {"lat": 0.57, "lon": 0.61, "content": "battery_level: 75, power_consumption: 35"}
    //   ],
    //   [
    //       {"lat": 0.54, "lon": 0.60, "content": "health_status: normal, heart_rate: 80"},
    //       {"lat": 0.55, "lon": 0.604, "content": "health_status: alert, heart_rate: 95"}
    //   ],
    //   [
    //       {"lat": 0.57, "lon": 0.62, "content": "population: 1000, pollution_level: low"},
    //       {"lat": 0.56, "lon": 0.61, "content": "population: 1000, pollution_level: low"}
    //   ],
    //   [
    //       {"lat": 0.555, "lon": 0.617, "content": "precipitation: 5, cloud_coverage: 20"},
    //       {"lat": 0.552, "lon": 0.618, "content": "precipitation: 10, cloud_coverage: 15"}
    //   ],
    //   [
    //       {"lat": 0.563, "lon": 0.614, "content": "soil_moisture: 30, soil_temperature: 18"},
    //       {"lat": 0.565, "lon": 0.615, "content": "soil_moisture: 25, soil_temperature: 20"}
    //   ],
    //   [
    //       {"lat": 0.558, "lon": 0.612, "content": "air_quality: good, pollutant_levels: low"},
    //       {"lat": 0.559, "lon": 0.611, "content": "air_quality: moderate, pollutant_levels: moderate"}
    //   ],
    //   [
    //       {"lat": 0.566, "lon": 0.616, "content": "traffic_flow: smooth, congestion_level: low"},
    //       {"lat": 0.564, "lon": 0.615, "content": "traffic_flow: congested, congestion_level: high"}
    //   ],
    //   [
    //       {"lat": 0.573, "lon": 0.619, "content": "crop_status: healthy, growth_stage: flowering"},
    //       {"lat": 0.571, "lon": 0.618, "content": "crop_status: stressed, growth_stage: maturing"}
    //   ],
    //   [
    //       {"lat": 0.552, "lon": 0.614, "content": "solar_radiation: 600, UV_index: 8"},
    //       {"lat": 0.554, "lon": 0.615, "content": "solar_radiation: 550, UV_index: 7"}
    //   ],
    //   [
    //       {"lat": 0.561, "lon": 0.616, "content": "fire_hazard: low, fire_weather_index: 2"},
    //       {"lat": 0.564, "lon": 0.618, "content": "fire_hazard: moderate, fire_weather_index: 3"}
    //   ],
    //   [
    //       {"lat": 0.573, "lon": 0.611, "content": "ocean_temperature: 22, salinity: 35"},
    //       {"lat": 0.575, "lon": 0.613, "content": "ocean_temperature: 20, salinity: 33"}
    //   ],
    //   [
    //       {"lat": 0.565, "lon": 0.616, "content": "wildlife_population: abundant, species_diversity: high"},
    //       {"lat": 0.562, "lon": 0.617, "content": "wildlife_population: scarce, species_diversity: low"}
    //   ],
    //   [
    //       {"lat": 0.558, "lon": 0.61, "content": "moon_phase: waxing_gibbous, illumination: 75"},
    //       {"lat": 0.556, "lon": 0.609, "content": "moon_phase: waning_crescent, illumination: 40"}
    //   ],
    //   [
    //       {"lat": 0.559, "lon": 0.616, "content": "geological_activity: stable, seismic_intensity: low"},
    //       {"lat": 0.557, "lon": 0.615, "content": "geological_activity: active, seismic_intensity: moderate"}
    //   ],
    //   [
    //       {"lat": 0.564, "lon": 0.611, "content": "construction_activity: ongoing, noise_level: moderate"},
    //       {"lat": 0.567, "lon": 0.612, "content": "construction_activity: paused, noise_level: low"}
    //   ],
    //   [
    //       {"lat": 0.57, "lon": 0.618, "content": "event_attendance: 500, event_type: concert"},
    //       {"lat": 0.569, "lon": 0.617, "content": "event_attendance: 1000, event_type: conference"}
    //   ],
    //   [
    //       {"lat": 0.555, "lon": 0.613, "content": "sport_score: team_a 3, team_b 2"},
    //       {"lat": 0.556, "lon": 0.614, "content": "sport_score: team_a 4, team_b 1"}
    //   ]
    // ]);
  
  // list of names of params to display
  const [displayParams, setDisplayParams] = useState([]); //['tele_rpm', 'tele_altitude', 'tele_fuel_kilo', 'packet', 'tele_pp_lat', 'tele_pp_long', 'tele_heading'])
  // mode of the playbar
  const [mode, setMode] = useState("ABS");
  // fids and dates of flights to display
  const [flights, setFlights] = useState({})//useState({1: [new Date("2024-01-14T23:40:06"), new Date("2024-01-15T00:40:01")], 2: [new Date("2024-01-17T09:07:51"), new Date("2024-01-17T09:25:44")]})
  // position of playbar (circle thing in the playbar), time selected by playbar
  const [position, setPosition] = useState(0);
  // start and end date (in seconds) of all flights combined
  const [dateRange, setDateRange] = useState([
    new Date("2023-02-11T11:23:00"),
    new Date("2023-02-12T19:43:00"),
  ]);
  // dictionary with plane data for the map
  const [mapData, setMapData] = useState({});
  // const [mapData, setMapData] = useState({
  //   1: {
  //     "tele_pp_lat": 0.55320939623658449857,
  //     "tele_pp_long": 0.60976575284746381467,
  //     "tele_heading": 25
  //   },
  //   2: {
  //     "tele_pp_lat": 0.55120939623658449857,
  //     "tele_pp_long": 0.60876575284746381467,
  //     "tele_heading": 69
  //   }
  // });
  useEffect(() => {CalculateFlights(flights, position, mode, setMapData, client, displayParams, dateRange)}, [flights, position, mode])
  useEffect(() => {CalculateDateRange(flights, setDateRange)}, [flights])

  const updateSwitch1 = (event) => {
    setSwitch1(event.target.checked);
  };

  const memoMap = useMemo(
    () => (
      <Mapkpitz
        mapData={mapData}
        showHeatMap={showHeatMap}
        heatMapData={heatMapData}
        showMarkerMap={showMarkerMap}
        markerMapData={markerMapData}
      />
    ),
    [showHeatMap, heatMapData, mapData, markerMapData, showMarkerMap]
  );

  return (
    <>
      <TopBar
        insertedQueryJson={setInsertedQueryJson}
        switch1={switch1}
        updateSwitch1={updateSwitch1}
        barSpeed={barSpeed}
        updateBarSpeed={setBarSpeed}
        setDBWindowOpen={setDBWindowOpen}
        DBWindowOpen={DBWindowOpen}
        setShowHeatMap={setShowHeatMap}
        setShowMarkerMap={setShowMarkerMap}
        allParams={allParams}
        params={displayParams}
        setParams={setDisplayParams}
        setFlights={setFlights}
        setMarkerMapData={setMarkerMapData}
        setHeatMapData={setHeatMapData}
        QueriesDict={queriesDict}
        setQueriesDict={setQueriesDict}
        query_num={query_num}
        setQuery_num={setQuery_num}
        tableWindowSize={tableSize}
        setTableWindowSize={setTableSize}
      />
      <ApolloProvider client={client}>
        {memoMap}

        <MultiFlightTable
          params={displayParams}
          flights={flights}
          position={position}
          mode={mode}
          show={DBWindowOpen}
          mapData={mapData}
          size={tableSize}
        />
      </ApolloProvider>
      <DateSlider
        value={position}
        setValue={setPosition}
        start={dateRange[0]}
        end={dateRange[1]}
        mode={mode}
        setMode={setMode}
        show={DBWindowOpen}
        speed={barSpeed}
      />
    </>
  );
}

export default App;
