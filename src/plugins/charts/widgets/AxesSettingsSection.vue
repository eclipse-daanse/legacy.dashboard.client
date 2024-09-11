<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import type { ITChartSettings } from "@/plugins/charts/Chart";

const props = defineProps<{ 
  settings: ITChartSettings;
  setSetting: (key: string, value: any) => void; 
}>();
const opened = ref(false);
const axes = ref({});

const axis_names = computed(() => {
    //console.log(component.value.settings);
    return Object.keys(props.settings.axes).filter(
        (name) => name !== "y" && name != "x",
    );
});

function addAxis() {
    let name = "y2";

    //component.setSetting('axes.'+name,{
    //let axis =  clone(toRaw(unref(component.settings.axes)));
    let axes = {
        title: {
            display: true,
            text: "Y2",
        },
        ticks: {
            color: "#000"
        },
        type: "linear",
        backgroundColor: "#fff",
        stacked: false,
        weight: 2,
        reverse: false,
        display: true,
        position: "right",
    };
    props.setSetting(`axes.${name}`, axes);
}

watch(
    props.settings.axes,
    (newAxes) => {
        axes.value = { ...newAxes };
    },
    { immediate: true, deep: true },
);

watch(
    axes,
    (newAxes) => {
        props.setSetting("axes", newAxes);
    },
    { deep: true }
);
</script>
<template>
  <va-collapse v-model="opened" header="Axes">
        <div class="settings-container">
            <div class="settings-block" v-if="props">
                <h2 class="mb-2">x-Axis:</h2>

                <div class="settings-block mb-3">
                    <VaSelect
                        label="Type"
                        v-if="axes.x"
                        v-model="axes.x.type"
                        :options="[
                            'timeseries',
                            'linear',
                            'logarithmic',
                            'category',
                        ]"
                        placeholder="Select an header for X"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaColorInput
                        v-model="axes.x.backgroundColor"
                        label="color"
                    />
                </div>
                <div class="settings-block mb-3" >
                    <VaSwitch
                        label="stacked"
                        :model-value="props.settings.axes.x.stacked"
                        @update:model-value="props.setSetting('axes.x.stacked', $event)"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaSwitch
                        label="reverse"
                        v-model="axes.x.reverse"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaSwitch
                        label="display"
                        left-label
                        v-model="axes.x.display"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaInput
                        v-model="axes.x.weight"
                        label="weight"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaInput
                        label="title"
                        :model-value="props.settings.axes.x.text"
                        @update:model-value="props.setSetting('axes.x.text', $event)"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaSelect
                        label="Position"
                        :model-value="props.settings.axes.x.position"
                        @update:model-value="props.setSetting('axes.x.position', $event)"
                        :options="['top', 'bottom']"
                        placeholder="Position"
                    />
                </div>
                <h2 class="mt-3 mb-2">y-Axis:</h2>
                <div class="settings-block mb-3">
                    <VaSelect
                        v-model="axes.y.type"
                        :options="[
                            'timeseries',
                            'linear',
                            'logarithmic',
                            'category',
                        ]"
                        placeholder="Select an header for X"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaColorInput
                    v-model="axes.y.backgroundColor"
                    label="color"
                />
                </div>
                <div class="settings-block mb-3">
                    <VaSwitch
                        label="stacked"
                        v-model="axes.y.stacked"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaSwitch
                        label="reverse"
                        v-model="axes.y.reverse"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaSwitch
                        label="display"
                        left-label
                        v-model="axes.y.display"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaInput
                    v-model="axes.y.weight"
                    label="weight"
                />
                </div>
                <div class="settings-block mb-3">
                    <VaInput
                        label="title"
                        :model-value="props.settings.axes.y.text"
                        @update:model-value="props.setSetting('axes.y.text', $event)"
                    />
                </div>
                <div class="settings-block mb-3">
                    <VaSelect
                        label="Position"
                        :model-value="props.settings.axes.y.position"
                        @update:model-value="props.setSetting('axes.y.position', $event)"
                        :options="['left', 'right']"
                        placeholder="Position"
                    />
                </div>

                <div
                    v-for="additional_name in axis_names"
                    :key="additional_name"
                >
                    <h2 class="mt-3 mb-2">{{ additional_name }}:</h2>
                    <div class="settings-block mb-3">
                        <VaSelect
                            v-model="axes[additional_name].type"
                            :options="['time', 'linear', 'logarithmic', 'category']"
                            placeholder="Select an header for X"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <VaColorInput
                            v-model="axes[additional_name].backgroundColor"
                            label="color"
                        />
                    </div>
                    <!-- <div class="settings-block mb-3">
                        <VaInput
                            label="title"
                            v-model="axes[additional_name].text"
                        />
                    </div> -->
                    <div class="settings-block mb-3">
                        <VaSwitch
                            label="stacked"
                            v-model="axes[additional_name].stacked"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <VaSwitch
                            label="reverse"
                            v-model="axes[additional_name].reverse"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <VaSwitch
                            label="display"
                            left-label
                            v-model="axes[additional_name].display"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <VaInput
                            v-model="axes[additional_name].weight"
                            label="weight"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <VaInput
                            label="title"
                            v-model="axes[additional_name].title.text"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <VaSelect
                            label="Position"
                            v-model="axes[additional_name].position"
                            :options="['left', 'right']"
                            placeholder="Position"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <va-color-input
                            class="axis-color"
                            label="Color y ticks:"
                            v-model="axes[additional_name].ticks.color"
                        />
                    </div>
                    <div class="settings-block mb-3">
                        <va-color-input
                            class="axis-color"
                            label="Color:"
                            v-model="axes[additional_name].backgroundColor"
                        />
                    </div>
                    <!-- <VaInput
                        label="title"
                        :model-value="component.settings.axes[additional_name].text"
                        @update:model-value="component.setSetting(`axes.${additional_name}.text`, $event)"
                    />
                    <VaSelect
                        label="Position"
                        :model-value="component.settings.axes[additional_name].position"
                        @update:model-value="component.setSetting(`axes.${additional_name}.position`, $event)"
                        :options="['left', 'right']"
                        placeholder="Position"
                    /> -->
                </div>
            </div>
            <VaButton @click="addAxis()"> Add+ </VaButton>
        </div>
    </va-collapse>
</template>