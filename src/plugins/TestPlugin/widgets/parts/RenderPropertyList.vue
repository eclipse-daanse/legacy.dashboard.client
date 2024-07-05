<script setup lang="ts">

import type {Datastream, Thing} from "@/plugins/TestPlugin/dataSources/STAClient";
import {ref, toRaw} from "vue";
import type {IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import RenderPropertyListItem from "@/plugins/TestPlugin/widgets/parts/RenderPropertyListItem.vue";


const model  = defineModel<IRenderer[]|undefined>();
const editmodel = ref<IRenderer|undefined>(undefined)
const emit = defineEmits<{(
    e:'addRenderer',renderer:IRenderer[])
}>()
const showModal = ref(false);
const renderers = ref<IRenderer[]>([] );

const columns = [
  { key: "thing.prop", sortable: true },
  { key: "thing.value", sortable: true },
  { key: "datastream.prop", sortable: true },
  { key: "datastream.value", sortable: true },
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
  console.log(renderer)
  console.log(model)
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
      :beforeOk="hide => {if(editmodel === undefined){(listitem as RenderPropertyListItem).submit()};hide()}"
  >
   <RenderPropertyListItem ref="listitem" @add-renderer="addRenderer" v-model="editmodel"></RenderPropertyListItem>

  </VaModal>


</template>

<style  lang="scss">
 .table-crud .va-inner-loading table{
   white-space: normal!important;
 }
</style>
