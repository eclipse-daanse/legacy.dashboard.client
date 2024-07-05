<script setup lang="ts">

import type {Datastream, Thing} from "@/plugins/TestPlugin/dataSources/STAClient";
import {computed, type ModelRef, ref, toRaw, watch} from "vue";
import IconWidget, {type IIconSettingsProps} from "@/components/Widgets/Icon/IconWidget.vue";


import MapSettings from "@/plugins/TestPlugin/widgets/parts/MapSettings.vue";
import IconWidgetSettings, {type IIconSettings} from "@/components/Widgets/Icon/IconWidgetSettings.vue";
import {v4} from "uuid";
import {ERefType, type IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import MapPreview from "@/plugins/TestPlugin/widgets/parts/MapPreview.vue";
import type {IMapProps} from "@/plugins/TestPlugin/widgets/api/MapPreview";
import ValueUnitDataLabelRenderer
  from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRenderer.vue";
import ValueUnitDataLabelRendererSettings
  , {
  type IValueUnitDataLabelRendererComonent
} from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRendererSettings.vue";
import TLCDataLabelRenderer from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/TLCDataLabelRenderer.vue";
import {useDataPointRegistry} from "@/plugins/TestPlugin/composables/datapointRegistry";


const model:ModelRef<IRenderer | undefined> = defineModel<IRenderer>( {
  default: ()=>{
    return {thing:{
  prop:'*',
      value:'',
},
datastream:{
  prop:'*',
  value:'',
},
renderer:{
  point:{
    currentIcon: '10k',
    iconColor: '#545050',
    iconSize: 48,
    isIconFilled: false,
    strokeWeight: 2,
    opticSize: 24,
    grade: 1
  } as IIconSettings,
      area: {
        stroke:true,
        color:'#ccc',
        weight:2,
        opacity:1,
        lineCap:'None',
        dashOffset:2,
        fill:true,
        fillOpacity:1,
        className: ''} as IMapProps,
},
      datapoint:{
        setting:{},
        component:'generalValueUnitDataPointRenderer',
        placement:ERefType.Thing
      },
id:v4()
} as IRenderer}})
const EMIT_ADD_RENDERER = 'addRenderer';
enum Selector {
  Non,
  All
}

const {getAll,getById} = useDataPointRegistry()
const emit = defineEmits<{(
      e:'addRenderer',renderer:IRenderer)
}>()


const thingPropValue = ref('');
const dsPropValue = ref('')
const thingsPropOptions = [{
  text:'id',
  selector:'@iot.id'
},
  {
    text:'name',
    selector:'name'
  },
  {
    text:'decription',
    selector:'description'
  },
  {
    text:'property',
    selector:'property'
  },
  {
    text:'all',
    selector:'*'
  }]
const component = ref(undefined);
const MapPrev = ref('');
const valuedatalabelrenderer = ref<IValueUnitDataLabelRendererComonent|undefined>(undefined);


const submit=()=>{
  emit(EMIT_ADD_RENDERER,model.value as IRenderer);
}
const rendererOptions = computed(()=>{
    let ret= []
      getAll().forEach( (val, key) =>ret.push({name:val.name,id:val.namespace+val.qualifiedName}) );
    return ret
}
)
const dataPointcomponentDesc = computed(()=>{
  return getById(value.value)
})
const value = computed({
  get:()=> model.value?.datapoint.component,
  set:(val:string)=>{
    let m = model.value;
    m!.datapoint.component = val;
    model.value = m;
  }
})
defineExpose({
  submit
});

watch(()=>(component.value as IconWidget)?.settings,(nv:IIconSettings)=>{
  model.value!.renderer!.point =nv;
})
watch(()=>((MapPrev.value) as MapPreview)?.settings,(nv:IMapProps)=>{
  model.value!.renderer!.area = nv;
})
watch(()=>((valuedatalabelrenderer.value) as any)?.settings,(nv:any)=>{
  model.value!.datapoint.setting = nv;
})

</script>

<template>

  <h1 class="va-h3">Renderer</h1>
  <div style="height:15px"></div>

    <h2>Filter</h2>
    <VaDivider class="mb15" />
  <br>
  <div class="row align-start">

    <div class="flex flex-col md6 ">
    <VaSelect
        v-model="model.thing.prop"
        :options="thingsPropOptions"
        value-by="selector"
        text-by="text"
        label="Thing Prop"
        placeholder="Select an option"
    />
      <br>
    <va-input
        class="text-color"
        label="Thing Value"
        v-model="model.thing.value"
    />

    </div>


    <div class="flex flex-col md6 ">

    <VaSelect
        v-model="model.datastream.prop"
        :options="thingsPropOptions"
        value-by="selector"
        text-by="text"
        placeholder="Select an option"
        label="DataStream Prop"
    />
      <br>
    <va-input
        class="text-color"
        label="DataStream Value"
        v-model="model.datastream.value"
    />
    </div>
  </div>
  <br>
    <div style="height:25px"></div>
    <h2>Point Icon Style</h2>
    <VaDivider class="mb15" />

  <div class="row align-start">


    <div class="flex flex-col md6 pa-3">
      <IconWidget currentIcon="add_location_alt" ref="component" v-bind="model.renderer.point" >  </IconWidget>
    </div>
    <div class="flex flex-col md6 pa-3">
      <IconWidgetSettings :component="component" v-if="component" ></IconWidgetSettings>
    </div>

  </div>

    <div style="height:25px"></div>
    <h2>Area Style</h2>
    <VaDivider class="mb15" />

    <div class="row">
      <div class="flex flex-col md6 pa-3">
        <MapPreview ref="MapPrev" v-bind="model.renderer.area"></MapPreview>
      </div>
      <div class="flex flex-col md6 pa-3">
        <MapSettings :component="MapPrev" v-if="MapPrev"></MapSettings>
      </div>

    </div>

  <div style="height:25px"></div>
  <h2>DataLabels</h2>
  <VaDivider class="mb15" />

  <label aria-hidden="true" class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer" id="input-label-240" style="color: var(--va-primary);">render within <!----></label>
  <VaOptionList
      v-model="model.datapoint.placement"
      type="radio"
      label="render within"
      :options="[ERefType.Thing,ERefType.OberservedArea]"
  />
  <div class="max-w-xs">
    <VaSelect
        v-model="value"
        text-by="name"
        value-by="id"
        label="renderer"
        :options="rendererOptions"
        placeholder="Select an option"
        v-if="rendererOptions"
    />
  </div>
<template v-if="dataPointcomponentDesc">

  <div class="flex flex-col md6 pa-3">
    <component :is="dataPointcomponentDesc.component" :data="dataPointcomponentDesc.example" v-bind="model.datapoint.setting" ref="valuedatalabelrenderer"></component>
    <!--<ValueUnitDataLabelRenderer :data="15" ref="valuedatalabelrenderer" v-bind="model.datapoint">  </ValueUnitDataLabelRenderer>-->
  </div>
  <div class="flex flex-col md6 pa-3">
    <template v-if="valuedatalabelrenderer">
      <component :is="valuedatalabelrenderer.settingsComponent" v-bind="{component:valuedatalabelrenderer}" ></component>
    </template>
    <!--<ValueUnitDataLabelRendererSettings :component="valuedatalabelrenderer"  v-if="valuedatalabelrenderer"></ValueUnitDataLabelRendererSettings>-->
  </div>
</template>
<!--<TLCDataLabelRenderer :data="'🟢⚪⚪'" ref="tlc"></TLCDataLabelRenderer>-->


</template>

<style scoped>
  .mb15 {
    margin-bottom: 15px;
  }
</style>
