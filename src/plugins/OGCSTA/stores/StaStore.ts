/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors: Smart City Jena

*/

import {useDatasourceManager} from "@/composables/datasourceManager";
import type {IOGCSTA} from "@/plugins/OGCSTA/dataSources/STADataSource";
import type {Datastream, Observation} from "@/plugins/OGCSTA/dataSources/STAClient";
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

    async getObservations(ds: Datastream|Datastream[]) {
        const datasource = this.datasourceManager.getDatasource(this.datasourceId);

        if(Array.isArray(ds)){
            let observations: IOGCSTA = await datasource.getData({observations: {ids: ds.map(d=>d["@iot.id"])}});

            for(let d of ds){
                const ind = observations.observations?.findIndex(o=>o.ds_source==d["@iot.id"]);
                if(ind!=undefined && ind != -1){
                    d.Observations = observations.observations?.splice(ind,1) as Observation[];
                }
            }
            this.data.observations = observations.observations;
        }else {
            let observations: IOGCSTA = await datasource.getData({observations: {ids: [ds["@iot.id"]]}});
            ds.Observations = observations.observations;
            this.data.observations = observations.observations;
        }

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
