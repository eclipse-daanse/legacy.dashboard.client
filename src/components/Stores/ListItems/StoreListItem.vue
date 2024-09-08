<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useStoreManager } from "../../../composables/storeManager";
import { useDatasourceManager } from "../../../composables/datasourceManager";
import { type Ref, onMounted, ref, watch } from "vue";
import type RESTDatasource from "@/dataSources/RestDatasource";
import { useLoaderStore } from "@/composables/dashboard/LoaderStore";

const { t } = useI18n();
const storeManager = useStoreManager();
const { setLoading } = useLoaderStore();
const dslist: Ref<RESTDatasource[]> = ref([] as RESTDatasource[]);

const selectedDatasourceId = ref("");
const selectedDatasource = ref({
    url: "",
    caption: "",
    id: "",
});

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});

const item = ref(props.item);
const isExpanded = ref(false);

const dsManager = useDatasourceManager();
const dsmap = dsManager.getDatasourceList();

const clickHeader = () => {
    isExpanded.value = !isExpanded.value;
};

watch(
    dsmap,
    () => {
        dslist.value = Object.entries(dsmap.value)
            .map(([, ds]) => {
                return ds;
            })
            .filter((e) => e.type === "REST") as RESTDatasource[];
    },
    { deep: true },
);

onMounted(() => {
    dslist.value = Object.entries(dsmap.value)
        .map(([, ds]) => {
            return ds;
        })
        .filter((e) => e.type === "REST") as RESTDatasource[];

    const store = storeManager.getStore(item.value.id);
    const ds = store.getDatasource();
    if (ds) {
        selectedDatasourceId.value = ds.id;
    }
});

watch(
    () => selectedDatasourceId.value,
    (nV) => {
        const currentDs = dslist.value.find((item) => item.id === nV);
        if (!currentDs) {
            return;
        }

        // setLoading(true);
        selectedDatasource.value = currentDs;
        const store = storeManager.getStore(item.value.id);
        store.setDatasource(currentDs.id);
        // setTimeout(() => {
        // setLoading(false);
        // }, 2000)
    },
    {
        deep: true,
    },
);

const saveStore = (item) => {
    const store = storeManager.getStore(item.id);
    store.setOptions({
        caption: item.caption,
        requestTemplate: item.requestTemplate,
    });
};

const createDatasource = () => {
    const id = dsManager.initDatasource("REST", "", "New store");
    selectedDatasourceId.value = id;
};

const addEvent = (id) => {
    const store = storeManager.getStore(id);
    store.events.push({
        name: "",
        action: "",
    });
};

const updateEvents = (item) => {
    const store = storeManager.getStore(item.id);
    store.updateEvents(item.events);
};

const getParams = (item) => {
    const params = Object.entries(item.params as { [s: string]: string }).map(
        (e: [string, string]) => ({
            name: e[0],
            value: e[1],
        }),
    );

    return params;
};

const setParamValue = (item, index, value) => {
    const store = storeManager.getStore(item.id);
    const paramName = getParams(item)[index].name;

    store.updateParam(paramName, value);
    console.log(paramName, value);
};

const setCaption = () => {
    const ds = dsManager.getDatasource(selectedDatasource.value.id);
    if (ds) {
        dsManager.updateDatasource(
            ds.id,
            ds.type,
            selectedDatasource.value.caption,
            ds.url,
        );
    }
};

const setUrl = () => {
    const ds = dsManager.getDatasource(selectedDatasource.value.id);
    if (ds) {
        dsManager.updateDatasource(
            ds.id,
            ds.type,
            ds.caption,
            selectedDatasource.value.url,
        );
    }
};
</script>

<template>
    <div class="store-item-header" @click="clickHeader">
        <va-list-item-label class="store-item-header-text">
            {{ item.caption }}
            <!-- {{ item.id }} -->
        </va-list-item-label>
        <va-icon v-if="!isExpanded" class="material-icons">
            expand_more
        </va-icon>
        <va-icon v-else class="material-icons"> expand_less </va-icon>
    </div>
    <div v-if="isExpanded" class="store-item-content">
        <va-input
            :label="t('SidebarStoreList.caption')"
            v-model="item.caption"
            @blur="saveStore(item)"
        ></va-input>
        <va-input
            :label="t('SidebarStoreList.dataEndpoint')"
            v-model="item.requestTemplate"
            @blur="saveStore(item)"
        ></va-input>

        <div class="datasource-list">
            <h2>{{ t("SidebarStoreList.dataSourcesTitle") }}</h2>
            <div class="connections-controls">
                <va-select
                    text-by="caption"
                    value-by="id"
                    v-model="selectedDatasourceId"
                    :options="dslist"
                />
                <va-button
                    class="datasource-list-add-button"
                    @click="createDatasource"
                >
                    {{ t("SidebarStoreList.addDatasourceButton") }}
                </va-button>
            </div>
            <template v-if="selectedDatasource.id">
                <div class="connections-list">
                    <va-input
                        class="mt-3"
                        v-model="selectedDatasource.caption"
                        @blur="setCaption"
                        :label="t('SidebarStoreList.StoreLabels.caption')"
                    ></va-input>
                    <va-input
                        class="mt-3"
                        @blur="setUrl"
                        v-model="selectedDatasource.url"
                        :label="t('SidebarStoreList.StoreLabels.url')"
                    ></va-input>
                </div>
            </template>
        </div>

        <div class="datasource-list">
            <h2>{{ t("SidebarStoreList.storeListItem.params") }}</h2>
            <va-data-table
                class="table-crud"
                :items="getParams(item)"
                :columns="[{ key: 'name' }, { key: 'value' }]"
            >
                <template #cell(value)="{ rowIndex }">
                    <va-input
                        class="url-input"
                        :model-value="getParams(item)[rowIndex].value"
                        @update:model-value="
                            setParamValue(item, rowIndex, $event)
                        "
                    ></va-input>
                </template>
            </va-data-table>
        </div>

        <div class="datasource-list">
            <h2>{{ t("SidebarStoreList.storeListItem.events") }}</h2>
            <va-button
                class="datasource-list-add-button"
                @click="addEvent(item.id)"
            >
                {{ t("SidebarStoreList.storeListItem.addEventButton") }}
            </va-button>
            <va-data-table
                class="table-crud"
                :items="item.events"
                :columns="[{ key: 'name' }, { key: 'action' }]"
            >
                <template #cell(name)="{ rowIndex }">
                    <va-input
                        class="event-name-input"
                        @blur="updateEvents(item)"
                        v-model="item.events[rowIndex].name"
                    ></va-input>
                </template>
                <template #cell(action)="{ rowIndex }">
                    <va-input
                        class="event-action-input"
                        @blur="updateEvents(item)"
                        v-model="item.events[rowIndex].action"
                    />
                </template>
            </va-data-table>
        </div>
    </div>
</template>
