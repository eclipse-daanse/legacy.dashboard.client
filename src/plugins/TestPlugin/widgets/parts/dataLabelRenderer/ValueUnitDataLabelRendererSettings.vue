<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>

import {ref, onMounted, computed, type Ref, type UnwrapRef} from "vue";
import type {IMapProps} from "@/plugins/TestPlugin/widgets/api/MapPreview";
import type {IDataPoint} from "@/plugins/TestPlugin/widgets/api/Datapoint";
import type {IUnitPoint} from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRenderer.vue";
import type {Store} from "@/stores/Widgets/Store";
import type {XMLAStore} from "@/stores/Widgets/XMLAStore";

export interface IValueUnitDataLabelRendererComonent {
    settings: IUnitPoint;
    setSetting: (key: string, value: any) => void;
}

const {component} = defineProps<{ component: IValueUnitDataLabelRendererComonent }>();

const opened: Ref<UnwrapRef<{ textSection: boolean }>> = ref({
    textSection: true,
});


</script>

<template>
    <va-collapse
        v-model="opened.textSection"
        header="Style settings">
        <div class="settings-container">
            <va-input
                v-model="component.settings.unit"
                label="unit"
                @update:model-value="component.setSetting('unit', $event)"/>
            <va-input
                v-model="component.settings.prefix"
                label="Prefix"
                @update:model-value="component.setSetting('prefix', $event)"/>
            <va-input
                v-model="component.settings.suffix"
                label="suffix"
                @update:model-value="component.setSetting('suffix', $event)"/>
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

.icons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-height: 220px;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    cursor: pointer;
    padding: 10px;
}

.material-symbols-outlined {
    font-family: Material Symbols Outlined sans-serif;
    font-weight: normal;
    font-style: inherit;
    font-size: 40px;
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    border: 2px solid transparent;
    border-radius: 5px;
    transition: border-color 0.5s ease, transform 0.5s ease;
}

.material-symbols-outlined:hover {
    transform: scale(1.1);
}

.active-icon {
    border: 2px solid rgb(0, 121, 0);
}

.slider {
    padding: 0 10px;
}
</style>
