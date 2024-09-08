<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { ref, watch } from "vue";
import type { ITChartSettings } from "@/plugins/charts/Chart";

const props = defineProps<{
    settings: ITChartSettings;
    setSetting: (key: string, value: any) => void;
}>();

const opened = ref(false);

const backgroundColors = ref(props.settings.dataSetBackgroundColors.map(color => {
  return {
    color,
    transparency: 99,
  };
}));

const updateBgc = (index, newColor) => {
    backgroundColors.value[index].color = newColor;
    props.settings.dataSetBackgroundColors = backgroundColors.value.map(
        bgc => `${bgc.color}${bgc.transparency.toString().padStart(2, '0')}`
    );
};

const updateTransparency = (index, newTransparency) => {
    backgroundColors.value[index].transparency = newTransparency;
    props.settings.dataSetBackgroundColors = backgroundColors.value.map(
        bgc => `${bgc.color}${bgc.transparency.toString().padStart(2, '0')}`
    );
};

const addBgc = () => {
    backgroundColors.value.push({ color: "", transparency: 99 });
};

const deleteBgc = (id: number) => {
    backgroundColors.value.splice(id, 1);
};

watch(
    backgroundColors.value,
        (nV) => {
            props.settings.dataSetBackgroundColors = nV.map(bgc => bgc.color + bgc.transparency);
        },
        { deep: true }
);
</script>
<template>
  <va-collapse v-model="opened" header="Chart">
        <div class="settings-block mb-3">
            <va-select
                label="Chart Type:"
                :model-value="props.settings.chartType"
                @update:model-value="props.setSetting('chartType', $event)"
                :options="['Bar', 'Line']"
            />
        </div>
        <div class="settings-block mb-3">
              <va-input
                class="title-input"
                label="Title:"
                :model-value="props.settings.title"
                @update:model-value="props.setSetting('title', $event)"
              />
        </div>
        <div class="settings-block mb-3">
              <va-select
                label="Title position:"
                :model-value="props.settings.titlePosition"
                @update:model-value="props.setSetting('titlePosition', $event)"
                :options="['top', 'left', 'bottom', 'right']"
              />
        </div>
        <div class="events-list-label mb-3">
            <h3>Datasets background colors</h3>
                <va-button
                    icon="add"
                    @click="addBgc"
                >
                </va-button>
        </div>
        <div
            v-for="(bgc, index) in backgroundColors"
            :key="index"
            class="background-colors-block mb-3"
        >
            <va-color-input
                class="color-input"
                :model-value="bgc.color"
                @update:model-value="updateBgc(index, $event)"
                label="Background color"
            />
            <va-input
                class="transparency-input ml-2"
                :model-value="bgc.transparency"
                @update:model-value="updateTransparency(index, $event)"
                label="Transparency"
            />
            <va-button
                class="delete-btn mt-3 ml-2"
                preset="plain"
                icon="delete"
                icon-color="#ff0000"
                @click="deleteBgc(index)"
            />
        </div>
        <div class="settings-block mb-3">
            <va-select
                label="Legend position:"
                :model-value="props.settings.legendPosition"
                @update:model-value="props.setSetting('legendPosition', $event)"
                :options="['top', 'left', 'bottom', 'right', 'chartArea']"
            />
        </div>
        <div class="settings-block mb-3">
            <va-color-input
                class="color-input"
                label="Border color:"
                :model-value="props.settings.borderColor"
                @update:model-value="props.setSetting('borderColor', $event)"
            />
        </div>
        <div class="settings-block mb-3">
            <va-color-input
                class="color-input"
                label="Canvas background color:"
                :model-value="props.settings.canvasBackgroundColor"
                @update:model-value="props.setSetting('canvasBackgroundColor', $event)"
            />
        </div>
    </va-collapse>
</template>