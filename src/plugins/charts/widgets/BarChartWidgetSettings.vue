<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { onMounted } from "vue";
import type { IChartComponent } from "@/plugins/charts/Chart";
import ChartSettingsSection from "@/plugins/charts/widgets/ChartSettingsSection.vue";
import AxesSettingsSection from "@/plugins/charts/widgets/AxesSettingsSection.vue";
import GridSettingsSection from "@/plugins/charts/widgets/GridSettingsSection.vue";
import DataSettingsSection from "@/plugins/charts/widgets/DataSettingsSection.vue";

const { component } = defineProps<{ component: IChartComponent }>();

onMounted(() => {});
</script>

<template>
    <ChartSettingsSection
        :settings="component.settings"
        :setSetting="component.setSetting"
    />
    <AxesSettingsSection
        :settings="component.settings"
        :setSetting="component.setSetting"
    />
    <GridSettingsSection
        :settings="component.settings"
        :setSetting="component.setSetting"
    />
    <DataSettingsSection
        :component="component"
    />
</template>
<style lang="scss">
.settings-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
}

.settings-block {
    display: flex;
    flex-direction: column;
}

.background-colors-block {
    display: flex;
    flex-direction: row;
}

.transparency-input {
    width: 120px;
}

.text-title,
.title-input,
.color-input {
    width: 100%;
}

.text-size {
    width: 63px;
    margin-left: 12px;
}

.text-color {
    width: 156px;
}

.text-weight {
    width: 100px;
}

.align-buttons-group {
    display: flex;
    align-items: flex-end;

    .button-group {
        padding: 2px;
    }

    .align-button {
        &:hover {
            --va-background-color: rgb(162, 181, 218) !important;
        }

        &:nth-child(4) {
            // padding-left: 10px;
        }
    }
}
</style>
