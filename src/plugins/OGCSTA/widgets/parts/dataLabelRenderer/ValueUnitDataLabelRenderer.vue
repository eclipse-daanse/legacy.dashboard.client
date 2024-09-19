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
        {{ settings.prefix }}{{ data }} {{ settings.unit }} {{ settings.suffix }}
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
    margin-top: 32px;
    margin-left: -38px;
    border-radius: 21px;

}

</style>
