<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useStoreManager } from "../../../composables/storeManager";
import { useDatasourceManager } from "../../../composables/datasourceManager";
import { type Ref, onMounted, ref, watch } from "vue";


// TODO: fix duplicate interface
declare interface IDatasource {
    id: string;
    caption: string;
    url: string;
    type: "REST" | "XMLA" | "CSV" | "JSON" | "MQTT";
    getData: (params: any) => Promise<any>;
}

const { t } = useI18n();
const storeManager = useStoreManager();
const dslist: Ref<IDatasource[]> = ref([]);

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
        dslist.value = Object.entries(dsmap.value).map(([, ds]) => {
            return { ...ds };
        });
    },
    { deep: true },
);

onMounted(() => {
    dslist.value = Object.entries(dsmap.value).map(([, ds]) => {
        return { ...ds };
    });
});

const saveStore = (item) => {
    const store = storeManager.getStore(item.id);
    store.setOptions({
        caption: item.caption,
        requestTemplate: item.requestTemplate,
    });
};

const createDatasource = () => {
    dsManager.initDatasource("REST", "", "");
};

const updateDatasource = (index) => {
    const datasourceToUpdate = dslist.value[index];
    const ds = dsManager.getDatasource(datasourceToUpdate.id);
    if (ds) {
        ds.caption = datasourceToUpdate.caption;
        ds.url = datasourceToUpdate.url;

        if (ds.type !== datasourceToUpdate.type) {
            dsManager.updateDatasource(
                datasourceToUpdate.id,
                datasourceToUpdate.type,
                datasourceToUpdate.caption,
                datasourceToUpdate.url,
            );
        }
    }
};

const addEvent = (id) => {
    const store = storeManager.getStore(id);
    store.events.push({
        name: "",
        action: "",
    });
};

const setSelectedDatasources = (id, currentSelectedItems) => {
    console.log(currentSelectedItems);
    const dsId = currentSelectedItems.map((e) => e.id)[0];
    const store = storeManager.getStore(id);
    store.setDatasource(dsId);
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

const getSelectedDatasource = (item) => {
    const store = storeManager.getStore(item.id);
    const selectedDatasource = store.datasourceId;

    return dslist.value.filter((e: { id: string }) => {
        return e.id === selectedDatasource;
    });
};

const selection = ref('|');
const headers = ref(false);
</script>

<template>

    <div class="store-item-header" @click="clickHeader">
        <va-list-item-label class="store-item-header-text">
            {{ item.caption }}
            <!-- {{ item.id }} -->
        </va-list-item-label>
        <va-icon v-if="!isExpanded" class="material-icons"> expand_more </va-icon>
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
            <h2>{{ t('SidebarStoreList.dataSourcesTitle') }}</h2>
            <va-button class="datasource-list-add-button" @click="createDatasource">
                {{ t('SidebarStoreList.addDatasourceButton') }}
            </va-button>
            <va-data-table
                class="table-crud"
                :items="dslist"
                :columns="[{ key: 'caption' }, { key: 'type' }, { key: 'url' }]"
                :model-value="getSelectedDatasource(item)"
                selectable
                select-mode="single"
                @update:model-value="setSelectedDatasources(item.id, $event)"
            >
                <template #cell(caption)="{ rowIndex }">
                    <va-input
                        class="caption-input"
                        @blur="updateDatasource(rowIndex)"
                        v-model="dslist[rowIndex].caption"
                    ></va-input>
                </template>
                <template #cell(type)="{ rowIndex }">
                    <va-select
                        class="type-input"
                        v-model="dslist[rowIndex].type"
                        @update:modelValue="updateDatasource(rowIndex)"
                        :options="Object.keys(dsManager.getDataSourceRegistry())"
                    />
                </template>
                <template #cell(url)="{ rowIndex }">
                    <va-input
                        class="url-input"
                        @blur="updateDatasource(rowIndex)"
                        v-model="dslist[rowIndex].url"
                    ></va-input>
                </template>
            </va-data-table>
        </div>

        <div class="datasource-list">
            <h2>{{ t('SidebarStoreList.storeListItem.params') }}</h2>
            <va-data-table
                class="table-crud"
                :items="getParams(item)"
                :columns="[{ key: 'name' }, { key: 'value' }]"
            >
                <template #cell(value)="{ rowIndex }">
                    <va-input
                        class="url-input"
                        :model-value="getParams(item)[rowIndex].value"
                        @update:model-value="setParamValue(item, rowIndex, $event)"
                    ></va-input>
                </template>
            </va-data-table>
        </div>

        <div class="datasource-list">
            <h2>{{ t('SidebarStoreList.storeListItem.events') }}</h2>
            <va-button class="datasource-list-add-button" @click="addEvent(item.id)">
                {{ t('SidebarStoreList.storeListItem.addEventButton') }}
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
        <div class="separator-list">
            <h2>Delimiter</h2>

            <VaOptionList
                v-model="selection"
                type="radio"
                :options="['|', ';', ',','-',' ', 'tab']"
            />
            <h2>Headers</h2>
            <VaCheckbox
                label="Header in first row"
                v-model="headers"
                />
        </div>
        <<<<>>>>
    </div>
</template>
