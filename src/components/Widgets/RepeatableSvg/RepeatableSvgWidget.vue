<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface IRepeatableSVGSettingsProps {
    src?: string;
    activeItemStyles?: {
        fill: string;
        stroke: string;
    };
    defaultItemStyles?: {
        fill: string;
        stroke: string;
    };
    repeations?: string;
    progress?: string;
}

import { onMounted, computed, type Ref, ref, inject } from "vue";
import RepeatableSvgWidgetSettings from "./RepeatableSvgWidgetSettings.vue";
import { useSettings } from "@/composables/widgets/settings";
import { useStore } from "@/composables/widgets/store";
import { useSerialization } from "@/composables/widgets/serialization";
import type { Store } from "@/stores/Widgets/Store";
import type { ItemStyles } from "@/@types/widgets";
import type { TinyEmitter } from "tiny-emitter";

const settingsComponent = RepeatableSvgWidgetSettings;

const props = withDefaults(defineProps<IRepeatableSVGSettingsProps>(), {
    src: "/demo/human.svg",
    activeItemStyles: (): ItemStyles => ({
        fill: "#ff0000",
        stroke: "#ffff00",
    }),
    defaultItemStyles: (): ItemStyles => ({
        fill: "#777777",
        stroke: "#777777",
    }),
    repeations: "4",
    progress: "0.5",
});

const eventbus = inject("customEventBus") as TinyEmitter;
const { settings, setSetting } = useSettings<typeof props>(props);
const { store, data, setStore, loading } = useStore<Store>(eventbus);
const { getState } = useSerialization(settings);
const svgSource: Ref<string> = ref("");

onMounted(async () => {
    if (!settings.value.src) return;
    const req = await fetch(settings.value.src);
    const svgObject = await req.text();
    svgSource.value = svgObject;
});

defineExpose({
    setSetting,
    settings,
    settingsComponent,
    getState,
    store,
    setStore,
    loading,
});

const createParsedData = (prop) => {
    return computed(() => {
        let processedString = String(prop);
        const regex = /{(.*?)}/g;
        const parts = processedString.match(regex);

        if (!parts || !data.value) {
            return processedString;
        }

        parts.forEach((element: string) => {
            const trimmedString = element.replace("{", "").replace("}", "");
            const dataField = trimmedString.split(".");

            const res = dataField.reduce((acc: any, field) => {
                return acc[field];
            }, data.value);

            processedString = processedString.replace(element, res);
        });
        return processedString;
    });
};

const repeationsToNumber: Ref<number> = computed(() => {
    return !isNaN(parseFloat(settings.value.repeations))
        ? Math.floor(Number(settings.value.repeations))
        : 0;
});

const progressToNumber: Ref<number> = computed(() => {
    return !isNaN(parseFloat(createParsedData(settings.value.progress).value))
        ? Number(createParsedData(settings.value.progress).value)
        : 0;
});
</script>

<template>
    <div class="repeatable-svg-container">
        <svg
            fill="#000000"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            :viewBox="`0 0 ${100 * repeationsToNumber} 100`"
            enable-background="new 0 0 100 100"
            xml:space="preserve"
        >
            <defs>
                <mask id="bubbleKenseo">
                    <rect
                        x="0"
                        y="0"
                        style="fill: #adadad"
                        :width="100 * repeationsToNumber * progressToNumber"
                        height="100"
                    />
                </mask>
            </defs>
            <g
                :fill="settings.defaultItemStyles.fill"
                :stroke="settings.defaultItemStyles.stroke"
            >
                <g
                    v-html="svgSource"
                    v-for="index in repeationsToNumber"
                    :transform="`translate(${100 * (index - 1)}, 0)`"
                    :key="index"
                ></g>
            </g>
            <g
                mask="url(#bubbleKenseo)"
                :fill="settings.activeItemStyles.fill"
                :stroke="settings.activeItemStyles.stroke"
            >
                <g
                    v-html="svgSource"
                    v-for="index in repeationsToNumber"
                    :transform="`translate(${100 * (index - 1)}, 0)`"
                    :key="index"
                ></g>
            </g>
        </svg>
    </div>
</template>

<style scoped>
.repeatable-svg-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    object-fit: contain;
}
</style>
