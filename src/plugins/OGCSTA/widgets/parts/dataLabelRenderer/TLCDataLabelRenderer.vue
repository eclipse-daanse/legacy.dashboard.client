<script lang="ts" setup>


import {useSettings} from "@/composables/widgets/settings";
import type {IDataPoint} from "@/plugins/OGCSTA/widgets/api/Datapoint";

import TLCDataLabelRendererSettings
    from "@/plugins/OGCSTA/widgets/parts/dataLabelRenderer/TLCDataLabelRendererSettings.vue";
import type {Component} from "vue";

const props = withDefaults(defineProps<IDataPoint>(), {
    data: ''
})
const {settings, setSetting} = useSettings<typeof props>(props);

const settingsComponent: Component = TLCDataLabelRendererSettings;

defineExpose({
    setSetting,
    settings,
    settingsComponent,
    props
});

</script>

<template>
    <div v-if="data" class="datapoint tlc">
        {{ data }}
    </div>
</template>

<style scoped>
.tlc {
    position: absolute;
    border: 1px solid #ccc;
    background: #fff;
    padding: 4px;
    border-radius: 21px;
    text-wrap: nowrap;
    /* box-shadow: 3px 14px 15px 0px rgba(0, 0, 0, 0.43); */
    font-size: 16px;
    margin: 22px 0px;
    transform: rotate(-90deg);

}

</style>
