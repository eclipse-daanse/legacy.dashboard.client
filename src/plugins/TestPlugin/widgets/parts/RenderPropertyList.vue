<script setup lang="ts">


import {reactive, ref, toRaw} from "vue";
import type {IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import RenderPropertyListItemThing from "@/plugins/TestPlugin/widgets/parts/RenderPropertyListItemThing.vue";


const model  = defineModel<IRenderer[]|undefined>({
default:
() => {
    return (
        reactive({}))}});
const editmodel = ref<IRenderer|undefined>(undefined)
const emit = defineEmits<{(
    e:'addRenderer',renderer:IRenderer[])
}>()
const showModal = ref(false);
const renderers = ref<IRenderer[]>([] );

const columns = [
  { key: "thing.prop", sortable: true },
  { key: "thing.value", sortable: true },
  { key: "actions", width: 80 },
];
const add = ()=>{
  editmodel.value = undefined;
  showModal.value= true;
}

const editRowById = (row)=>{
  console.log(row)
  console.log(model.value?.[row])
  editmodel.value = model.value![row];
  showModal.value= true;
}

const deleteItemById = (row:number)=>{
  model.value!.splice(row)
}

const addRenderer = (renderer:IRenderer)=>{
  model.value?.push(renderer)
  //emit('addRenderer',renderers.value)
}
const listitem = ref(null);
</script>

<template>


  <VaDataTable
      class="table-crud"
      :items="model"
      :columns="columns"
      striped
  >
    <template #headerAppend>
      <tr>
        <th></th>
        <th></th>
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

  <VaModal
      class="table-crud"
      v-model="showModal"
      close-button
      blur
      max-height="800px"
      fixed-layout
      :beforeOk="hide => {if(editmodel === undefined){(listitem as RenderPropertyListItemThing).submit()};hide()}"
  >
   <RenderPropertyListItemThing ref="listitem" @add-renderer="addRenderer" v-model="editmodel"></RenderPropertyListItemThing>

  </VaModal>


</template>

<style  lang="scss">
 .table-crud .va-inner-loading table{
   white-space: normal!important;
 }
</style>
