<script setup lang="ts">

import type {Composer, CSVSelector, Selector} from "@/plugins/charts/widgets/api/ChartdataComposer";
import {type Component, computed, ref, watch} from "vue";
import type {AxisSettings} from "@/plugins/charts/widgets/BarChartWidgetSettings.vue";
import { v4 as uuidv4 } from 'uuid';
import type {IChartComponent} from "chart.js/dist/core/core.typedRegistry";
import {deepUnref} from "vue-deepunref";
import {isEqual} from "lodash";
import type CSVStore from "@/plugins/charts/stores/CSVStore";
import StaStore from "@/plugins/TestPlugin/stores/StaStore";
import {computedAsync} from "@vueuse/core";
import type {Datastream, Thing} from "@/plugins/TestPlugin/dataSources/STAClient";

    const model = defineModel<Composer<Selector>>()




    const props = defineProps<{axes:{ [key: string]:AxisSettings}, component:IChartComponent}>()







    const source = computed(()=>{
        return model.value?.getStore()?.caption||'';
    })
const thingsTree = computedAsync(async ()=>{
    const things = await (model.value?.getStore() as StaStore).getThings();
    return things.map((thing:Thing)=>{
        return {
            id:'T:'+thing["@iot.id"],
            label:thing.name,
            children:thing.Datastreams?.map((ds:Datastream)=>{
                return {
                    id:'D:'+ds["@iot.id"],
                    label: ds.name
                }
            })
        }
    })
})
const checked = (ev,more)=>{
        console.log(ev);
        console.log(more);

}

const selection = ref();
const axis_names =computed((e)=>{
    return Object.keys(props.axes).filter((name)=>(name!='x'))
})
const headers = computed(()=>{
    selection.value.forEach(id=>{
        if(id.startsWith('D:')){

        }
    })
    return
})
</script>

<template>
<div class="composer">
    <h2>{{source}}</h2>
{{selection}}
    <VaTreeView

        v-model="thingsTree"

        selectable
        expand-all



    />
    yAxis:
    <br>
    <div v-for="name in axis_names">
        {{name}}
        <template v-for="head in headers">


           <!-- <VaCheckbox :model-value="checkvalue(name,head)" @update:modelValue="(ev)=>updateSelectorY(ev,head,name)" :label="head.header">


            </VaCheckbox>-->


            <!--<VaSelect

                @update:modelValue="(ev)=>updateSelectorY(ev,i)"
                :options="headers"
                placeholder="Select an header for y"
            />-->
        </template>
</div>
</template>

<style scoped lang="scss">

</style>
