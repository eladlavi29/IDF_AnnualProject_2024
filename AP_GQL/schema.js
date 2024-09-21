export const typeDefs = `#graphql
  type Flight {
    fid: ID!
    start: Float
    end: Float
    rows: [Row!]!
    row(packet: Int!): Row
    row_by_time(time: String!): Row
    heatmap_from_rows(param: String!, thresh: Float!, op: String!, norm: Float): [HeatMapPoint!]!
  }
  type Row {
    fid: Int!
    flight: Flight!
    packet: Int!
    time: Float! 
    param(name: String!): Param
    params(names: [String!]!): [Param!] 
  }
  type Param {
    fid: Int!
    packet: Int!
    row: Row!
    name: String!
    value: Float!
  }
  
  type HeatMapPoint {
    lat: Float!
    lon: Float!
    strength: Float
  }
  
  type MarkerMapPoint {
    lat: Float!
    lon: Float!
    content: String
  }
  
  type QueryFile {
    name: String!
    template: String!
    type: String!
    params: [String!]!
    params_types: [String!]!
  }
  
  type Query {
    get_flights(query: String!): [Flight!]!
    heat_map(query: String!): [HeatMapPoint!]!
    marker_map(query: String!): [MarkerMapPoint!]!
    flight(fid: ID!): Flight
    param(name: String!, value: Float!): [Param!]
    row(fid: Int!, packet: Int!): Row
    insert_query(name: String!, template: String!, type: String!, params: [String!]!, params_types: [String!]!): QueryFile
    get_queries: [QueryFile!]!
  }
`;
