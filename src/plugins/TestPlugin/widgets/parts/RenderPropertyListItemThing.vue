<script setup lang="ts">

import {computed, type ModelRef, reactive, ref, toRaw, watch} from "vue";
import IconWidget, {type IIconSettingsProps} from "@/components/Widgets/Icon/IconWidget.vue";


import MapSettings from "@/plugins/TestPlugin/widgets/parts/MapSettings.vue";
import IconWidgetSettings, {type IIconSettings} from "@/components/Widgets/Icon/IconWidgetSettings.vue";
import {v4} from "uuid";
import {ERefType, type IDSRenderer, type IPointPin, type IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import MapPreview from "@/plugins/TestPlugin/widgets/parts/MapPreview.vue";
import type {IMapProps} from "@/plugins/TestPlugin/widgets/api/MapPreview";
import
  {
  type IValueUnitDataLabelRendererComonent
} from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRendererSettings.vue";
import {useDataPointRegistry} from "@/plugins/TestPlugin/composables/datapointRegistry";
import MapPreviewPoint from "@/plugins/TestPlugin/widgets/parts/MapPreviewPoint.vue";
import RenderPropertyListItemDataStream from "@/plugins/TestPlugin/widgets/RenderPropertyListItemDataStream.vue";
import {LIcon, LMarker} from "@vue-leaflet/vue-leaflet";


const model:ModelRef<IRenderer> = defineModel<IRenderer>( {
  default: ()=>{
    return reactive({thing:{
  prop:'*',
      value:'',
},
ds_renderer:[],
renderer:{
    show_SubElements:false,
    point_render_as:'icon',
    point_prop:'name',
  point:{
    currentIcon: '10k',
    iconColor: '#545050',
    iconSize: 48,
    isIconFilled: false,
    strokeWeight: 2,
    opticSize: 24,
    grade: 1
  } as IIconSettings,
    pointPin:{
      color: '#ccc'
    } ,
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
id:v4()
} as IRenderer)}})
const EMIT_ADD_RENDERER = 'addRenderer';
enum Selector {
  Non,
  All
}
const showModal = ref(false);
const editmodel = ref<IDSRenderer|undefined>(undefined)

const {getAll,getById} = useDataPointRegistry()
const emit = defineEmits<{(
      e:'addRenderer',renderer:IRenderer)
}>()


const thingPropValue = ref('');
const dsPropValue = ref('')


const pointSelectorOptions = [
    {label: 'Icon', value: 'icon'},
    {label: 'Property', value: 'prop'},
    {label: 'None', value: 'none'},
]
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


defineExpose({
  submit
});

watch(()=>(component.value as IconWidget)?.settings,(nv:IIconSettings)=>{
  if(nv){
      model.value!.renderer!.point =nv;
  }
})
watch(()=>((MapPrev.value) as MapPreview)?.settings,(nv:IMapProps)=>{
  model.value!.renderer!.area = nv;
})


const columns = [
    { key: "datastream.prop", sortable: true },
    { key: "datastream.value", sortable: true },
    { key: "actions", width: 80 },
];
const add=()=>{
    editmodel.value = undefined;
    showModal.value= true;
}
const editRowById = (row)=>{
    console.log(row)
    console.log(model.value?.[row])
    editmodel.value = model.value.ds_renderer[row];
    showModal.value= true;
}

const deleteItemById = (row:number)=>{
    model.value.ds_renderer.splice(row)
}
const addSubRenderer = (renderer:IDSRenderer)=>{
    model.value.ds_renderer.push(renderer)
    //model.value = model.value;
}
const listitem2 = ref(null);
const propName = ref('id');
</script>

<template>

  <h1 class="va-h3">Thing Renderer</h1>
  <div style="height:15px"></div>

    <h2>Filter</h2>
    <VaDivider class="mb15" />
  <br>
  <div class="row align-start">

    <div class="flex flex-col md12 ">
    <VaSelect
        v-model="model.thing.prop"
        :options="thingsPropOptions"
        value-by="selector"
        text-by="text"
        label="Thing Prop"
        placeholder="Select an option"
    />
        &nbsp;=&nbsp;
    <va-input
        class="text-color"
        label="Thing Value"
        v-model="model.thing.value"
    />

    </div>

  </div>
  <br>
    <div style="height:25px"></div>
    <h2>Point Icon Style</h2>
    <VaDivider class="mb15" />

  <div class="row align-start">

        <div class="flex flex-col md6 pa-3">
            <MapPreviewPoint ref="MapPrev2" v-bind="model.renderer.point">
                <l-marker
                    :lat-lng="[50.92828047934907,11.587408017353823]">
                    <l-icon  class-name="someExtraClass">


                        <template v-if="model.renderer.point_render_as=='icon'">
                            <div class="pin icon">
                                <div class="inner">
                                    <IconWidget currentIcon="add_location_alt" ref="component" v-bind="model.renderer.point" >  </IconWidget>
                                </div>
                            </div>


                        </template>
                        <template v-if="model.renderer.point_render_as=='prop'">
                            <div class="pin contain marker">
                                <div class="inner">
                                    {{ model.renderer.point_prop }}
                                </div>
                            </div>
                        </template>
                    </l-icon>
                </l-marker>

            </MapPreviewPoint>
        </div>


    <div class="flex flex-col md6 pa-3">
        <VaButtonToggle
            v-model="model.renderer.point_render_as"
            :options="pointSelectorOptions"
            border-color="primary"
            preset="secondary"
        />
        <template v-if="model.renderer.point_render_as=='icon'">
            <IconWidgetSettings :component="component" v-if="component" ></IconWidgetSettings>
        </template>
        <template v-if="model.renderer.point_render_as=='prop'">
            <VaSelect
                v-model="model.renderer.point_prop"
                :options="thingsPropOptions"
                label="DataStream Prop"
                placeholder="Select an option"
                text-by="text"
                value-by="selector"
            />
        </template>
        <template v-if="model.renderer.point_render_as!='none'">
        <VaDivider class="mb15"/>

        <va-color-input
            class="pin-color"
            label="Pin Color"
            v-model="model.renderer.pointPin.color"

        />
        </template>
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


    <VaDataTable
        class="table-crud2"
        :items="model.ds_renderer"
        :columns="columns"
        striped
    >
        <template #headerAppend>
            <tr>
                <th></th>   <th></th>
                <th></th>
                <th></th>
                <th class="p-1">
                    <VaButton
                        block
                        @click="add"
                    >
                        Add
                    </VaButton>
                </th>
            </tr>
        </template>

        <template #cell(actions)="{ rowIndex }">
            <VaButton
                preset="plain"
                icon="edit"
                @click="editRowById(rowIndex)"
            />
            <VaButton
                preset="plain"
                icon="delete"
                class="ml-3"
                @click="deleteItemById(rowIndex)"
            />
        </template>

    </VaDataTable>


<!--<TLCDataLabelRenderer :data="'🟢⚪⚪'" ref="tlc"></TLCDataLabelRenderer>-->
    <VaModal
        class="table-crud"
        v-model="showModal"
        close-button
        blur
        max-height="800px"
        fixed-layout
        :beforeOk="hide => {if(editmodel === undefined){(listitem2 as RenderPropertyListItemDataStream).submit()};hide()}"
    >
        <RenderPropertyListItemDataStream  ref="listitem2" @add-sub-renderer="addSubRenderer" v-model="editmodel"></RenderPropertyListItemDataStream>

    </VaModal>

</template>

<style scoped lang="scss">
  .mb15 {
    margin-bottom: 15px;
  }
  .pin{
      width: 45px;
      height: 45px;
      border-radius: 50% 50% 50% 0;

      background: v-bind('model.renderer.pointPin.color');
      transform: rotate(-45deg);
      left: 50%;
      top: 50%;
      margin: -15px 71px 0 -15px;
      box-shadow: -4px -6px 8px #0000005c;

      &.round{
          border-radius: 50% 50% 50% 50%;
      }
      &.contain{
          width: auto;
          height: auto;
          border-radius: 25%;
          display: inline-block;
          transform: rotate(0deg);
          padding: 4px;
          margin: 0px;
          .inner{
              width: auto;
              height:auto;
              margin: 0;
              position: relative;
              transform: rotate(0deg);
              border-radius: 17%;
              display: inline-block;
              font-size: 13px;
              padding: 3px;
          }
      }
      &.marker{
      &::before{

          content: " ";
          width: 20px;
          height: 20px;
          display: block;
          position: absolute;
          background: v-bind('model.renderer.pointPin.color');
          transform: rotate(-45deg);
          border-radius: 50% 50% 50% 0;
          top: 14px;
          left: 5px;
          z-index: -24;

      }}
      .inner{
          padding: 5px 0 0 0;
          width: 37px;
          height: 37px;
          margin: 3px 0 0 4px;
          background: #fff;
          position: absolute;
          transform: rotate(45deg);
          border-radius: 50%;
      }
  }
</style>
