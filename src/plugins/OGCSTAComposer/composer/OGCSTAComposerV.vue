<script setup lang="ts">

import type {Composer, CSVSelector, Selector} from "@/plugins/charts/widgets/api/ChartdataComposer";
import {type Component, computed, ref, watch} from "vue";
import type {AxisSettings} from "@/plugins/charts/widgets/BarChartWidgetSettings.vue";
import { v4 as uuidv4 } from 'uuid';
import type {IChartComponent} from "chart.js/dist/core/core.typedRegistry";
import {deepUnref} from "vue-deepunref";
import {isEqual} from "lodash";
import type CSVStore from "@/plugins/charts/stores/CSVStore";

    const model = defineModel<Composer<Selector>>()
    model.value?.getSelectorX()

    //const axisAssignment = defineModel('axisAssignment', { required: true })


    const props = defineProps<{axes:{ [key: string]:AxisSettings}, component:IChartComponent}>()
    const xSel = computed({get:()=> {
            return (model.value?.getSelectorX() as CSVSelector)?.header
        },set:(val)=>{
            model.value?.setSelectorX(val as CSVSelector)
        }
    })
    const axisAssignment = ref({});
    watch(()=>props.component.settings.axisAssignment,(vaxisAssignment)=>{
        if(!isEqual(deepUnref( axisAssignment.value),deepUnref(vaxisAssignment))) {
            axisAssignment.value = {...deepUnref(vaxisAssignment as any)};
        }
    },{immediate:true,deep:true})
    watch(axisAssignment,(newaxisAssignment,oldValue)=>{

        props.component.setSetting('axisAssignment',axisAssignment);

    },{deep:true})
    const ySel = computed(()=>{
       return (model.value?.getSelectorsY() as CSVSelector[]).map(e=>e.header);
    })
    const headers = computed(()=>{
        return (model.value?.getStore() as CSVStore).getHeader().map(head=>{return {header:head,id:uuidv4()}})
    })

    const updateSelectorY = (val,head,name)=>{
        if(!Object.keys(axisAssignment.value).includes(name)){
            axisAssignment.value[name]=[];
        }
        let items = model.value?.getSelectorsY();
        if(items){
            let index = -1;
            let axis = undefined;
            for(axis in items){
                index = items![axis].findIndex((v:CSVSelector)=>v.header == head.header);
                if(index!=-1)break;
            }

            if(index!=-1) {

                    items[axis].splice(index, 1);

            }
        if (val) {
            //let selector = {header:head,id:uuidv4()}as CSVSelector;
            model.value?.addSelectorY(head, name);
        }
        }

    }
    const source = computed(()=>{
        return model.value?.getStore()?.caption||'';
    })
const axis_names =computed((e)=>{
    return Object.keys(props.axes).filter((name)=>(name!='x'))
})
const checkvalue = computed(()=>{
    return (name,head)=> {
        let item = model.value?.getSelectorsY()[name];
        if (item) {
            let index = item!.findIndex((v: CSVSelector) => v.header == head.header);
            if (index != -1) return true;
        }
        return false;
    }
})
</script>

<template>
<div class="composer">
    <h2>{{source}}</h2>

    <br>

    xAxis:
    <br>
    <VaSelect
        v-model="xSel"
        :options="headers"
        text-by="header"
        placeholder="Select an header for X"
    />
    <br>
    <br>
    yAxis:
    <br>
    <div v-for="name in axis_names">
        {{name}}
    <template v-for="head in headers">


        <VaCheckbox :model-value="checkvalue(name,head)" @update:modelValue="(ev)=>updateSelectorY(ev,head,name)" :label="head.header">


        </VaCheckbox>


        <!--<VaSelect

            @update:modelValue="(ev)=>updateSelectorY(ev,i)"
            :options="headers"
            placeholder="Select an header for y"
        />-->
    </template>
    </div>


</div>
</template>

<style scoped lang="scss">

</style>
