import React from 'react';
import {useMemo, useEffect, useState} from 'react'
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import {format} from 'date-fns';

export function CalculateDateRange(flights, setDateRange) {
    let minDate = null;
    let maxDate = null;
    for (let fid in flights) {
        //console.log(fid)
        //console.log(flights[fid])
        if (!minDate || flights[fid][0] < minDate) {
            minDate = flights[fid][0]
        }
        if (!maxDate || flights[fid][1] > maxDate) {
            maxDate = flights[fid][1]
        }
    }
    if (!minDate) {minDate = new Date(0)}
    if (!maxDate) {maxDate = new Date(0)}
    // console.log([minDate, maxDate])
    setDateRange([minDate, maxDate])
}

export async function CalculateFlights(flights, position, mode, setMapData, client, params, dateRange) {
    const must_params = ['tele_pp_long', 'tele_pp_lat', 'tele_heading', 'tele_altitude']
    let mod_params = [...params]
    must_params.forEach((param) => {
        if (mod_params.indexOf(param) == -1) {
            mod_params = [...mod_params, param]
        }    
    })
    // if (mod_params.indexOf('tele_pp_long') == -1) {
    //     mod_params = [...mod_params, 'tele_pp_long']
    // }
    // if (mod_params.indexOf('tele_pp_lat') == -1) {
    //     mod_params = [...mod_params, 'tele_pp_lat']
    // }
    // if (mod_params.indexOf('tele_heading') == -1) {
    //     mod_params = [...mod_params, 'tele_heading']
    // }
    
    switch (mode) {
        case 'REL': {
            // console.log(flights)
            let totalData = {}
            for (let fid in flights) {
                let start = flights[fid][0].getTime()
                let end = flights[fid][1].getTime()
                let time = new Date(start + (position / 100) * (end - start))
                // console.log(`position: ${position}, start: ${new Date(start)}, end: ${new Date(end)}, time: ${time}`)
                if (client) {
                    const {data, error} = await client.query({
                        query: gql`
                            query{
                                flight(fid: ${fid}) {
                                    row_by_time(time: "${format(time, 'yyyy-MM-dd HH:mm:ss')}") {
                                        params(names: [${mod_params.map(param => {return '"' + param + '"'})}]) {
                                            name
                                            value
                                        }
                                    }
                                }
                            }`
                        // query: gql`
                        //     query{
                        //         row_by_time(fid: ${fid}, time: "${format(time, 'yyyy-MM-dd HH:mm:ss')}") {
                        //             params(names: [${mod_params.map(param => {return '"' + param + '"'})}]) {
                        //                 name
                        //                 value
                        //             }
                        //         }
                        //     }`
                        })
                    if (error) {
                        console.log('Error fetching data:', error);
                        return;
                    }
                    let currData = {}
                    if (data && data['flight'] && data['flight']['row_by_time']) {
                        data['flight']['row_by_time']['params'].map(param => currData[param['name']] = param['value'])
                        totalData[fid] = currData
                    }
                }
            }
            if (Object.keys(totalData)) {
                setMapData(totalData)
            }
            break;
        }
        case 'ABS': {
            let totalData = {}
            if (dateRange[0] && dateRange[1]) {
                let time = new Date(position * 1000 + dateRange[0].getTime()) 
                for (let fid in flights) {
                    if (client) {
                        const {data, error} = await client.query({
                            query: gql`
                                query{
                                    flight(fid: ${fid}) {
                                        row_by_time(time: "${format(time, 'yyyy-MM-dd HH:mm:ss')}") {
                                            params(names: [${mod_params.map(param => {return '"' + param + '"'})}]) {
                                                name
                                                value
                                            } 
                                        }
                                    }
                                }`
                            // query: gql`
                            //     query{
                            //         row_by_time(fid: ${fid}, time: "${format(time, 'yyyy-MM-dd HH:mm:ss')}") {
                            //             params(names: [${mod_params.map(param => {return '"' + param + '"'})}]) {
                            //                 name
                            //                 value
                            //             }
                            //         }
                            //     }`
                            })
                        if (error) {
                            console.log('Error fetching data:', error);
                            return;
                        }
                        // console.log(data)
                        let currData = {}
                        if (data && data['flight'] && data['flight']['row_by_time']) {
                            data['flight']['row_by_time']['params'].map(param => currData[param['name']] = param['value'])
                            totalData[fid] = currData
                        }
                    }
                }
                setMapData(totalData)
            }
        }
    }
}
