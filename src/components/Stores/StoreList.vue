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
import { useStoreManager } from "../../composables/storeManager";
import { onMounted, ref, watch } from "vue";
import StoreListItem from "./ListItems/StoreListItem.vue";
import XMLAStoreListItem from "./ListItems/XMLAStoreListItem.vue";
import CSVStoreListItem from "./ListItems/CSVStoreListItem.vue";


const { t } = useI18n();
const storeManager = useStoreManager();
const map = storeManager.getStoreList();
const list = ref([] as IStore[]);
const tabs = ["REST", "XMLA", "CSV"];
const currentTab = ref(0);
let filteredList = ref([] as IStore[]);

watch(
    map,
    () => {
        list.value = Array.from(map.value, function (entry) {
            return entry[1];
        });
    },
    { deep: true },
);

onMounted(() => {
    list.value = Array.from(map.value, function (entry) {
        return entry[1];
    });
});

watch([() => list.value, () => currentTab.value], ([newList, _]) => {
    filteredList.value = newList.filter(
        (item) => item.type === tabs[currentTab.value],
    );
});
</script>

<template>
    <va-tabs v-model="currentTab" hidePagination color="info">
        <template #tabs>
            <va-tab v-for="tab in tabs" :key="tab">
                {{ tab }}
            </va-tab>
        </template>
        <va-list>
            <template v-if="filteredList?.length">
                <div
                    v-for="(item, index) in filteredList"
                    :key="index"
                    class="store-item"
                >
                    <template
                        v-if="
                            item.type === 'REST' &&
                            item.type === tabs[currentTab]
                        "
                    >
                        <store-list-item :item="item"></store-list-item>
                    </template>
                    <template
                        v-else-if="
                            item.type === 'XMLA' &&
                            item.type === tabs[currentTab]
                        "
                    >
                        <XMLAStoreListItem :item="item"></XMLAStoreListItem>
                    </template>
                    <template
                        v-else-if="
                            item.type === 'CSV' &&
                            item.type === tabs[currentTab]
                        "
                    >
                        <CSVStoreListItem :item="item"></CSVStoreListItem>
                    </template>
                </div>
            </template>
            <template v-else>{{
                t("SidebarStoreList.noAvailableStores")
            }}</template>
        </va-list>
    </va-tabs>
</template>

<style lang="scss">
.va-tabs {
    width: 100%;
    height: 100%;

    &__content {
        width: 100%;
    }

    &__wrapper {
        margin-bottom: 20px;
    }
}

.connections-list {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.connections-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
        height: 36px;
        margin: 0 0 0 12px;
    }
}

.datasource-list {
    padding-top: 20px;
    margin-top: 8px;
    border-top: 1px solid silver;
}

.datasource-list > h2 {
    margin-bottom: 8px;
}

.datasource-list-add-button {
    margin-bottom: 0.5rem;
}

.store-item {
    padding: 0;
    border: 1px solid silver;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
}

.store-item-header {
    padding: 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}

.store-item-header-text {
    width: 100%;
    font-size: 18px;
    font-weight: 600;
    color: var(--va-primary);
}

.store-item-content {
    padding: 0.75rem;
    border-top: 1px solid silver;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.caption-input {
    width: 90px;
}

.type-input {
    width: 80px;
    z-index: 1000000;
}

.url-input {
    width: 170px;
}

.event-name-input {
    width: 120px;
}

.event-action-input {
    width: 230px;
}
.va-dropdown__content.va-select-dropdown__content.va-dropdown__content-wrapper {
    z-index: 1000000 !important;
}
</style>
