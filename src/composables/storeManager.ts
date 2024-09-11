/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors: Smart City Jena

*/

/* eslint-disable @typescript-eslint/no-unused-vars */
import { reactive, type Ref, ref, watch } from "vue";
import queryString from "query-string";
import { optionalArrayToArray } from "@/utils/helpers";
import { v4, v5 } from "uuid";
import { Store } from "@/stores/Widgets/Store";
import type BaseStore from "@/stores/Widgets/BaseStore";
type BaseStoreClass = typeof BaseStore;
interface BaseStoreClassDerived extends BaseStoreClass {}

//interface RouterDerived extends BaseStore1{}

const availableStores = ref(new Map<string, IStore & ISerializable>());
const storeRegistry: Map<string, BaseStoreClassDerived> = new Map();

export interface StoreManagerI {
    initStore: {
        (caption: string, eventBus: any, type: string): string;
    };
    getStore: { (key: string): IStore };
    getState: { (): any };
    deleteStore: { (key: string): void };
    getStoreList: { (): Ref<Map<string, IStore & ISerializable>> };
    loadState: Function;
    registerStoreType: { (classOfStoreType: typeof BaseStore): void };
    getStoreTypes: { (): string[] };
}

export function useStoreManager(): StoreManagerI {
    const initStore = (
        caption = "NO CAPTION",
        eventBus,
        type = "REST",
    ): string => {
        const id = v4();

        const storeClass = storeRegistry.get(type);
        if (storeClass) {
            const store = reactive(
                new (storeClass as any)(id, caption, eventBus) as IStore &
                    ISerializable,
            );
            availableStores.value.set(id, store);

            return id;
        }
        return "";
    };

    const getStore = (key): IStore => {
        console.log(key);
        console.log(availableStores.value);
        const store = availableStores.value.get(key);
        if (store) {
            return store;
        } else {
            throw new Error("Store with provided id doesn't exist");
        }
    };

    const getStoreList = () => {
        return availableStores;
    };

    const getState = () => {
        const state = {};

        availableStores.value.forEach((store) => {
            state[store.id] = store.getState();
        });

        return JSON.stringify(state);
    };

    const deleteStore = (id: string) => {
        if (availableStores.value.has(id)) {
            availableStores.value.delete(id);
        } else {
            throw new Error("Store with provided id doesn't exist");
        }
    };

    const loadState = (state, eventBus) => {
        availableStores.value.clear();
        const parsed = JSON.parse(state);

        Object.keys(parsed).forEach((key) => {
            const storeClass = storeRegistry.get(parsed[key].type);
            if (storeClass) {
                const store: IStore & ISerializable = reactive(
                    new (storeClass as any)(key, parsed[key].caption, eventBus),
                );
                store.loadState(parsed[key]);
                availableStores.value.set(key, store);
            }
        });
    };

    const registerStoreType = (classOfStoreType: typeof BaseStore) => {
        storeRegistry.set(classOfStoreType.TYPE, classOfStoreType);
    };
    const getStoreTypes = () => {
        return Array.from(storeRegistry.keys());
    };

    return {
        registerStoreType,
        initStore,
        getStore,
        getStoreList,
        getState,
        deleteStore,
        loadState,
        getStoreTypes,
    };
}
