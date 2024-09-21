import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import RotatedMarker from "./RotatedMarker";
import { Plane } from "../../Icons/Icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Mapkpitz.css";
import { Label } from "@mui/icons-material";
import React from "react";
import config from "../../config.js";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import { gql, useQuery } from "@apollo/client";

type direction = 1 | -1;

function KeepLocation({ zoomRef, centerRef }) {
  const eve = useMapEvents({
    moveend: () => {
      zoomRef.current = eve.getZoom();
      centerRef.current = eve.getCenter();
    },
  });
}

const Mapkpitz = ({
  mapData,
  showHeatMap,
  heatMapData,
  showMarkerMap,
  markerMapData,
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [lat, setLat] = useState(31.58304248898149);
  const [long, setLong] = useState(34.87970835035038);
  const zoomRef = useRef(7);
  const centerRef = useRef([31.5, 34.75]);

  // Modify the icon size to make it bigger
  const uavIcon = new L.Icon({
    iconUrl: "/uav.png", // assuming Plane is the path to your icon image
    iconSize: [60, 60], // adjust the size as needed
    iconAnchor: [30, 30], // center the icon on the marker's position
  });

  const markerIcon = new L.Icon({
    iconUrl: "/location_pin.png", // assuming Plane is the path to your icon image
    iconSize: [60, 60], // adjust the size as needed
    iconAnchor: [30, 30], // center the icon on the marker's position
  });

  const heatmapOptions = {
    radius: 20,
    blur: 20,
    maxZoom: 18,
  };
  return (
    <>
      <MapContainer
        center={centerRef.current}
        zoom={zoomRef.current}
        key={1}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100vh", width: "100vw", zIndex: 0 }}
      >
        <TileLayer url={config.mapServerUrl} />
        <KeepLocation zoomRef={zoomRef} centerRef={centerRef} />

        {/* <RotatedMarker
          key={Math.random()}
          position={[
            mapData[1].tele_pp_lat * (180 / Math.PI),
            mapData[1].tele_pp_long * (180 / Math.PI),
          ]}
          icon={customIcon} // Use the custom icon
          rotationAngle={mapData[1].tele_heading}
          rotationOrigin="center"
        >
          <Popup>
            Tail Number: {1}, LAT: {mapData[1].tele_pp_lat}, LONG:{" "}
            {mapData[1].tele_pp_long}
          </Popup>
        </RotatedMarker> */}

        {Object.keys(mapData).map((key) => (
          <RotatedMarker
            key={key}
            position={[
              mapData[key].tele_pp_lat * (180 / Math.PI),
              mapData[key].tele_pp_long * (180 / Math.PI),
            ]}
            icon={uavIcon} // Use the custom icon
            rotationAngle={mapData[key].tele_heading}
            rotationOrigin="center"
          >
            <Popup>
              fid: {key} | altitude: {mapData[key].tele_altitude}ft
            </Popup>
          </RotatedMarker>
        ))}
        {showHeatMap && (
          <HeatmapLayer
            points={heatMapData}
            longitudeExtractor={(point) => (point[1] * 180.0) / Math.PI}
            latitudeExtractor={(point) => (point[0] * 180.0) / Math.PI}
            key={Math.random() + Math.random()} //nizan: why is this needed?, erez: its not needed.
            intensityExtractor={(point) => point[2]}
            {...heatmapOptions}
          />
        )}
        {showMarkerMap &&
          markerMapData.map((type, idx) => {
            const markerIcon = new L.Icon({
              iconUrl: `/location_pins/location-pin(${(idx * 4) % 17}).png`, // assuming Plane is the path to your icon image
              iconSize: [60, 60], // adjust the size as needed
              iconAnchor: [30, 30], // center the icon on the marker's position
            });
            return type.map((point) => {
              return (
                <Marker
                  key={Math.random() + Math.random()}
                  position={[
                    point.lat * (180 / Math.PI),
                    point.lon * (180 / Math.PI),
                  ]}
                  icon={markerIcon} // Use the custom icon
                >
                  <Popup>{point.content}</Popup>
                </Marker>
              );
            });
          })}
      </MapContainer>
    </>
  );
};

export default Mapkpitz;
