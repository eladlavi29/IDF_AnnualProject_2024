import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {MongoClient} from "mongodb";

import { typeDefs } from "./schema.js";
import { postgresDataSource, mongodbDataSource } from "./typeorm.config.js";


// resolvers
const resolvers = {
  Query: {
    async get_flights(_, args){
      const res = await runQuery(`
        SELECT md.fid as fid, md.recording_start as start, md.recording_end as end
        FROM (${args.query}) q JOIN metadata md on q.fid = md.fid 
      `);
      //const res.map(dict =>)
      // console.log(res);
      return res
    },
    async heat_map(_, args) {
      return await runQuery(args.query);
    },
    async marker_map(_, args) {
      return await runQuery(args.query);
    },
    async flight(_, args) {
      const res = await runQuery(
        `SELECT fid FROM flight_to_fid WHERE fid = ${args.fid}`
      );
      return res[0]
    },
    async row(_, args) {
      return await runQuery(
        `SELECT fid, packet, time FROM slow_params WHERE fid = ${args.fid} AND packet = ${args.packet} 
          UNION SELECT fid, packet, time AS time FROM fast_params WHERE fid = ${args.fid} AND packet = ${args.packet}`
      );
    },
    async param(_, args) {
      return await runQuery(
        `SELECT fid, packet, '${args.name}' AS name, ${args.name} AS value FROM slow_params WHERE ${args.name} = ${args.value} 
        UNION SELECT fid, packet, '${args.name}' AS name, ${args.name} AS value FROM fast_params WHERE ${args.name} = ${args.value}`
      );
    },
    async insert_query(_, args){
      await mongo_conn.db('queries').collection('queries').insertOne(args)
      const q = await mongo_conn.db('queries').collection('queries').findOne({'name': 'test1'})
      return q
    },
    async get_queries(_, args){
      const queries = await mongo_conn.db('queries').collection('queries').find().toArray()
      // console.log(queries)
      return queries
    },

  },
  Flight: {
    async row(parent, args){
      const res = await runQuery(
          `SELECT fid, packet, Time as time 
            FROM fast_params 
            WHERE fid = ${parent.fid} AND packet = ${args.packet}`);
      return res[0];
    },
    async row_by_time(parent, args){
      const res = await runQuery(`
            SELECT dt.fid, dt.packet, time 
            FROM datetime dt JOIN slow_params sp ON dt.fid = sp.fid AND dt.packet = sp.packet 
            WHERE dt.fid = ${parent.fid} AND dt.israel_datetime BETWEEN timestamp '${args.time}' - INTERVAL '1 second' AND timestamp '${args.time}'
            ORDER BY dt.packet DESC
            LIMIT 1`);
      return res[0];
    },
    async heatmap_from_rows(parent, args) {
      const res = await runQuery(`
            SELECT tele_pp_lat as lat, tele_pp_long as lon, (${args.param} - ${args.thresh}) / ${args.norm ? args.norm : 1} as strength
            FROM slow_params sp JOIN fast_params fp ON sp.fid = fp.fid AND sp.fid = ${parent.fid} AND sp.packet = fp.packet  
            WHERE ${args.param} ${args.op} ${args.thresh} AND MOD(sp.packet, 1000) = 8
            `);
      // console.log(res)
      return res;
    },
  },
  Row: {
    async flight(parent) {
      return await runQuery(
        `SELECT fid FROM flight_to_fid WHERE fid = ${parent.fid}`
      );
    },
    async param(parent, args){
      const res = await runQuery(
          `SELECT '${args.name}' as name, ${args.name} as value FROM slow_params WHERE fid = ${parent.fid} AND packet = ${parent.packet}
             UNION SELECT '${args.name}' as name, ${args.name} as value FROM fast_params WHERE fid = ${parent.fid} AND packet = ${parent.packet}`
      );
      return res[0];
    },
    async params(parent, args){
      // console.log(fast_cols)
      const names = new Set(args.names)
      const fast_names = args.names.filter((name) => fast_cols.has(name))
      const slow_names = args.names.filter((name) => slow_cols.has(name))

      const res = await runQuery(
        `SELECT *
            FROM (SELECT ${fast_names.join(", ")}
                  FROM fast_params
                  WHERE fid = ${parent.fid}
                    and packet = ${parent.packet}
                  ) f
            LEFT JOIN
              (SELECT ${slow_names.join(", ")}
              FROM slow_params
              WHERE fid = ${parent.fid} and packet = ${parent.packet}
              ) s
            ON TRUE`
      );
      let merged = {}
      res.forEach((dict) => merged = {...merged, ...dict})
      const pred = []
      for (const key in merged) {
        if (merged[key]){
          pred.push({'name': key, 'value': merged[key]})
        }
      }
      return pred;
    },
  },
  Param: {
    async row(parent) {
      const res = await runQuery(
        `SELECT fid, packet, Time AS time FROM slow_params WHERE fid = ${parent.fid} AND packet = ${parent.packet} 
          UNION SELECT fid, packet, Time AS time FROM fast_params WHERE fid = ${parent.fid} AND packet = ${parent.packet}`
      );
      return res[0];
    },
  },

};

const sql_conn = await postgresDataSource.initialize();
const mongo_conn = new MongoClient("mongodb://localhost:27017")
mongo_conn.connect()


//await mongodbDataSource.initialize();




const server = new ApolloServer({
  typeDefs,
  resolvers,
});
const fast_cols = await getCols('fast_params')
const slow_cols = await getCols('slow_params')

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);

async function getCols(table){
  const ret = await runQuery(`select column_name from information_schema.columns where table_name = '${table}'`)
  let params = new Set()
  ret.forEach((param) => params.add(param.column_name))
  return params
}
async function runQuery(s) {
  try {
    const result = await sql_conn.query(s);
    return result;
  } catch (error) {
    console.log(error)
    return "Error fetching data.";
  }
}

async function runMongo(s) {
  try {
    const result = await mongo_conn.find(s);
    return result;
  } catch (error) {
    console.log(error)
    return "Error fetching data.";
  }
}
// Call the function to fetch and log the data

//const data = await runQuery("SELECT * FROM locs");

//console.log(data);
