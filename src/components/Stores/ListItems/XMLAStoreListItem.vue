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
import { onMounted, ref, watch, onActivated, computed } from "vue";
import QueryDesigner from "../../Common/QueryDesigner.vue";
import type XMLADatasource from "@/dataSources/XmlaDatasource";
import { type XMLAStore } from "@/stores/Widgets/XMLAStore";

const { t } = useI18n();
const storeManager = useStoreManager();
const dslist = ref([] as XMLADatasource[]);

const catalogs = ref([] as DBSchemaCatalog[]);
const selectedCatalog = ref({} as DBSchemaCatalog);

const cubes = ref([] as MDSchemaCube[]);
const selectedCube = ref({} as MDSchemaCube);
const selectedDatasourceId = ref("");
const selectedDatasource = ref({
    url: "",
    caption: "",
    id: "",
});

watch(
    () => selectedDatasourceId.value,
    (nV) => {
        const currentDs = dslist.value.find((item) => item.id === nV);
        if (!currentDs) {
            return;
        }

        selectedDatasource.value = currentDs;
        const store = storeManager.getStore(item.value.id);
        store.setDatasource(currentDs.id);

        selectedCatalog.value = currentDs.catalog || {
            CATALOG_NAME: "",
            DESCRIPTION: "",
        };
        selectedCube.value = currentDs.cube || {
            CUBE_NAME: "",
            CUBE_CAPTION: "",
        };

        getCatalogs();

        if (selectedCatalog.value.CATALOG_NAME) {
            getCubes();
        } else {
            cubes.value = [];
        }

        if (selectedCube.value.CUBE_NAME) {
            getMetadata();
        }
    },
    {
        deep: true,
    },
);

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
            .map((entry) => {
                return entry[1];
            })
            .filter((e) => e.type === "XMLA") as XMLADatasource[];
    },
    { deep: true },
);

onActivated(() => {
    dslist.value = Object.entries(dsmap.value)
        .map((entry) => {
            return entry[1];
        })
        .filter((e) => e.type === "XMLA") as XMLADatasource[];
});

onMounted(async () => {
    dslist.value = Object.entries(dsmap.value)
        .map((entry) => {
            return entry[1];
        })
        .filter((e) => e.type === "XMLA") as XMLADatasource[];

    const store = storeManager.getStore(item.value.id);
    const ds = store.getDatasource();

    if (ds) {
        selectedDatasourceId.value = ds.id;
    }

    const dsSelected = getSelectedDatasource();
    selectedCatalog.value = dsSelected?.catalog || {
        CATALOG_NAME: "",
        DESCRIPTION: "",
    };
    selectedCube.value = dsSelected?.cube || {
        CUBE_NAME: "",
        CUBE_CAPTION: "",
    };

    await getCatalogs();

    if (selectedCatalog.value.CATALOG_NAME) {
        await getCubes();
    }
    if (selectedCube.value.CUBE_NAME) {
        await getMetadata();
    }
});

const saveStore = (item) => {
    const store = storeManager.getStore(item.id);
    store.setOptions({
        caption: item.caption,
    });
};

const createDatasource = () => {
    const id = dsManager.initDatasource("XMLA", "New store");
    selectedDatasourceId.value = id;

    selectedCatalog.value = {
        CATALOG_NAME: "",
        DESCRIPTION: "",
    };
    selectedCube.value = {
        CUBE_NAME: "",
        CUBE_CAPTION: "",
    };
    cubes.value = [];
};

const updateDatasource = ({
    caption,
    url,
    cube,
    catalog,
}: {
    id?: string;
    type?: string;
    caption?: string;
    url?: string;
    cube?: MDSchemaCube;
    catalog?: DBSchemaCatalog;
}) => {
    const ds = dsManager.getDatasource(
        selectedDatasource.value.id,
    ) as XMLADatasource;
    if (!ds) return;

    dsManager.updateDatasource(
        ds.id,
        ds.type,
        caption ?? ds.caption,
        url ?? ds.url,
        cube ?? ds.cube,
        catalog ?? ds.catalog,
    );
};

const getSelectedDatasource = (): XMLADatasource => {
    const store = storeManager.getStore(item.value.id);
    const selectedDatasource = store.datasourceId;

    return dslist.value.find((e) => {
        return selectedDatasource === e.id;
    }) as XMLADatasource;
};

