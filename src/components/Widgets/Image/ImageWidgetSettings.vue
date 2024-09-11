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
import { v4 } from "uuid";
import { ref, onMounted, type Ref } from "vue";
import { useStoreManager } from "@/composables/storeManager";
import type {
    CollapseState,
    ImageGalleryItem,
    GallerySettings,
} from "@/@types/widgets";
import type { Store } from "@/stores/Widgets/Store";
import type { XMLAStore } from "@/stores/Widgets/XMLAStore";

export interface ImageComponentSettings {
    images: ImageGalleryItem[];
    imagesSettings: GallerySettings;
}

export interface ImageComponent {
    store: Store | XMLAStore;
    settings: ImageComponentSettings;
    setSetting: (key: string, value: any) => void;
    setStore: (store: Store | XMLAStore) => void;
    loading: boolean;
}

const { t } = useI18n();
const { component } = defineProps<{ component: ImageComponent }>();

const opened: Ref<CollapseState> = ref({
    widgetSection: false,
    storeSection: false,
});

const storeManager = useStoreManager();
let stores: Ref<any[]> = ref([]) as Ref<any[]>;
const requestResult: Ref<string> = ref("");

const addNew = () => {
    const images = component.settings.images;

    images?.push({
        id: v4(),
        url: "Test",
    });
};

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
    <va-collapse v-model="opened.widgetSection" header="Image widget settings">
        <div class="settings-container">
            <va-button @click="addNew">{{
                t("ImageWidget.addButton")
            }}</va-button>
            <div class="image-list-container">
                <div
                    v-for="(image, index) in component.settings.images"
                    :key="image.id"
                    class="image-settings-container"
                >
                    <va-input
                        v-model="image.url"
                        :label="t('ImageWidget.imageUrl')"
                        class="image-settings-remove-input"
                        @update:model-value="
                            component.setSetting('images.url', $event)
                        "
                    />
                    <va-button
                        @click="
                            () => component.settings.images.splice(index, 1)
                        "
                        icon="clear"
                        class="image-settings-remove-button"
                    />
                    <!-- {{ image.url }} -->
                </div>
            </div>
            <va-select
                :model-value="component.settings.imagesSettings.fit"
                :label="t('ImageWidget.imageFit')"
                :options="['Cover', 'Contain', 'Stretch', 'Fill', 'None']"
                @update:model-value="component.setSetting('imagesSettings.fit', $event)"
            >
            </va-select>
            <va-input
                :model-value="component.settings.imagesSettings.diashowInterval"
                :label="t('ImageWidget.imageDiashowInterval')"
                @update:model-value="
                    component.setSetting('imagesSettings.diashowInterval', $event)
                "
            >
            </va-input>
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
.image-settings-container {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 1rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
}

.image-settings-remove-button {
    margin-bottom: 0.25rem;
}

.image-settings-remove-input {
    flex-grow: 1;
}

.settings-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.image-list-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 500px;
    overflow: auto;
    padding: 0.5rem;
    border-radius: 0.5rem;
}

.loading {
    height: 100%;
    padding: 50px;
    border-radius: 4px;
    margin-bottom: 1rem;
    background-color: var(--app-response-background);
}
</style>
