export default class StaStore implements IStore,ISerializable{
    public static TYPE = 'OGCSTA';
    id: string;
    caption: string;
    datasourceId: string | null = null;
    events: IStoreEvents[] = [];
    type= StaStore.TYPE;

    private eventBus:EventBus;

    constructor(id, caption, eventBus: EventBus) {
        this.id = id;
        this.caption = caption;
        this.eventBus = eventBus;

    }

    addDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
    }

    setDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }
    getData(): Promise<any> {
        return Promise.resolve(undefined);
    }

    getState(): string {
        return "";
    }



    loadState(state: string, eventBus: any): void {
    }



}
