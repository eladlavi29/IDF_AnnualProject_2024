
import json

"""
The structure of the queries.json file is:
it is a dictionary with 2 keys: total_dict = {'queries':dict_queries, 'types': dict_types}

dict_queries is a dictionary itself, its keys are specific queries names, and value is a dictionary with info about
the specific query, such as: type, params, params_types, template. 
example: 
dict_queries['RPM_FOR_FID'] = {'type':'Heat Map', 'params':['fid'], 'params_types':['Number'], 'template': '''query{
        heat_map(query: "select tele_pp_lat as lat,tele_pp_long as lon,tele_rpm as strength from fast_params where fid=$fid$ and tele_pp_lat!=0 and tele_pp_long!=0") {lat lon strength}
    }'''}

As you can see, params_types is a list in the same length as params, and in each index there is the type
(as string) of the param in the same index in params
template has the substring $<param_name>$ for each param, where <param_name> is the name of the param, for example fid.
you can have multiple $<param_name>$ for the same param_name, they are all replaced with the param value.

types is a dictionary itself, keys are types of queires, and values are a list of the queires names of this type.
example:
'Heat Map': ['RPM_FOR_FID']
(used for more efficiency)

param types:
{
    Number for int type
    Region for region type
    String for string type
    Date for date type
    Time for time type
}
"""

def create_json_queries():
    # ['RPM_FOR_FID', 'START_END_FOR_FID', 'Plane_1']

    dict_queries = {}

    dict_queries['RPM_FOR_FID'] = {'type':'Heat Map', 'params':['fid'], 'params_types':['Number'], 'template': '''query{
        heat_map(query: "select tele_pp_lat as lat,tele_pp_long as lon,tele_rpm as strength from fast_params where fid=$fid$ and tele_pp_lat!=0 and tele_pp_long!=0") {lat lon strength}
    }'''}
    dict_queries['RPM_THRESH_FID'] = {'type':'Heat Map', 'params':['fid', 'thresh', 'param', 'op', 'norm'], 'params_types':['Number', 'Number', 'String', 'String', 'Number'], 'template': '''
                                    query{
  flight(fid: $fid$) {
    heatmap_from_rows(param: "$param$", thresh: $thresh$, op: "$op$", norm: $norm$) {
      lat
      lon
      strength
    }
  } 
}
                                      '''}
    dict_queries['GET_FLIGHT'] = {'type':'Plane', 'params':['fid'], 'params_types':['Number'], 'template': '''query{
        get_flights(query: "select fid, recording_start as start, recording_end as end from metadata where fid=$fid$") {fid start end}
    }'''}
    dict_queries['START_END_FOR_FID'] = {'type':'Marker Map', 'params':['fid'], 'params_types':['Number'], 'template': '''query{
        marker_map(query: "(select slow_params.tele_pp_lat as lat,slow_params.tele_pp_long as lon,'start: fid=$fid$' as content from slow_params where slow_params.fid = $fid$ and slow_params.tele_pp_lat!=0 and slow_params.tele_pp_long!=0 order by packet asc limit 1) UNION ALL (select slow_params.tele_pp_lat as lat,slow_params.tele_pp_long as lon,'start: fid=$fid$' as content from slow_params where slow_params.fid = $fid$ and slow_params.tele_pp_lat!=0 and slow_params.tele_pp_long!=0 order by packet desc limit 1)") {
        lat lon content}
        }'''}

    # dict_queries['STAM'] = {'type':'Marker Map', 'params':['fid', 'number', 'string', 'region', 'dateFrom', 'dateTo', 'timeFrom', 'timeTo'], 'params_types':['Number', 'Number', 'String', 'Region', 'Date', 'Date', 'Time', 'Time'], 'template': '''query{
    #     fid: $fid$, number: $number$, string: $string$, region: $region, dateFrom: $dateFrom$, dateTo: $dateTo$, timeFrom: $timeFrom$, timeTo: $timeTo$
    #     }'''}
    
    dict_types = {'Heat Map': ['RPM_FOR_FID', 'RPM_THRESH_FID'], 'Marker Map':['START_END_FOR_FID'] , 'Plane':['GET_FLIGHT'] }
    
    total_dict = {'queries':dict_queries, 'types': dict_types}
    # print(total_dict['queries']['RPM_THRESH_FID'])
    # print(total_dict['types']['Heat Map'])
    with open("queries.json", "w") as f:
        json.dump(total_dict, f)

    
create_json_queries()