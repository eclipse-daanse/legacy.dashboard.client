<script setup lang="ts">

import {ref} from "vue";
import {useSettings} from "@/composables/widgets/settings";
import type {IDataPoint} from "@/plugins/TestPlugin/widgets/api/Datapoint";
import ValueUnitDataLabelRendererSettings
  from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRendererSettings.vue";

export interface IUnitPoint{
  unit:string
  prefix:string
  suffix:string
}


const props = withDefaults(defineProps<IDataPoint & IUnitPoint>(),{
  unit: '',
  prefix: '',
  suffix: '',
  data: ''
})
const { settings, setSetting } = useSettings<typeof props>(props);

const settingsComponent = ValueUnitDataLabelRendererSettings;

defineExpose({
  setSetting,
  settings,
  settingsComponent,
  props
});

</script>

<template>

  <div class="datapoint" v-if="data">
    {{settings.prefix}}{{data}} {{settings.unit}} {{settings.suffix}}
  </div>
</template>

<style scoped>
.datapoint{
  position: absolute;
  border: 1px solid #ccc;
  background: #fff;
  padding: 4px;
  border-radius: 21px;
}

</style>
