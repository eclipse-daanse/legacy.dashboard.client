import {
    Configuration,
    type Datastream, DatastreamsApi, LocationsApi,
    type Observation, ObservationsApi,type Location,
    type Thing, type Things, ThingsApi
} from "@/plugins/TestPlugin/dataSources/STAClient";
import DataSource from "@/dataSources/DataSource";
import {AxiosError} from "axios";

export interface IOGCSTAOptions{
    things?:{
        all?:boolean,
        ids?:Array<string>,
        filter?:any
    },
    datastreams?:{
        all?:boolean,
        ids?:Array<string>,
        filter?:any
    },
    observations?:{
        all?:boolean,
        ids?:Array<string>,
        filter?:any
    },
    locations?:{
        all?:boolean,
        ids?:Array<string>,
        filter?:any
    }

}
export interface IOGCSTA{
    things?:Thing[],
    datastreams?:Datastream[],
    observations?:Observation[],
    locations?:Location[]
}



export default class STADataSource extends DataSource implements IDatasource,ISerializable {

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
        this.baseConfigration = new Configuration({basePath:this.url});
    }

    async getData(options: IOGCSTAOptions){

        let listOfPromesis:Promise<IOGCSTA>[] = [];


        if(options && typeof options == 'object'){
        if('things' in options){
            if('all' in options.things!){
                listOfPromesis.push(new Promise(async (resolve, reject)=>{
                   try{
                       let data = (await new ThingsApi(this.baseConfigration).v11ThingsGet()).data.value!

                       resolve({things:data});
                   }catch (e){
                       reject(e);
                   }
                }));
            }else if('ids' in options.things!){
                for (let id in options.things!.ids){
                    listOfPromesis.push(new Promise(async (resolve, reject)=>{
                        try{
                            resolve(
                                //@ts-ignore
                                (await new ThingsApi(this.baseConfigration).v11ThingsEntityIdGet(id)).data.value!);
                        }catch (e){
                            reject(e);
                        }
                    }));
                }
            }
        }if ('datastreams' in options){
            if('all' in options.datastreams!){
                listOfPromesis.push(new Promise(async (resolve, reject)=>{
                    try{
                        const data= ( await new DatastreamsApi(this.baseConfigration).v11DatastreamsGet()).data.value!
                        resolve({datastreams:data});
                    }catch (e){
                        reject(e);
                    }
                }));
            }else if('ids' in options.datastreams!){
                for (let id of options.datastreams!.ids!){
                    listOfPromesis.push(new Promise(async (resolve, reject)=>{
                        try{
                            const data = (await new DatastreamsApi(this.baseConfigration).v11DatastreamsEntityIdObservationsGet(id,undefined,1)).data.value!;
                            resolve({observations:data});
                                //@ts-ignore

                        }catch (e){
                            reject(e);
                        }
                    }));
                }
            }
        }if ('observations' in options){
            if('all' in options.observations!){
                listOfPromesis.push(new Promise(async (resolve, reject)=>{
                    try{
                        const data = (await new ObservationsApi(this.baseConfigration).v11ObservationsGet()).data.value!;
                        resolve({observations:data});

                    }catch (e){
                        reject(e);
                    }
                }));
            }else if('ids' in options.observations!){
                for (let id in options.observations!.ids){
                    listOfPromesis.push(new Promise(async (resolve, reject)=>{
                        try{
                            resolve(
                                //@ts-ignore
                                (await new ObservationsApi(this.baseConfigration).v11ObservationsEntityIdGet(id)).data.value!);
                        }catch (e){
                            reject(e);
                        }
                    }));
                }
            }
        }}
        else {
            listOfPromesis.push(new Promise(async (resolve, reject)=>{
                try{
                    const things = (await new ThingsApi(this.baseConfigration).v11ThingsGet(undefined,undefined,undefined,undefined,'Datastreams,Locations')).data.value!;


                    const locations = STADataSource.transformFromThingLocationDastreamToLocationThingDatastream(things);

                    //resultMap.locations = locations


                    resolve({locations:locations});

                }catch (e){

                    if((e as AxiosError).response?.status == 501 ){ // Expand not implemented --> Fallback
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
                            resolve({locations:locations})
                        }catch (e){
                            reject(e)
                        }
                    }else{
                        reject(e);
                    }

                }
            }));
            /*listOfPromesis.push(new Promise(async (resolve, reject)=>{
                    try{
                        const data =  (await new DatastreamsApi(this.baseConfigration).v11DatastreamsGet()).data.value!;
                        resolve({datastreams:data});
                    }catch (e){
                        reject(e);
                    }
                }));
            listOfPromesis.push(new Promise(async (resolve, reject)=>{
                try{
                    const data =  (await new LocationsApi(this.baseConfigration).v11LocationsGet()).data.value!;
                    resolve({locations:data});
                }catch (e){
                    reject(e);
                }
            }));*/
            /*listOfPromesis.push(new Promise(async (resolve, reject)=>{
                try{

                    const data =  (await new ObservationsApi(this.baseConfigration).v11ObservationsGet()).data.value!;

                    resolve({observations:data});
                }catch (e){
                    reject(e);
                }
            }));*/

    }
        const results:IOGCSTA[] = (await Promise.all(listOfPromesis));
        const resultMap:IOGCSTA = {
            things:[],
            datastreams:[],
            observations:[],
            locations:[]
        };
        //const allResults:IOGCSTA = results.map((el)=>resultMap[Object.keys(el)[0] as string]=Object.values(el)[0] as any) as IOGCSTA;

        for(const result of results){
            resultMap.datastreams =  resultMap.datastreams?.concat(result.datastreams??[])
            resultMap.things =  resultMap.things?.concat(result.things??[])
            resultMap.observations =  resultMap.observations?.concat(result.observations??[])
            resultMap.locations =  resultMap.locations?.concat(result.locations??[])
        }

        return resultMap;

    };


    static transformFromThingLocationDastreamToLocationThingDatastream(things:Thing[]):Location[]{
        const locations:Location[]=[];
        for(let thing of things??[]){
            for (const location of thing.Locations??[]){
                if(!location.Things){
                    location.Things = [];
                }
                let isAlreadyinLocation = locations.find((l:Location)=>l["@iot.id"]=== location["@iot.id"]);
                if(isAlreadyinLocation){
                    const allredyexistingThing = isAlreadyinLocation.Things??[].find((t:Thing)=>t['@iot.id'] == thing["@iot.id"]);
                    if(!allredyexistingThing){
                        if(!isAlreadyinLocation.Things) {
                            isAlreadyinLocation.Things = [];
                        }
                        isAlreadyinLocation.Things.push(thing);
                    }
                }else {
                    const index = thing.Locations!.indexOf(location);
                    if (index > -1) { // only splice array when item is found
                        thing.Locations!.splice(index, 1); // 2nd parameter means remove one item only
                    }
                    location.Things.push(thing);
                    locations.push(location);

                }
            }
        }
        return locations;
    }

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
        //this.type = parsed.type;
    }

}


