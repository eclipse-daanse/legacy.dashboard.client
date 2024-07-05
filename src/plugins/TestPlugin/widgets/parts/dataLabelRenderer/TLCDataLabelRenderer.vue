<script setup lang="ts">


import {useSettings} from "@/composables/widgets/settings";
import type {IDataPoint} from "@/plugins/TestPlugin/widgets/api/Datapoint";

import TLCDataLabelRendererSettings
  from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/TLCDataLabelRendererSettings.vue";
import type {Component} from "vue";




const props = withDefaults(defineProps<IDataPoint>(),{
  data: ''
})
const { settings, setSetting } = useSettings<typeof props>(props);

const settingsComponent:Component = TLCDataLabelRendererSettings;

defineExpose({
  setSetting,
  settings,
  settingsComponent,
  props
});

</script>

<template>

  <div class="datapoint tlc" v-if="data">
    {{data}}
  </div>
</template>

<style scoped>
.tlc {
  position: absolute;

  border: 1px solid #ccc;

  background: #fff;
  padding: 4px;
  border-radius: 21px;
  /* box-shadow: 3px 14px 15px 0px rgba(0, 0, 0, 0.43); */
  font-size: 16px;

    transform: rotate(-90deg);


}

</style>
