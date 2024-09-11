/*
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

*/

import { useDatasourceManager } from "@/composables/datasourceManager";
import { getMdxRequest } from "@/utils/MdxRequests/MdxRequestConstructor";
import BaseStore from "@/stores/Widgets/BaseStore";
import { useErrorHandler } from "@/composables/dashboard/errorToast";
import DrilldownHandler from "@/composables/mdx/Classes/DrilldownHandler";
interface EventBus {
    emit: (string, any?) => void;
    on: (string, Function) => void;
    off: (string, Function) => void;
}

interface XMLARequestParams {
    rows: any[];
    columns: any[];
    measures: any[];
    filters: any[];
}

export class XMLAStore extends BaseStore implements IStore {
    public static readonly TYPE = "XMLA";
    public readonly type = XMLAStore.TYPE;

    public datasourceId: string | null = null;
    private datasourceManager: any;
    public data = null;
    public events = [] as Array<{ name: string; action: string }>;
    public initedEvents = [] as Array<{ name: string; cb: Function }>;
    private drilldownHandler: DrilldownHandler;

    public XMLARequestParams: XMLARequestParams = {
        rows: [],
        columns: [],
        measures: [],
        filters: [],
    };

    updateParam() {
        throw new Error("Method not implemented.");
    }

    updateEvents() {
        throw new Error("Method not implemented.");
    }

    private errorToast: any;

    constructor(id, caption, eventBus: EventBus) {
        super(id, caption, eventBus);

        this.datasourceManager = useDatasourceManager();
        this.errorToast = useErrorHandler();
        this.drilldownHandler = new DrilldownHandler(this);

        this.eventBus.on(`DRILLDOWN:${this.id}`, async (params) => {
            this.drilldownHandler.handleDrilldown(params);
            this.eventBus.emit(`UPDATE:${this.id}`);
        });
        this.eventBus.on(`drillup:${this.id}`, async (params) => {
            this.drilldownHandler.handleDrillup(params);
            this.eventBus.emit(`UPDATE:${this.id}`);
        });
        this.eventBus.on(`EXPAND:${this.id}`, async (params) => {
            this.drilldownHandler.handleExpand(params);
            this.eventBus.emit(`UPDATE:${this.id}`);
        });
        this.eventBus.on(`COLLAPSE:${this.id}`, async (params) => {
            this.drilldownHandler.handleCollapse(params);
            this.eventBus.emit(`UPDATE:${this.id}`);
        });
    }

    setDatasource(datasourceIds) {
        this.datasourceId = datasourceIds;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    async getData(params?: XMLARequestParams) {
        try {
            const datasource = this.datasourceManager.getDatasource(
                this.datasourceId,
            );

            console.log(this.XMLARequestParams);

            if (!params) {
                params = {
                    ...this.XMLARequestParams,
                };
            }

            this.drilldownHandler.flushExpands(params.columns, params.rows);
            this.drilldownHandler.flushDrilldowns(params.columns, params.rows);

            const measuresMapped = params.measures.map((e) => {
                return { originalItem: e };
            });

            const body = await this.getMDXRequest(
                params.rows,
                params.columns,
                measuresMapped,
                this.drilldownHandler.rowsExpandedMembers,
                this.drilldownHandler.rowsDrilldownMembers,
                this.drilldownHandler.columnsExpandedMembers,
                this.drilldownHandler.columnsDrilldownMembers,
                {
                    showEmpty: true,
                    alignContent: "right",
                },
            );

            const responce = await datasource.getData(body);
            return responce;
        } catch (e) {
            return this.errorToast.handleErrorToast(e);
        }
    }

    getRequestParams() {
        return {
            ...this.XMLARequestParams,
            ...this.drilldownHandler.getDrilldownState(),
        };
    }

    setOptions({ caption }: IStoreParams) {
        this.caption = caption || this.caption;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    setRows(rows) {
        this.XMLARequestParams.rows = rows;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    setCols(columns) {
        console.log(columns);
        this.XMLARequestParams.columns = columns;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    setFilters(filters) {
        this.XMLARequestParams.filters = filters;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    setMeasures(measures) {
        this.XMLARequestParams.measures = measures;
        this.eventBus.emit(`UPDATE:${this.id}`);
    }

    getDatasource() {
        return this.datasourceManager.getDatasource(this.datasourceId);
    }

    getState() {
        return {
            caption: this.caption,
            id: this.id,
            events: this.events,
            datasourceId: this.datasourceId,
            type: this.type,
        };
    }

    loadState(state) {
        this.caption = state.caption;
        this.id = state.id;
        this.events = state.events;
        this.datasourceId = state.datasourceId;
    }

    async getMDXRequest(
        rows,
        columns,
        measures,
        rowsExpandedMembers,
        rowsDrilldownMembers,
        columnsExpandedMembers,
        columnsDrilldownMembers,
        pivotTableSettings,
    ) {
        const datasource = this.datasourceManager.getDatasource(
            this.datasourceId,
        );
        await datasource.ready();

        const mdxRequest = await getMdxRequest(
            datasource.cube.CUBE_NAME,
            rowsDrilldownMembers,
            columnsDrilldownMembers,
            rowsExpandedMembers,
            columnsExpandedMembers,
            rows,
            columns,
            measures,
            pivotTableSettings,
            datasource.getProperties(),
            [],
            datasource.getLevels(),
        );

        return mdxRequest;
    }
}
