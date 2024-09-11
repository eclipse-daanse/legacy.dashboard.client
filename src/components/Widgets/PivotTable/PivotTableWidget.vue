<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import PivotTableWidgetSettings from "./PivotTableWidgetSettings.vue";
import { provide, ref, type Ref, computed, inject } from "vue";
import { TinyEmitter } from "tiny-emitter";
import { useElementSize } from "@vueuse/core";
import PivotTable from "./PivotTable";
import RowsArea from "../../PivotTable/Areas/RowsArea.vue";
import ColumnsArea from "../../PivotTable/Areas/ColumnsArea.vue";
import CellsArea from "../../PivotTable/Areas/CellsArea.vue";
import PivotTableSettingsButton from "@/components/PivotTable/PivotTableSettingsButton.vue";
import { type XMLAStore } from "@/stores/Widgets/XMLAStore";
import { useStore } from "@/composables/widgets/store";
import {
    parseMdxRequest,
    parseRequestToTable,
} from "@/utils/MdxRequests/MdxRequestHelper";
import { debounce } from "lodash";

const DEFAULT_COLUMN_WIDTH = 150;
const DEFAULT_ROW_HEIGHT = 30;
const DEFAULT_ROW_HEIGHT_CSS = `${DEFAULT_ROW_HEIGHT}px`;
const inited = ref(false);
const settingsComponent = PivotTableWidgetSettings;

const EventBus = inject("customEventBus") as any;
const pivotTableControl = new PivotTable();

const rows = ref([] as any[]);
const columns = ref([] as any[]);
const cells = ref([] as any[]);
const propertiesRows = ref([] as any[]);
const propertiesCols = ref([] as any[]);
const rowsExpandedMembers = ref([] as any[]);
const columnsExpandedMembers = ref([] as any[]);

const colStyles = ref([...pivotTableControl.styles.columns]);
const rowsStyles = ref([...pivotTableControl.styles.rows]);

const updateFn = debounce(async (store: XMLAStore) => {
    inited.value = true;

    console.log(store);
    const mdxResponce = await store.getData();
    const requestParams = store.getRequestParams();

    rowsExpandedMembers.value = requestParams.rowsExpandedMembers;
    columnsExpandedMembers.value = requestParams.columnsExpandedMembers;

    const {
        cells: cellsResponce,
        rows: rowsResponce,
        columns: columnsResponce,
        propertiesRows: propertiesRowsResponce,
        propertiesCols: propertiesColsResponce,
    } = parseMdxRequest(mdxResponce);

    parseRequestToTable(mdxResponce, 0);

    rows.value = rowsResponce;
    columns.value = columnsResponce;
    cells.value = cellsResponce;
    propertiesRows.value = propertiesRowsResponce;
    propertiesCols.value = propertiesColsResponce;
}, 100);

const { store, setStore } = useStore<XMLAStore>(EventBus, updateFn);

const getState = () => {
    return {
        rowsStyles: rowsStyles.value,
        colStyles: colStyles.value,
    };
};

defineExpose({
    settingsComponent,
    store,
    getState,
    setStore,
});

// Pivot table logic

const rowsContainer = ref(null) as Ref<any>;
const { width: rowsWidth } = useElementSize(rowsContainer);

const eventBus = new TinyEmitter();
provide("pivotTableEventBus", eventBus);

const onResize = (e: MouseEvent) => {
    eventBus.emit("onResize", e);
};

const onStopResize = () => {
    eventBus.emit("onStopResize");
};

const drillthrough = () => {
    console.log(drillthrough);
};

const columnsOffset = computed(() => {
    return rows.value?.[0]?.length * DEFAULT_COLUMN_WIDTH;
});

const setRowsStyles = (i: number, value: number) => {
    rowsStyles.value[i] = value;
};

const setColumnsStyles = (i: number, value: number) => {
    colStyles.value[i] = value;
};

provide("setRowsStyles", setRowsStyles);
provide("setColumnsStyles", setColumnsStyles);

