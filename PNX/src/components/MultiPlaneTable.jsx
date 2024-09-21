import React from "react";
import { useMemo } from "react";
import { Box, Drawer, Stack, Button, Table } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { gql, useQuery } from "@apollo/client";

//import {Table, Sheet} from "@mui/joy"
const getCellStyle = (params) => {
  return {
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
  };
};

function MultiPlaneTable({
  flights,
  params,
  position,
  mode,
  show,
  mapData,
  size,
}) {
  //const [flight_query, set_flight_query] = useQuery(gql``)
  // +
  //console.log(`query{flight(fid: 1){row(packet: ${position}){params(names: [${params.map((param) => {return "\""+param+"\""})}]){name value}}}}`)
  const columns = [
    { field: "fid", headerName: "FID", minWidth: 60, flex: 1 },
  ].concat(
    params.map((param) => {
      return {
        field: param,
        headerName: param.toUpperCase(),
        minWidth: 90,
        flex: 1,
      };
    })
  );
  const rows = Object.keys(flights).map((fid) => {
    const dict = { id: fid, fid: fid }; //mapData.fid;
    Object.assign(dict, mapData[fid]);
    return dict;
  });
  // {
  //     const {error, loading, data} = useQuery(gql`query{flight(fid: ${fid}){row(packet: ${98}){params(names: [${params.map((param) => {return "\""+param+"\""})}]){name value}}}}`);
  //     const dict = {'id': fid, 'fid': fid};
  //     if (!loading && !error) {
  //         //console.log(loading)
  //         //console.log(error)
  //         //console.log(data)
  //         for (const param of data['flight']['row']['params']) {
  //             dict[param['name']] = param['value'];
  //         }
  //     }
  //     return dict;
  // });
  return (
    <Drawer
      sx={{
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          boxSizing: "border-box",
          top: "15vh",
          right: "1vw",
          height: "70vh",
          width: size,
          borderRadius: "10px",
        },
      }}
      anchor="right"
      variant="persistent"
      open={show}
      style={{ zIndex: 3 }}
    >
      <div style={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooterPagination={true}
          sx={{ borderRadius: "10px" }}
          style={{ fontSize: "12px" }}
        />
      </div>
    </Drawer>
  );
}
export default MultiPlaneTable;
