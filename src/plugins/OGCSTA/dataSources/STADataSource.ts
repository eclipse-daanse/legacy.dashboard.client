/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors: Smart City Jena

*/

import {
    Configuration,
    type Datastream, DatastreamsApi, LocationsApi,
    type Observation, ObservationsApi, type Location,
    type Thing, type Things, ThingsApi
} from "@/plugins/OGCSTA/dataSources/STAClient";
import DataSource from "@/dataSources/DataSource";
import {AxiosError} from "axios";

export interface IOGCSTAOptions {
    things?: {
        all?: boolean,
        ids?: Array<string>,
        filter?: any
    },
    datastreams?: {
        all?: boolean,
        ids?: Array<string>,
        filter?: any
    },
    observations?: {
        all?: boolean,
        ids?: Array<string>,
        filter?: any
    },
    locations?: {
        all?: boolean,
        ids?: Array<string>,
        filter?: any
    }

}

export interface IOGCSTA {
    things?: Thing[],
    datastreams?: Datastream[],
    observations?: (Observation&{ds_source?:string})[],
    locations?: Location[]
}

export default class STADataSource extends DataSource implements IDatasource, ISerializable {

    public static readonly TYPE = "OGCSTA";
    public readonly type = STADataSource.TYPE;
    public url: string;
    public id: string;
    public caption: string;
    private baseConfigration: Configuration;

    constructor(id, url, caption, eventBus) {
        super();
        console.log(url)
        this.id = id;
        this.url = url;
        this.caption = caption;
        this.baseConfigration = new Configuration({basePath: this.url});
    }

    static transformFromThingLocationDastreamToLocationThingDatastream(things: Thing[]):IOGCSTA {
        const ret:IOGCSTA={locations:[],things:things,datastreams:[]}
        const locations: Location[] = [];
        let datastreams: Datastream[] = [];
        for (let thing of things ?? []) {
            if(thing.Datastreams){
                datastreams = [...datastreams,...thing.Datastreams];
                for (const datastream of thing.Datastreams ?? []) {
                    datastream.Thing = thing;
                }
            }
            for (const location of thing.Locations ?? []) {
                if (!location.Things) {
                    location.Things = [];
                }
                let isAlreadyinLocation = locations.find((l: Location) => l["@iot.id"] === location["@iot.id"]);
                if (isAlreadyinLocation) {
                    const allredyexistingThing = isAlreadyinLocation.Things ?? [].find((t: Thing) => t['@iot.id'] == thing["@iot.id"]);
                    if (!allredyexistingThing) {
                        if (!isAlreadyinLocation.Things) {
                            isAlreadyinLocation.Things = [];
                        }
                        isAlreadyinLocation.Things.push(thing);
                    }
                } else {
                    location.Things.push(thing);
                    locations.push(location);

                }
            }
        }
        ret.datastreams = datastreams;
        ret.locations = locations;
        return ret;
    }

