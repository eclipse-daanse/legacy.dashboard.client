<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface IProgressSettingsProps {
    progress?: string;
    fillColor?: string;
    gradientColor?: string;
    backgroundColor?: string;
    isGradient?: boolean;
    isVertical?: boolean;
    rotation?: number;
}

import { computed, inject } from "vue";
import ProgressWidgetSettings from "./ProgressWidgetSettings.vue";
import { useSettings } from "@/composables/widgets/settings";
import { useStore } from "@/composables/widgets/store";
import { useSerialization } from "@/composables/widgets/serialization";
import type { Store } from "@/stores/Widgets/Store";
import type { TinyEmitter } from "tiny-emitter";

const settingsComponent = ProgressWidgetSettings;

const props = withDefaults(defineProps<IProgressSettingsProps>(), {
    progress: "0.5",
    fillColor: "#00FF00",
    gradientColor: "#00FF00 0, #FAFAFA 85%",
    backgroundColor: "#d3d3d3",
    isGradient: false,
    isVertical: false,
    rotation: 90,
});

const eventbus = inject("customEventBus") as TinyEmitter;
const { settings, setSetting } = useSettings<typeof props>(props);
const { store, data, setStore, loading } = useStore<Store>(eventbus);
const { getState } = useSerialization(settings);

defineExpose({
    setSetting,
    settings,
    settingsComponent,
    getState,
    store,
    setStore,
    loading,
});

const parsedProgress = computed(() => {
    if (!isNaN(parseFloat(settings.value.progress)))
        return `${(parseFloat(settings.value.progress) * 100).toFixed(2)}%`;

    let processedString = settings.value.progress;
    const regex = /{(.*?)}/g;
    const parts = processedString.match(regex);

    if (!parts || !data.value) return processedString;

    parts.forEach((element: string) => {
        const trimmedString = element.replace("{", "").replace("}", "");
        const dataField = trimmedString.split(".");

        const res = dataField.reduce((acc: any, field) => {
            if(!acc[field]){
                return ""
            }
            return acc[field];
        }, data.value);

        processedString = processedString.replace(element, res);
    });

    return !isNaN(parseFloat(processedString))
        ? parseFloat(processedString) > 100
            ? "100%"
            : `${processedString}%`
        : `${processedString}%`;
});

const backgroundProgressColor = computed(() => {
    return settings.value.isGradient
        ? `linear-gradient(${settings.value.rotation}deg, ${settings.value.gradientColor})`
        : `${settings.value.fillColor}`;
});

const transition = computed(() => {
    return settings.value.isVertical ? "height .7s ease" : "width .7s ease";
});

const verticalPositionFiller = computed(() => {
    return settings.value.isVertical
        ? `${parseFloat(parsedProgress.value)}%`
        : "35px";
});

const horizontalPositionFiller = computed(() => {
    return !settings.value.isVertical
        ? `${parseFloat(parsedProgress.value)}%`
        : "35px";
});

const verticalPositionBackground = computed(() => {
    return settings.value.isVertical ? "35px" : "100%";
});

const horizontalPositionBackground = computed(() => {
    return !settings.value.isVertical ? "35px" : "100%";
});
</script>

<template>
    <div class="container">
        <div class="progress">
            <span>{{ parsedProgress }}</span>
            <div class="progress-percent"></div>
        </div>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.progress {
    width: v-bind(verticalPositionBackground);
    height: v-bind(horizontalPositionBackground);
    background: v-bind(settings.backgroundColor);
    border-radius: 10px;
    display: flex;
    align-items: end;
    position: relative;
}

.progress-percent {
    height: v-bind(verticalPositionFiller);
    width: v-bind(horizontalPositionFiller);
    background: v-bind(backgroundProgressColor);
    transition: v-bind(transition);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
}

span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    z-index: 1000;
}
</style>
