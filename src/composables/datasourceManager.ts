/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors: Smart City Jena

*/

/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Ref, ref, watch } from "vue";
import { v4 } from "uuid";
import { inject } from "vue";
import type DataSource from "@/dataSources/DataSource";

declare interface DatasourceMap {
    [key: string]: IDatasource;
}
declare interface DatasourceRegistryMap {
    [key: string]: typeof DataSource;
}
const dataSourceRegistry: DatasourceRegistryMap = {};
const availableDatasources: Ref<DatasourceMap> = ref({});

export function useDatasourceManager() {
    const EventBus = inject("customEventBus") as any;

    const initDatasource = (type: string, caption: string, url?: string) => {
        const id = v4();

        try {
            const classinst = dataSourceRegistry[type];
            const datasource = new classinst(
                id,
                url,
                caption,
                EventBus,
            ) as IDatasource;
            availableDatasources.value[id] = datasource;
            return id;
        } catch (e) {
            throw new TypeError(`${type} not found in registry`);
        }
    };

    const getDatasource = (key) => {
        return availableDatasources.value[key];
    };

    const getDatasourceList = () => {
        return availableDatasources;
    };

    const updateDatasource = (key, type, caption, url, cube?, catalog?) => {
        try {
            const classinst = dataSourceRegistry[type];
            const datasource = new classinst(
                key,
                url,
                caption,
                EventBus,
                cube,
                catalog,
            ) as IDatasource;
            availableDatasources.value[key] = datasource;
        } catch (e) {
            throw new TypeError(`${type} not found in registry`);
        }
    };

    const deleteDatasource = (id: string) => {
        if (availableDatasources.value[id]) {
            const updatedDatasources = { ...availableDatasources.value };
            delete updatedDatasources[id];
            availableDatasources.value = updatedDatasources;
        } else {
            throw new Error(`Datasource with id ${id} not found`);
        }
    };

    const getState = () => {
        const state = {};

        Object.keys(availableDatasources.value).forEach((key) => {
            const ds = availableDatasources.value[key];
            state[ds.id] = ds.getState();
        });

        return JSON.stringify(state);
    };

    const loadState = (state) => {
        const parsed = JSON.parse(state);

        Object.keys(parsed).forEach((key) => {
            const ds = parsed[key];
            try {
                const classinst = dataSourceRegistry[ds.type];
                const datasource = new classinst(
                    key,
                    ds.url,
                    ds.caption,
                    EventBus,
                    ds.cube,
                    ds.catalog,
                ) as IDatasource;
                availableDatasources.value[key] = datasource;
            } catch (e) {
                throw new TypeError(`${ds.type} not found in registry`);
            }
        });
    };

    const registerDataSource = (class_ref: typeof DataSource) => {
        dataSourceRegistry[class_ref.TYPE] = class_ref;
    };
    const unRegisterDataSource = (class_ref: typeof DataSource) => {
        delete dataSourceRegistry[class_ref.TYPE];
        //dataSourceRegistry.push(class_ref);
    };
    const getDataSourceRegistry = () => {
        return dataSourceRegistry;
    };

    return {
        getDataSourceRegistry,
        registerDataSource,
        unRegisterDataSource,
        initDatasource,
        getDatasource,
        getDatasourceList,
        updateDatasource,
        deleteDatasource,
        getState,
        loadState,
    };
}