    async getData(options: IOGCSTAOptions) {

        let listOfPromesis: Promise<IOGCSTA>[] = [];

        if (options && typeof options == 'object') {
            if ('things' in options) {
                if ('all' in options.things!) {
                    listOfPromesis.push((async ()=>{
                        try {
                            this.baseConfigration;
                            let data = (await new ThingsApi(this.baseConfigration).v11ThingsGet()).data.value!;
                            return {things: data};
                        } catch(e) {
                            throw e;
                        }
                    })());
                } else if ('ids' in options.things!) {
                    for (let id in options.things!.ids) {
                        listOfPromesis.push((async () => {
                            try {
                                const thing = (await new ThingsApi(this.baseConfigration).v11ThingsEntityIdGet(id)).data;
                                return {things:[thing]};
                            } catch (e) {
                                throw(e);
                            }
                        })());
                    }
                }
            }
            if ('datastreams' in options) {
                if ('all' in options.datastreams!) {
                    listOfPromesis.push((async () => {
                        try {
                            const data = (await new DatastreamsApi(this.baseConfigration).v11DatastreamsGet()).data.value!
                            return {datastreams: data};
                        } catch (e) {
                            throw(e);
                        }
                    })());
                } else if ('ids' in options.datastreams!) {
                    for (let id of options.datastreams!.ids!) {
                        listOfPromesis.push((async () => {
                            try {
                                const data = (await new DatastreamsApi(this.baseConfigration).v11DatastreamsEntityIdObservationsGet(id, undefined, 1)).data.value!;
                                return {observations: data};

                            } catch (e) {
                                throw(e);
                            }
                        })());
                    }
                }
            }
            if ('observations' in options) {
                if ('all' in options.observations!) {
                    listOfPromesis.push((async () => {
                        try {
                            const data = (await new ObservationsApi(this.baseConfigration).v11ObservationsGet()).data.value;
                            return {observations: data};
                        } catch (e) {
                            throw(e);
                        }
                    })());
                } else if ('ids' in options.observations!) {
                    for (let id of options.observations.ids!) {
                        listOfPromesis.push((async () => {
                            try {
                                let data = (await new DatastreamsApi(this.baseConfigration).v11DatastreamsEntityIdObservationsGet(id,undefined, 1)).data.value;
                                if(data?.[0]){
                                    data[0]['ds_source']=id;
                                }
                                return {observations:data};
                            } catch (e) {
                                throw(e);
                            }
                        })());
                    }
                }
            }
        } else {
            listOfPromesis.push((async () => {
                try {
                    const things = (await new ThingsApi(this.baseConfigration).v11ThingsGet(undefined, undefined, undefined, undefined, 'Datastreams,Locations')).data.value!;
                    const all = STADataSource.transformFromThingLocationDastreamToLocationThingDatastream(things);
                    return all;
                } catch (e) {
                    if ((e as AxiosError).response?.status == 501) { // Expand not implemented --> Fallback
                        try {
                            const things = (await new ThingsApi(this.baseConfigration).v11ThingsGet()).data.value!;
                            for (const thing of things) {
                                if (!thing.Locations) {
                                    thing.Locations = [];
                                }
                                if (!thing.Datastreams) {
                                    thing.Datastreams = [];
                                }
                                try {
                                    const locs = (await new ThingsApi(this.baseConfigration).v11ThingsEntityIdLocationsGet(thing["@iot.id"]!)).data.value;
                                    thing.Locations = locs;
                                } catch (e) {
                                    console.log(e);
                                }
                                try {
                                    const dss = (await new ThingsApi(this.baseConfigration).v11ThingsEntityIdDatastreamsGet(thing["@iot.id"]!)).data.value;
                                    thing.Datastreams = dss;
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            const locations = STADataSource.transformFromThingLocationDastreamToLocationThingDatastream(things);
                            return locations
                        } catch (e) {
                            throw (e)
                        }
                    } else {
                        throw(e);
                    }
                }
            })());

        }
        const results: IOGCSTA[] = (await Promise.all(listOfPromesis));
        const resultMap: IOGCSTA = {
            things: [],
            datastreams: [],
            observations: [],
            locations: []
        };
        //const allResults:IOGCSTA = results.map((el)=>resultMap[Object.keys(el)[0] as string]=Object.values(el)[0] as any) as IOGCSTA;

        for (const result of results) {
            resultMap.datastreams = resultMap.datastreams?.concat(result.datastreams ?? [])
            resultMap.things = resultMap.things?.concat(result.things ?? [])
            resultMap.observations = resultMap.observations?.concat((result.observations as Observation[]) ?? [])
            resultMap.locations = resultMap.locations?.concat(result.locations ?? [])
        }

        return resultMap;

    };

    getState(): any {
        return {
            id: this.id,
            url: this.url,
            caption: this.caption,
            type: this.type
        }
    }

    loadState(state: any, eventBus: any): void {
        const parsed = JSON.parse(state);

        this.id = parsed.id;
        this.url = parsed.url;
        this.caption = parsed.caption;
    }

}


