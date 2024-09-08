<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { onMounted, ref, type Ref } from "vue";
import { useStoreManager } from "@/composables/storeManager";
import { useI18n } from "vue-i18n";
import FilterSelectionModal from "@/components/Modals/FilterSelectionModal.vue";

const { t } = useI18n();
const storeSelectionOpened = ref(false);
const props = defineProps(["component"]) as any;
const storeId = ref(props.component.store?.id);
const storeManager = useStoreManager();

let stores = ref([]) as Ref<any[]>;

const getStores = () => {
    const storeList = storeManager.getStoreList();

    stores.value = Array.from(storeList.value, function (entry) {
        return { ...entry[1] };
    });
};

const updateStore = async (storeIdSelected) => {
    storeId.value = storeIdSelected;
    props.component.setStore(storeManager.getStore(storeIdSelected));
};

onMounted(() => {
    getStores();
});
</script>

<template>
    <div class="mt-4 mb-4">
        <va-collapse v-model="storeSelectionOpened" header="Request settings">
            <VaCheckbox
                :model-value="component.settings.sync"
                class="mb-4"
                label="Sync state (Expands and drillthroughs)"
                @update:model-value="component.setSetting('sync', $event)"
            />
            <div class="settings-container">
                <va-divider class="pad_bottom" orientation="left">
                    <span class="px-2">{{ t("Widgets.selectStore") }}</span>
                </va-divider>
                <div class="store_list">
                    <div
                        v-for="store in stores"
                        :key="store.id"
                        class="store_list-item"
                    >
                        <va-radio
                            :model-value="storeId"
                            @update:model-value="updateStore"
                            :option="{
                                text: `${store.caption} ${store.id}`,
                                id: store.id,
                            }"
                            value-by="id"
                            name="store-radio-group"
                        />
                    </div>
                </div>
            </div>
        </va-collapse>
    </div>
</template>
<style>
.store_list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow: auto;
    min-height: 400px;
    max-height: 600px;
    padding: 0.5rem;
    border: 1px solid lightgrey;
    border-radius: 0.5rem;
}

.store_list-item {
    border: 1px solid lightgrey;
    border-radius: 2px;
    padding: 0.25rem;
}
</style>
