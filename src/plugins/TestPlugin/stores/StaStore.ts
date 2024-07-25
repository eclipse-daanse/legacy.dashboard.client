import {useDatasourceManager} from "@/composables/datasourceManager";
import type {IOGCSTA} from "@/plugins/TestPlugin/dataSources/STADataSource";
import type {Datastream} from "@/plugins/TestPlugin/dataSources/STAClient";

export default class StaStore implements IStore,ISerializable{
    public static TYPE = 'OGCSTA';
    id: string;
    caption: string;
    datasourceId: string | null = null;
    events: IStoreEvents[] = [];
    type= StaStore.TYPE;
    data:IOGCSTA = {};

    private eventBus:EventBus;
    private datasourceManager: any;
    constructor(id, caption, eventBus: EventBus) {
        this.id = id;
        this.caption = caption;
        this.eventBus = eventBus;
        this.datasourceManager = useDatasourceManager();

    }

    addDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
    }

    setDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }
    async getData(options=undefined): Promise<any>  {
        const datasource = this.datasourceManager.getDatasource(this.datasourceId);
        const newData = await datasource.getData(options);
        if(options!=undefined){
            this.data = newData;
        }
        return this.data;
    }
    async getObservations(ds:Datastream){
        const datasource = this.datasourceManager.getDatasource(this.datasourceId);

        console.log(ds["@iot.id"])
        let observations:IOGCSTA = await datasource.getData({datastreams:{ids:[ds["@iot.id"]]}});
        ds.Observations = observations.observations;
        return ds;
    }
    async getThings(){
            let things = [];
            if(this.data){
                return this.data.locations?.map(location=>location.Things).flat()
            }else {
                return []
            }
    }



    getState(): string {
        return "";
    }



    loadState(state: string, eventBus: any): void {
    }



}
