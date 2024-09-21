import * as React from 'react';
import axios from 'axios';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';


const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache()
});

// import queries_dict from "./queries.json";
let queries_dict = {}
await client.query({query: gql`
  query{
    get_queries {
      name
      params
      params_types
      type
      template
    }
  }
`}).then((r) => {
  let queries = {}
  let types = {}//"Heat Map": [], "Marker Map": [], "Plane": []}
  r["data"]["get_queries"].forEach((q) => {
    queries[q["name"]] = q
    if (!(q["type"] in types)) {
      types[q["type"]] = []
    }
    types[q["type"]] = [...types[q["type"]], q["name"]]
  })
  queries_dict = {"queries": queries, "types": types}
  // console.log(queries_dict["types"])
  // console.log(Object.keys(queries_dict['types']))
  // // console.log(`qs are: ${JSON.stringify(queries_dict, null, 2)}`)
})


export function getTypeofQuery(q_name) {
  return ((queries_dict['queries'])[q_name])['type'];
}

export function getQueryTypes() {
  return Object.keys(queries_dict['types']);
}

export function getQueriesOfType(type) {
  return (queries_dict['types'])[type];
}

export function getInputParams(query_name){
  return ((queries_dict['queries'])[query_name])['params']
}

export function getInputParamsTypes(query_name){
  return ((queries_dict['queries'])[query_name])['params_types']
}

function queryNameToQueryTemplate(query_name, paramVals){  
  let template =  ((queries_dict['queries'])[query_name])['template']
  let paramNames = getInputParams(query_name)
  let res = replaceEmptyParamWithValue(paramNames, paramVals, template)

  console.log("XXXXXXXXXXXXXXXXXXXXXX")
  console.log("paramNames: ", paramNames)
  console.log("paramVals: ", paramVals)
  console.log("template: ", template)
  console.log("res: ", res)
  console.log("YYYYYYYYYYYYYYYYYYYYYY")
  
  return res
}

function replaceEmptyParamWithValue(paramNames, paramVals, template){
  for (let i = 0; i < paramNames.length; i++) {
    template = template.replaceAll('$' + paramNames[i] + '$', paramVals[i]);
  }

  return template;
}

export function getFinalQuery(jsonParams){
  let paramVals = getInputParams(jsonParams.query).map((param) => (
    jsonParams[param]
  ));

  console.log("paramVals: ", paramVals);
  
  return queryNameToQueryTemplate(jsonParams.query, paramVals);
}


export function deleteQuery(index, type, setDict, currDict, setData){
  console.log("deleteQuery")
  console.log("currDict: ", currDict)
  console.log("index: ", index)

  var copy = {...currDict};
  delete ((copy[type])[index]) 

  console.log("copy: ", copy)

  setDict(copy)

  switch(type){
    case 'Plane':
      var res_dict = {}
      for(var key in copy['Plane'])
      {
        var curr_dict = (copy['Plane'])[key]
        for(var inn_key in curr_dict)
        {
          res_dict[inn_key] = curr_dict[inn_key]
        }
      }
      setData(res_dict)
      return true
    

    case 'Marker Map':
      console.log("deleteQuery- MARKER MAP")
      let res1 = []

      for(var key in copy['Marker Map'])
      {
        res1 = res1.concat((copy['Marker Map'])[key])
      }
      console.log("res1: ", res1)
      setData(res1)
      console.log("res1: ", res1)
      return true
    
    
    case 'Heat Map':
      setData([])
      return true
  }
}


export function setShowall(setShowHeatMap, setShowMarkerMap, res){
  // console.log("SHOWALL- ", res)
  setShowHeatMap(res)
  setShowMarkerMap(res)
}


export function setAllData(setHeatMapData, setMarkerMapData, setFlights, QueriesDict){
  // let res = return_res_good_structure(QueriesDict, "Heat Map")
  // setHeatMapData(res)

  let res = return_res_good_structure(QueriesDict, "Marker Map")
  setMarkerMapData(res)

  res = return_res_good_structure(QueriesDict, "Plane")
  setFlights(res)
}


export function return_res_good_structure(copy, query_type){
  switch(query_type){
    case 'Plane':

      var res_dict = {}
      for(var key in copy['Plane'])
      {
        var curr_dict = (copy['Plane'])[key]
        for(var inn_key in curr_dict)
        {
          res_dict[inn_key] = curr_dict[inn_key]
        }
      }

      return res_dict

    case 'Marker Map':
      let res1 = []

      for(var key in copy['Marker Map'])
      {
        res1 = res1.concat((copy['Marker Map'])[key])
      }

      return res1
      
  }

  return null
}



function fix_data_structure(data, query_type, setDict, currDict, query_num, setQuery_num){
  switch(query_type){
    case 'Heat Map':
      if (data && data['flight'] && data['flight']['heatmap_from_rows']) {
        let res = data['flight']['heatmap_from_rows'].map((dict) => (
          ([dict["lat"],dict["lon"],dict["strength"]]))
        );
        return res;
      }
      setQuery_num(query_num+1)
      let res =  (data["heat_map"]).map((dict) => (
        ([dict["lat"],dict["lon"],dict["strength"]])
      ));
      return res;

    case 'Plane':
      let dict = (data["get_flights"])[0]
      // console.log(`dict is ${dict["fid"]}`)
      let d_start = new Date(dict['start']);
      // console.log("actual date: ", new Date(dict["start"]))
      // d_start.setSeconds(d_start.getSeconds() + Math.floor(dict["start"]/1000));
      
      let d_end = new Date(dict['end']);
      // d_end.setSeconds(d_end.getSeconds() + Math.floor(dict["end"]/1000));
      let fid_1 = dict["fid"]

      let dict_list = (data["get_flights"])

      console.log("dict_list: ", dict_list)
      var obj={}
      for (let i = 0; i < dict_list.length; i++) {
        let dict = dict_list[i]
        console.log("dict: ", dict)
        let d_start = new Date(dict['start']);
        let d_end = new Date(dict['end']);
        let fid_1 = dict["fid"]
      
        obj[fid_1] = [d_start,d_end];
      }

      var tag = query_num
      setQuery_num(query_num+1)

      console.log("tag: ", tag)

      var copy = {...currDict};
      (copy['Plane'])[tag] = obj // a dict that represents the query
      setDict(copy)

      console.log("copy: ", copy)

      var res_dict = {}
      for(var key in copy['Plane'])
      {
        var curr_dict = (copy['Plane'])[key]
        for(var inn_key in curr_dict)
        {
          res_dict[inn_key] = curr_dict[inn_key]
        }
      }

      console.log("res_dict: ", res_dict)

      return res_dict

    case 'Marker Map':
      var curr_list = [(data["marker_map"])]
      var tag = query_num
      setQuery_num(query_num+1)

      console.log("tag: ", tag)

      var copy = {...currDict};
      (copy['Marker Map'])[tag] = curr_list
      setDict(copy)

      console.log("copy: ", copy)

      let res1 = []

      for(var key in copy['Marker Map'])
      {
        res1 = res1.concat((copy['Marker Map'])[key])
      }

      console.log("res1: ", res1)

      return res1
      
  }

  return null
}


export async function exeQuery(query, query_type, setData, setDict, currDict, query_num, setQuery_num){
  const {data, error} = await client.query({
    query: gql(query)
  })
  if (error) {
      console.error('Error executing query: ', error);
      return;
  }

  console.log("DATA: ", data)

  let res = fix_data_structure(data, query_type, setDict, currDict, query_num, setQuery_num)
  
  console.log("RES: ", res)

  if(setData!=null){
    setData(res)
  }

  return true
}

