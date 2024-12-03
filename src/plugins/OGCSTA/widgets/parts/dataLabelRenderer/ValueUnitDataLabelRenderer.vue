<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>

import {ref} from "vue";
import {useSettings} from "@/composables/widgets/settings";
import type {IDataPoint} from "@/plugins/OGCSTA/widgets/api/Datapoint";
import ValueUnitDataLabelRendererSettings
    from "@/plugins/OGCSTA/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRendererSettings.vue";

export interface IUnitPoint {
    unit: string
    prefix: string
    suffix: string
}

const props = withDefaults(defineProps<IDataPoint & IUnitPoint>(), {
    unit: '',
    prefix: '',
    suffix: '',
    data: ''
})
const {settings, setSetting} = useSettings<typeof props>(props);

const settingsComponent = ValueUnitDataLabelRendererSettings;

defineExpose({
    setSetting,
    settings,
    settingsComponent,
    props
});

</script>

<template>

    <div v-if="data" class="datapoint">
        {{ settings.prefix }}{{ props.data }} {{ settings.unit }} {{ settings.suffix }}
    </div>
    <div v-else class="datapoint">
        {{ settings.prefix }} -- {{ settings.unit }} {{ settings.suffix }}
    </div>
</template>

<style scoped>
.datapoint {
    display: inline-block;
    text-wrap: nowrap;
    position: absolute;
    border: 1px solid #ccc;
    background: #fff;
    padding: 4px;
    margin-top: 0px;
    margin-left: 0px;
    border-radius: 21px;
}

</style>