provide("drilldown", (value, area) => {
    EventBus.emit(`DRILLDOWN:${store.value.id}`, { value, area });
});
provide("drillup", (value, area) => {
    EventBus.emit(`DRILLUP:${store.value.id}`, { value, area });
});
provide("expand", (value, area) => {
    EventBus.emit(`EXPAND:${store.value.id}`, { value, area });
});
provide("collapse", (value, area) => {
    EventBus.emit(`COLLAPSE:${store.value.id}`, { value, area });
});

const totalContentSize = computed(() => {
    const columnsDesc = [
        ...propertiesCols.value,
        ...(columns.value.length ? columns.value : [{}]),
    ];
    const xAxisDesc = columnsDesc.reduce(
        (
            acc: {
                items: any[];
                totalWidth: number;
            },
            _: any,
            i: number,
        ) => {
            acc.items[i] = {
                start: acc.totalWidth,
                width: colStyles.value[i] || DEFAULT_COLUMN_WIDTH,
            };
            acc.totalWidth =
                acc.totalWidth + (colStyles.value[i] || DEFAULT_COLUMN_WIDTH);
            return acc;
        },
        { items: [], totalWidth: 0 },
    );

    const rowsDesc = [
        ...propertiesRows.value,
        ...(rows.value.length ? rows.value : [{}]),
    ];
    const yAxisDesc = rowsDesc.reduce(
        (
            acc: {
                items: any[];
                totalWidth: number;
            },
            _: any,
            i: number,
        ) => {
            acc.items[i] = {
                start: acc.totalWidth,
                width: rowsStyles.value[i] || DEFAULT_ROW_HEIGHT,
            };
            acc.totalWidth =
                acc.totalWidth + (rowsStyles.value[i] || DEFAULT_ROW_HEIGHT);
            return acc;
        },
        { items: [], totalWidth: 0 },
    );

    return {
        xAxis: xAxisDesc,
        yAxis: yAxisDesc,
    };
});
</script>

<template>
    <template v-if="inited">
        <div
            class="pivotTable_container"
            @mousemove="onResize"
            @mouseup="onStopResize"
            @mouseleave="onStopResize"
            @contextmenu.stop.prevent=""
        >
            <div class="placeholder">
                <div class="bar">
                    <!-- <va-button
            v-if="pivotTableStore.state.inited"
            icon="download"
            preset="secondary"
            color="secondary"
            @click="downloadCSV"
          /> -->

                    <PivotTableSettingsButton />
                </div>
            </div>
            <!-- <DrillthroughModal ref="drillthroughModal" /> -->
            <div class="pivotTable">
                <ColumnsArea
                    :columnsStyles="colStyles"
                    :columnsOffset="columnsOffset"
                    :columns="[...propertiesCols, ...columns]"
                    :totalContentSize="totalContentSize"
                    :leftPadding="rowsWidth"
                    :columns-expanded-members="columnsExpandedMembers"
                ></ColumnsArea>
                <div class="d-flex flex-row overflow-hidden vertical-scroll">
                    <RowsArea
                        ref="rowsContainer"
                        :rows="[...propertiesRows, ...rows]"
                        :rowsStyles="rowsStyles"
                        :totalContentSize="totalContentSize"
                        :rows-expanded-members="rowsExpandedMembers"
                    ></RowsArea>
                    <CellsArea
                        :rowsStyles="rowsStyles"
                        :colsStyles="colStyles"
                        :totalContentSize="totalContentSize"
                        :cells="cells"
                        @drillthrough="drillthrough"
                    ></CellsArea>
                </div>
            </div>
        </div>
    </template>
</template>

<style lang="scss">
.pivotTable_container {
    padding: v-bind(DEFAULT_ROW_HEIGHT_CSS);
    height: 100%;

    .bar {
        position: absolute;
        margin-top: -29px;
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-content: center;
        justify-content: flex-end;
    }
    .placeholder {
        height: 8px;
    }
}
.pivotTable {
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.vertical-scroll {
    height: 100%;
}
</style>
