<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface IRepeatableSVGSettings {
    src: string;
    activeItemStyles: {
        fill: string;
        stroke: string;
    };
    defaultItemStyles: {
        fill: string;
        stroke: string;
    };
    repeations: string;
    progress: string;
}

export interface IRepeatableSVGComponent {
    store: Store | XMLAStore;
    settings: IRepeatableSVGSettings;
    setSetting: (key: string, value: any) => void;
    setStore: (store: Store | XMLAStore) => void;
    loading: boolean;
}

import { useI18n } from "vue-i18n";
import { ref, type Ref, onMounted } from "vue";
import { useStoreManager } from "@/composables/storeManager";
import type { Store } from "@/stores/Widgets/Store";
import type { XMLAStore } from "@/stores/Widgets/XMLAStore";
import type { CollapseState } from "@/@types/widgets";

const { t } = useI18n();
const { component } = defineProps<{ component: IRepeatableSVGComponent }>();

const opened: Ref<CollapseState> = ref({
    widgetSection: false,
    storeSection: false,
});

const storeManager = useStoreManager();
const stores: Ref<any[]> = ref([]) as Ref<any[]>;
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
    console.log(component);
    getData();
};

onMounted(() => {
    getStores();
    if (component.store) {
        getData();
    }
});
</script>

<template>
    <va-collapse
        v-model="opened.widgetSection"
        :header="t('RepeatableSvgWidget.title')"
    >
        <div class="settings-container">
            <va-input
                :model-value="component.settings.src"
                :label="t('RepeatableSvgWidget.label')"
                @update:model-value="component.setSetting('src', $event)"
            />
            <va-input
                :model-value="component.settings.repeations"
                :label="t('RepeatableSvgWidget.repeations')"
                @update:model-value="component.setSetting('repeations', $event)"
            />
            <va-input
                :model-value="component.settings.progress"
                :label="t('RepeatableSvgWidget.progress')"
                @update:model-value="component.setSetting('progress', $event)"
            />
            <div class="colors">
                <va-color-input
                    class="color-input"
                    :model-value="component.settings.activeItemStyles.fill"
                    :label="t('RepeatableSvgWidget.activeItemFill')"
                    @update:model-value="component.setSetting('activeItemStyles.fill', $event)"
                />
                <va-color-input
                    class="color-input"
                    :model-value="component.settings.activeItemStyles.stroke"
                    :label="t('RepeatableSvgWidget.activeItemStroke')"
                    @update:model-value="component.setSetting('activeItemStyles.stroke', $event)"
                />
            </div>
            <div class="colors">
                <va-color-input
                    class="color-input"
                    :model-value="component.settings.defaultItemStyles.fill"
                    :label="t('RepeatableSvgWidget.defaultItemFill')"
                    @update:model-value="component.setSetting('defaultItemStyles.fill', $event)"
                />
                <va-color-input
                    class="color-input"
                    :model-value="component.settings.defaultItemStyles.stroke"
                    :label="t('RepeatableSvgWidget.defaultItemStroke')"
                    @update:model-value="component.setSetting('defaultItemStyles.stroke', $event)"
                />
            </div>
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
.colors {
    display: flex;
    justify-content: space-between;
}
.color-input {
    width: 49%;
}

.loading {
    height: 100%;
    padding: 50px;
    border-radius: 4px;
    margin-bottom: 1rem;
    background-color: var(--app-response-background);
}
</style>
