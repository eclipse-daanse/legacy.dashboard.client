/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors: Smart City Jena

*/

import { useDatasourceManager } from "@/composables/datasourceManager";
import type RESTDatasource from "@/dataSources/RestDatasource";
import BaseStore from "@/stores/Widgets/BaseStore";
import { useErrorHandler } from "@/composables/dashboard/errorToast";

export class Store extends BaseStore implements IStore {
    public static readonly TYPE = "REST";
    private datasourceManager: any;

    public datasourceId: string | null = null;

    public params: IStoreParams = {};
    public requestTemplate: string;
    public events: IStoreEvents[] = [];
    public initedEvents: Array<{ name: string; cb: Function }> = [];
    private runtimeParams: IStoreParams = {};
    private errorToast: any;

    public type = Store.TYPE;
    public listAvailableDatasourceTypes = ["REST"];

    constructor(id: string, caption: string, eventBus: EventBus) {
        super(id, caption, eventBus);
        this.datasourceManager = useDatasourceManager();
        this.requestTemplate = "/products/{pageNum}";

        this.calculateParams();
        this.registerForDataSourceEvents();
        this.errorToast = useErrorHandler();
    }

    calculateParams(): void {
        const cachedParams = { ...this.params };
        this.params = {};

        const params = this.requestTemplate.match(/[^{}]+(?=})/g) || [];
        params.forEach((name) => {
            this.params[name] = cachedParams[name] || null;
        });

        this.runtimeParams = { ...this.params };
    }

    updateParam(paramName: string, value: string): void {
        this.params[paramName] = value;
        this.runtimeParams[paramName] = value;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    addDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
    }

    setDatasource(datasourceId: string): void {
        this.datasourceId = datasourceId;
        this.eventBus.emit(`UPDATE:${this.id}`);
        this.registerForDataSourceEvents();
    }

    async getData(): Promise<string> {
        try {
            let requestTemplate = this.requestTemplate;

            const paramsList = Object.keys(this.params);

            paramsList.forEach((e) => {
                console.log(e);
                requestTemplate = requestTemplate.replace(
                    `{${e}}`,
                    this.runtimeParams[e],
                );
            });

            const datasource = this.datasourceManager.getDatasource(
                this.datasourceId,
            );
            const json = (await datasource?.getData(requestTemplate)) as string;

            return json;
        } catch (e) {
            return this.errorToast.handleErrorToast(e);
        }
    }

    reset(): void {
        this.calculateParams();
    }

    getDatasource(): RESTDatasource {
        return this.datasourceManager.getDatasource(this.datasourceId);
    }

    setOptions({ caption = "", requestTemplate = "" }): void {
        this.caption = caption;
        this.requestTemplate = requestTemplate;

        this.calculateParams();
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    updateEvents(events) {
        this.initedEvents.forEach((e) => {
            this.eventBus.off(e.name, e.cb);
        });

        this.initedEvents = [];
        this.events = events;

        events.forEach((e: { name: string; action: string }) => {
            const cb = (value) => {
                const functionArgs = Object.keys(this.runtimeParams);
                const functionArgsVals = Object.values(this.runtimeParams);

                // TODO: replace with webworker
                const userEvent = Function(
                    ...functionArgs,
                    "$value",
                    `
            console.log(arguments)
            ${e.action};
            return arguments;
          `,
                );

                const modifiedParams = userEvent(...functionArgsVals, value);
                functionArgs.forEach((e, i) => {
                    this.runtimeParams[e] = modifiedParams[i];
                });

                this.eventBus.emit(`UPDATE:${this.id}`);
            };

            this.eventBus.on(e.name, cb);
            this.initedEvents.push({
                name: e.name,
                cb,
            });
        });
    }

    registerForDataSourceEvents(): void {
        // for (const id of this.datasourceIds) {
        //   this.eventBus.on(`UPDATE:${id}`, () => {
        //     console.log("updt");
        //     this.eventBus.emit(`UPDATE:${this.id}`);
        //   });
        // }
    }

    getState() {
        return {
            caption: this.caption,
            id: this.id,
            requestTemplate: this.requestTemplate,
            events: this.events,
            datasourceId: this.datasourceId,
            params: this.params,
            type: "REST",
        };
    }

    loadState(state) {
        this.caption = state.caption;
        this.id = state.id;
        this.requestTemplate = state.requestTemplate;
        this.events = state.events;
        this.datasourceId = state.datasourceId;
        this.params = state.params;
        this.calculateParams();
        this.updateEvents(this.events);
    }
}
