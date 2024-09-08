<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface ISVGSettingsProps {
    initialState?: any;
    src?: string;
    classesConfig?: Config;
}

import {
    computed,
    getCurrentInstance,
    onMounted,
    ref,
    type Ref,
    inject,
} from "vue";
import SvgWidgetSettings from "./SvgWidgetSettings.vue";
import { useSettings } from "@/composables/widgets/settings";
import { useStore } from "@/composables/widgets/store";
import { useSerialization } from "@/composables/widgets/serialization";
import type { Store } from "@/stores/Widgets/Store";
import type { Config } from "@/@types/widgets";
import type { TinyEmitter } from "tiny-emitter";

const settingsComponent = SvgWidgetSettings;

const svgSource: Ref<string> = ref("");
const inst = getCurrentInstance();
const scope = inst?.type.__scopeId;

const props = withDefaults(defineProps<ISVGSettingsProps>(), {
    src: "/demo/test.svg",
    classesConfig: () => ({
        primary: {
            fill: "#ff5733",
            stroke: "#1e8449",
            strokeWidth: "5px",
        },
    }),
});

const eventbus = inject("customEventBus") as TinyEmitter;
const { settings, setSetting } = useSettings<typeof props>(props);
const { store, data, setStore, loading } = useStore<Store>(eventbus);
const { getState } = useSerialization(settings);

const styles: Ref<string> = computed(() => {
    let string: string = "";

    if (settings.value.classesConfig) {
        string += "<style>";
        for (const [key, value] of Object.entries(
            settings.value.classesConfig,
        )) {
            string += `
        [${scope}] .${key} {
          stroke: ${value.stroke};
          fill: ${value.fill};
          stroke-width: ${value.strokeWidth};
        }
      `;
        }
        string += "</style>";
    }

    return string;
});

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

const svgSourceParced = computed(() => {
    let processedString = svgSource.value;
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
</script>

<template>
    <div v-html="styles"></div>
    <div class="svg" v-html="svgSourceParced"></div>
</template>

<style scoped>
.svg {
    width: 100%;
    height: 100%;
}
</style>
