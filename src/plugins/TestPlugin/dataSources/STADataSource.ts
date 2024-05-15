import {
    Configuration,
    type Datastream, DatastreamsApi,
    type Observation, ObservationsApi,
    type Thing, ThingsApi
} from "@/plugins/TestPlugin/dataSources/STAClient";
import DataSource from "@/dataSources/DataSource";

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
    }

}



export default class STADataSource extends DataSource implements IDatasource {

    public static readonly TYPE = "OGCSTA";
    public readonly type = STADataSource.TYPE;
    public url: string;
    public id: string;
    public caption: string;
    private baseConfigration: Configuration;

    constructor(id, url, caption, eventBus) {
        super();
        this.id = id;
        this.url = url;
        this.caption = caption;
        this.baseConfigration = new Configuration({basePath:this.url});
    }

    getData(options: IOGCSTAOptions){
        let listOfPromesis:Promise<Thing[]|Datastream[]|Observation[]>[] = [];
        if('things' in options){
            if('all' in options.things!){
                listOfPromesis.push(new Promise(async (resolve, reject)=>{
                   try{
                       resolve(
                           (await new ThingsApi(this.baseConfigration).v11ThingsGet()).data.value!);
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
                        resolve(
                            (await new DatastreamsApi(this.baseConfigration).v11DatastreamsGet()).data.value!);
                    }catch (e){
                        reject(e);
                    }
                }));
            }else if('ids' in options.datastreams!){
                for (let id in options.datastreams!.ids){
                    listOfPromesis.push(new Promise(async (resolve, reject)=>{
                        try{
                            resolve(
                                //@ts-ignore
                                (await new DatastreamsApi(this.baseConfigration).v11DatastreamsEntityIdGet(id)).data.value!);
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
                        resolve(
                            (await new ObservationsApi(this.baseConfigration).v11ObservationsGet()).data.value!);
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
        }
        return Promise.all(listOfPromesis);
    };

}
