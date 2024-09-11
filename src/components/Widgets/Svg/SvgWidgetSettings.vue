<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface ISVGSettings {
    src: string;
    classesConfig: Config;
}

export interface ISVGComponent {
    store: Store | XMLAStore;
    settings: ISVGSettings;
    setSetting: (key: string, value: any) => void;
    setStore: (store: Store | XMLAStore) => void;
    loading: boolean;
}

import { useI18n } from "vue-i18n";
import { ref, type Ref, watch, onMounted } from "vue";
import { useStoreManager } from "@/composables/storeManager";
import type { Store } from "@/stores/Widgets/Store";
import type { XMLAStore } from "@/stores/Widgets/XMLAStore";
import type { CollapseState, StyleFields, Config } from "@/@types/widgets";

const { t } = useI18n();
const { component } = defineProps<{ component: ISVGComponent }>();

const opened: Ref<CollapseState> = ref({
    widgetSection: false,
    storeSection: false,
});

const storeManager = useStoreManager();
let stores: Ref<any[]> = ref([]) as Ref<any[]>;
const requestResult: Ref<string> = ref("");

const getStores = () => {
    const storeList = storeManager.getStoreList();

    stores.value = Array.from(storeList.value, function (entry) {
        return { ...entry[1] };
    });
};

const getData = async () => {
    const store = component.store as Store;

    const data = await store.getData();
    requestResult.value = JSON.stringify(data, null, 2);
};

const updateStore = (storeId) => {
    const store = storeManager.getStore(storeId) as Store;
    component.setStore(store);
    getData();
};

onMounted(() => {
    getStores();
    if (component.store) {
        getData();
    }
});

const fields: Ref<StyleFields[]> = ref([
    {
        className: "primary",
        fill: "#ff5733",
        stroke: "#1e8449",
        strokeWidth: "5",
    },
]);

const addItems = () => {
    fields.value.push({
        className: "",
        fill: "",
        stroke: "",
        strokeWidth: "",
    });
};

watch(
    fields,
    () => {
        const config: Config = {};
        fields.value.forEach(({ className, fill, stroke, strokeWidth }) => {
            if (!config[className]) {
                config[className] = { fill, stroke, strokeWidth };
            }
        }, {});
        component.settings.classesConfig = { ...config };
    },
    { deep: true },
);
</script>

<template>
    <va-collapse v-model="opened.widgetSection" :header="t('SvgWidget.title')">
        <div class="settings-container">
            <va-input
                :model-value="component.settings.src"
                :label="t('SvgWidget.svgSrc')"
                @update:model-value="component.setSetting('url', $event)"
            />
            <va-button class="add-button" @click="addItems">
                {{ t("SvgWidget.addButton") }}
            </va-button>
            <va-data-table
                class="table-config"
                :items="fields"
                :columns="[
                    { key: 'className' },
                    { key: 'fill' },
                    { key: 'stroke' },
                    { key: 'strokeWidth' },
                ]"
            >
                <template #cell(className)="{ rowIndex }">
                    <va-input
                        class="input-class-name"
                        v-model="fields[rowIndex].className"
                        @update:model-value="
                            component.setSetting('className', $event)
                        "
                    />
                </template>
                <template #cell(fill)="{ rowIndex }">
                    <va-color-input
                        class="color-fill"
                        v-model="fields[rowIndex].fill"
                        @update:model-value="
                            component.setSetting('fill', $event)
                        "
                    />
                </template>
                <template #cell(stroke)="{ rowIndex }">
                    <va-color-input
                        class="color-stroke"
                        v-model="fields[rowIndex].stroke"
                        @update:model-value="
                            component.setSetting('stroke', $event)
                        "
                    />
                </template>
                <template #cell(strokeWidth)="{ rowIndex }">
                    <va-input
                        class="input-stroke-width"
                        v-model="fields[rowIndex].strokeWidth"
                        @update:model-value="
                            component.setSetting('strokeWidth', $event)
                        "
                    />
                </template>
            </va-data-table>
        </div>
    </va-collapse>
    <va-collapse
        v-model="opened.storeSection"
        :header="t('Widgets.storeSettingsTitle')"
    >
        <div class="settings-container">
            <div>
                <h3 class="mb-2">{{ t("Widgets.selectStore") }}</h3>
                <div class="mb-2" v-for="store in stores" :key="store.id">
                    <va-radio
                        :model-value="component.store?.id"
                        @update:model-value="updateStore"
                        :option="{
                            text: `${store.caption} ${store.id}`,
                            id: store.id,
                        }"
                        value-by="id"
                        name="store-radio-group"
                    />
                </div>
                <pre v-if="!component.loading" class="response">{{ requestResult }}</pre>
                <div v-else="component.loading" class="loading">
                    <va-inner-loading class="loader" :loading="component.loading" :size="55"></va-inner-loading>
                </div>
            </div>
        </div>
    </va-collapse>
</template>
<style scoped>
.settings-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
}

.input-class-name {
    width: 100px;
}

.color-fill {
    width: 100px;
}

.color-stroke {
    width: 100px;
}

.input-stroke-width {
    width: 50px;
}

.add-button {
    width: 33%;
}

.loading {
    height: 100%;
    padding: 50px;
    border-radius: 4px;
    margin-bottom: 1rem;
    background-color: var(--app-response-background);
}
</style>
