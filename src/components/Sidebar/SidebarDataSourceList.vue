<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useDatasourceManager } from "@/composables/datasourceManager";

const { t } = useI18n();

const dsManager = useDatasourceManager();
const dsmap = dsManager.getDatasourceList();
const dataSourceList = computed(() =>
    Object.entries(dsmap.value).map(([key, ds]) => ({
        id: key,
        caption: ds.caption || "no caption",
        url: ds.url || "no url",
        type: ds.type || "unknown",
    })),
);

const deleteDatasource = (id: string) => {
    dsManager.deleteDatasource(id);
};
</script>

<template>
    <div class="ds-settings">
        <div class="ds-settings-title">
            <h2>{{ t("SidebarDatasourceList.title") }}</h2>
            <va-data-table
                :columns="[{ key: 'url'}, { key: 'caption' }, { key: 'type' }, { key: 'deletion' }]"
                :items="dataSourceList"
            >
                <template #cell(deletion)="{ row }">
                    <va-button color="danger" icon="delete" @click="deleteDatasource(row.cells[0].value)">
                    </va-button>
                </template>
            </va-data-table>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.ds-settings {
    display: flex;
    flex-direction: column;
    align-items: start;
    padding: 32px;
    width: 100%;
}

.ds-settings-title {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.ds-settings-title > h2 {
    font-size: 24px;
    flex-grow: 1;
    margin-bottom: 32px;
}
</style>