const getCatalogs = async () => {
    const selectedDatasource = getSelectedDatasource();
    if (!selectedDatasource) {
        return;
    }

    catalogs.value = await selectedDatasource.getCatalogs();

    updateDatasource({ catalog: selectedCatalog.value });
};

const getCubes = async () => {
    const selectedDatasource = getSelectedDatasource();

    if (!selectedDatasource || !selectedCatalog.value) {
        return;
    }

    selectedDatasource.setCatalog(selectedCatalog.value);

    cubes.value = await selectedDatasource.getCubes(
        selectedCatalog.value.CATALOG_NAME,
    );

    updateDatasource({ cube: selectedCube.value });
};

const getMetadata = async () => {
    const selectedDatasource = getSelectedDatasource();

    if (!selectedDatasource || !selectedCube.value) {
        return;
    }

    selectedDatasource.setCube(selectedCube.value);
    await selectedDatasource.openCube(
        selectedCatalog.value.CATALOG_NAME,
        selectedCube.value.CUBE_NAME,
    );
};

const deleteStore = () => {
    storeManager.deleteStore(item.value.id);
    console.log(storeManager.getStoreList().value);
};

const deleteDatasource = () => {
    if (selectedDatasourceId.value) {
        dsManager.deleteDatasource(selectedDatasourceId.value);
        selectedDatasourceId.value = "";
        selectedDatasource.value = { url: "", caption: "", id: "" };
    }
};

const rows = computed(() => {
    console.log("rows computed");
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    return store.XMLARequestParams.rows;
});

const setRows = (rows) => {
    console.log("setRows", rows);
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    store.setRows(rows);
};

const columns = computed(() => {
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    return store.XMLARequestParams.columns;
});

const setCols = (cols) => {
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    store.setCols(cols);
};

const measures = computed(() => {
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    return store.XMLARequestParams.measures;
});

const setMeasures = (measures) => {
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    store.setMeasures(measures);
};

const filters = computed(() => {
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    return store.XMLARequestParams.filters;
});

const setFilters = (filters) => {
    const store = storeManager.getStore(item.value.id) as XMLAStore;
    store.setFilters(filters);
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
        <va-button @click.stop="deleteStore" icon="clear" color="transparent">
        </va-button>
    </div>
    <div v-if="isExpanded" class="store-item-content">
        <va-input
            :label="t('SidebarStoreList.caption')"
            v-model="item.caption"
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
                    class="datasource-list-delete-button"
                    color="danger"
                    @click="deleteDatasource"
                    :disabled="!selectedDatasourceId"
                >
                    Delete
                </va-button>
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
                        @blur="
                            updateDatasource({
                                caption: selectedDatasource.caption,
                            })
                        "
                        v-model="selectedDatasource.caption"
                        :label="t('SidebarStoreList.StoreLabels.caption')"
                    ></va-input>
                    <va-input
                        class="mt-3"
                        @blur="
                            updateDatasource({ url: selectedDatasource.url })
                        "
                        v-model="selectedDatasource.url"
                        :label="t('SidebarStoreList.StoreLabels.url')"
                    ></va-input>
                </div>
            </template>
            <template v-if="selectedDatasource.id">
                <h2 class="mt-3">
                    {{ t("SidebarStoreList.XMLAStoreListItem.catalog") }}:
                </h2>
                <div class="connections-list">
                    <va-select
                        text-by="CATALOG_NAME"
                        v-model="selectedCatalog"
                        @update:modelValue="getCubes"
                        :options="catalogs"
                    />
                </div>
                <template v-if="Object.keys(selectedCatalog).length">
                    <h2 class="mt-3">
                        {{ t("SidebarStoreList.XMLAStoreListItem.cube") }}:
                    </h2>
                    <div class="connections-list">
                        <va-select
                            text-by="CUBE_NAME"
                            v-model="selectedCube"
                            @update:modelValue="getMetadata"
                            :options="cubes"
                        />
                    </div>
                </template>
            </template>
            <template
                v-if="selectedCatalog.CATALOG_NAME && selectedCube.CUBE_NAME"
            >
                <QueryDesigner
                    style="margin-top: 2rem"
                    :store="storeManager.getStore(item.id)"
                    :currentState="{
                        rows,
                        columns,
                        measures,
                        filters,
                    }"
                    @update:cols="setCols"
                    @update:rows="setRows"
                    @update:measures="setMeasures"
                    @update:filters="setFilters"
                />
            </template>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.store-item-header {
    cursor: pointer;
}
</style>
