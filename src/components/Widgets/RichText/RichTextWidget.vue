<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface IRichTextEditorSettingsProps {
    editor?: string;
}

import { computed, inject } from "vue";
import { useSettings } from "@/composables/widgets/settings";
import { useStore } from "@/composables/widgets/store";
import { useSerialization } from "@/composables/widgets/serialization";
import type { Store } from "@/stores/Widgets/Store";
import RichTextWidgetSettings from "./RichTextWidgetSettings.vue";
import type { TinyEmitter } from "tiny-emitter";

const settingsComponent = RichTextWidgetSettings;

const props = withDefaults(defineProps<IRichTextEditorSettingsProps>(), {
    editor: "",
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

const parsedEditorText = computed(() => {
    let processedString = settings.value.editor;
    const regex = /{(.*?)}/g;
    const parts = processedString.match(regex);

    if (!parts || !data.value) return processedString;

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
    <div class="text-container">
        <div class="editor-content" v-html="parsedEditorText" />
    </div>
</template>

<style lang="scss">
.text-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 1rem;
    align-items: stretch;
}

.editor-content {
    width: 100%;
    height: 100%;
    overflow-wrap: anywhere;

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    h2 {
        font-size: 1.75rem;
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    h4 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }

    h5 {
        font-size: 1.11rem;
        margin-bottom: 1rem;
    }

    h6 {
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
}
</style>
