<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface IProgressSettings {
    progress: string;
    fillColor: string;
    gradientColor: string;
    backgroundColor: string;
    isGradient: boolean;
    isVertical: boolean;
    rotation: number;
}

export interface IProgressComponent {
    store: Store | XMLAStore;
    settings: IProgressSettings;
    setSetting: (key: string, value: any) => void;
    setStore: (store: Store | XMLAStore) => void;
    loading: boolean;
}

import { useI18n } from "vue-i18n";
import { ref, watch, onMounted, type Ref } from "vue";
import { useStoreManager } from "@/composables/storeManager";
import type { Store } from "@/stores/Widgets/Store";
import type { XMLAStore } from "@/stores/Widgets/XMLAStore";
import type { CollapseState, GradientPart } from "@/@types/widgets";

const { t } = useI18n();
const { component } = defineProps<{ component: IProgressComponent }>();

const opened: Ref<CollapseState> = ref({
    widgetSection: false,
    storeSection: false,
});

const storeManager = useStoreManager();
let stores: Ref<any[]> = ref([]);
const requestResult: Ref<string> = ref("");

const gradientFields: Ref<GradientPart[]> = ref([]);

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

const addItem = () => {
    return gradientFields.value.push({
        color:
            "#" +
            (
                "000000" + Math.floor(Math.random() * 16777215).toString(16)
            ).slice(-6),
        location: Math.floor(Math.random() * 101),
    });
};

watch(
    [() => component.settings.fillColor, () => gradientFields.value],
    ([color, fields]) => {
        if (component.settings.isGradient) {
            fields.length < 1
                ? component.setSetting(
                      "gradientColor",
                      `${color} 0%, #FAFAFA 85%`,
                  )
                : component.setSetting(
                      "gradientColor",
                      fields
                          .map((v: GradientPart) => `${v.color} ${v.location}%`)
                          .join(", "),
                  );
        }
    },
    { deep: true },
);

watch(
    () => component.settings.isGradient,
    (newValue) => {
        newValue === true
            ? gradientFields.value.push(
                  { color: `${component.settings.fillColor}`, location: 0 },
                  { color: "#FAFAFA", location: 85 },
              )
            : (gradientFields.value = []);
    },
);

const deleteField = (id: number) => {
    gradientFields.value = gradientFields.value.filter((_, i) => i !== id);
};

watch(
    () => component.settings.progress,
    (newValue) => {
        if (typeof newValue === "string") {
            const allowDot = !newValue.includes(".");
            const sanitizedValue = newValue.replace(/,/g, ".");
            const numericValue = parseFloat(sanitizedValue);

            if (!isNaN(numericValue) && allowDot) {
                const clampedValue = Math.max(0, Math.min(1, numericValue));
                component.setSetting("progress", String(clampedValue));
            } else {
                component.setSetting("progress", newValue);
            }
        }
    },
);
</script>

<template>
    <va-collapse
        v-model="opened.widgetSection"
        :header="t('ProgressWidget.title')"
    >
        <div class="settings-container">
            <va-input
                :model-value="component.settings.progress"
                :label="t('ProgressWidget.progress')"
                @update:model-value="component.setSetting('progress', $event)"
            />
            <va-color-input
                :model-value="component.settings.fillColor"
                :label="t('ProgressWidget.fillColor')"
                @update:model-value="component.setSetting('fillColor', $event)"
            />
            <va-color-input
                :model-value="component.settings.backgroundColor"
                :label="t('ProgressWidget.backgroundColor')"
                @update:model-value="
                    component.setSetting('backgroundColor', $event)
                "
            />
            <va-checkbox
                :model-value="component.settings.isVertical"
                :label="t('ProgressWidget.isVertical')"
                @update:model-value="component.setSetting('isVertical', $event)"
            />
            <va-checkbox
                :model-value="component.settings.isGradient"
                :label="t('ProgressWidget.isGradient')"
                @update:model-value="component.setSetting('isGradient', $event)"
            />
        </div>
        <div class="mt-3" v-if="component.settings.isGradient">
            <va-button class="add-btn" @click="addItem">
                {{ t("ProgressWidget.addButton") }}
            </va-button>
            <div>
                <va-input
                    class="mt-2"
                    :model-value="component.settings.rotation"
                    :label="t('ProgressWidget.rotation')"
                    @update:model-value="
                        component.setSetting('rotation', $event)
                    "
                />
                <va-data-table
                    class="table-config"
                    :items="gradientFields"
                    :columns="[
                        { key: 'color' },
                        { key: 'location' },
                        { key: 'actions' },
                    ]"
                >
                    <template #cell(color)="{ rowIndex }">
                        <va-color-input
                            class="input-color"
                            v-model="gradientFields[rowIndex].color"
                        />
                    </template>
                    <template #cell(location)="{ rowIndex }">
                        <va-input
                            class="input"
                            v-model="gradientFields[rowIndex].location"
                        />
                    </template>
                    <template #cell(actions)="{ rowIndex }">
                        <va-button
                            icon="delete"
                            color="danger"
                            @click="deleteField(rowIndex)"
                        />
                    </template>
                </va-data-table>
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
.add-btn {
    width: 150px;
}
.input {
    width: 100px;
}

.loading {
    height: 100%;
    padding: 50px;
    border-radius: 4px;
    margin-bottom: 1rem;
    background-color: var(--app-response-background);
}
</style>
