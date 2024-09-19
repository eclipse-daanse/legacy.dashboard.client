import {useDatasourceManager} from "@/composables/datasourceManager";
import type {IOGCSTA} from "@/plugins/OGCSTA/dataSources/STADataSource";
import type {Datastream} from "@/plugins/OGCSTA/dataSources/STAClient";
import BaseStore from "@/stores/Widgets/BaseStore";

export default class StaStore extends BaseStore implements IStore, ISerializable {
    public static TYPE = 'OGCSTA';

    datasourceId: string | null = null;
    events: IStoreEvents[] = [];
    type = StaStore.TYPE;
    data: IOGCSTA = {};

    private datasourceManager = useDatasourceManager();

    constructor(id, caption, eventBus: EventBus) {
        super(id, caption, eventBus);
    }

    getDatasource() {
        return this.datasourceManager.getDatasource(this.datasourceId);
    };

    setOptions(options: IStoreParams) {

    };

    updateParam(paramName: string, value: string) {
    };

    updateEvents(events: IStoreEvents[]) {

    };

    addDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
    }

    setDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    async getData(options = undefined): Promise<any> {
        const datasource = this.datasourceManager.getDatasource(this.datasourceId);
        const newData = await datasource.getData(options);

        this.data = newData;

        return this.data;
    }

    async getObservations(ds: Datastream) {
        const datasource = this.datasourceManager.getDatasource(this.datasourceId);

        console.log(ds["@iot.id"])
        let observations: IOGCSTA = await datasource.getData({datastreams: {ids: [ds["@iot.id"]]}});
        ds.Observations = observations.observations;
        return ds;
    }

    async getThings() {
        let things = [];
        if (this.data) {
            return this.data.locations?.map(location => location.Things).flat()
        } else {
            await this.getData();
            if (this.data) {
                //@ts-ignore
                return this.data!.locations.map(location => location.Things).flat()
            } else {
                return {}
            }
        }
    }

    getState(): any {
        return {
            caption: this.caption,
            id: this.id,
            events: this.events,
            datasourceId: this.datasourceId,
            type: this.type,
        };
    }

    loadState(state: any, eventBus: any): void {
        this.caption = state.caption;
        this.id = state.id;
        this.events = state.events;
        this.datasourceId = state.datasourceId;
    }
}
