<script lang="ts" setup>


import {reactive, ref, toRaw} from "vue";
import type {IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import RenderPropertyListItemThing from "@/plugins/TestPlugin/widgets/parts/RenderPropertyListItemThing.vue";

const model = defineModel<IRenderer[] | undefined>({
    default:
        () => {
            return (
                reactive({}))
        }
});
const editmodel = ref<IRenderer | undefined>(undefined)
const emit = defineEmits<{
    (
        e: 'addRenderer', renderer: IRenderer[])
}>()
const showModal = ref(false);
const renderers = ref<IRenderer[]>([]);

const columns = [
    {key: "thing.prop", sortable: true},
    {key: "thing.value", sortable: true},
    {key: "actions", width: 80},
];
const add = () => {
    editmodel.value = undefined;
    showModal.value = true;
}

const editRowById = (row) => {
    console.log(row)
    console.log(model.value?.[row])
    editmodel.value = model.value![row];
    showModal.value = true;
}

const deleteItemById = (row: number) => {
    model.value!.splice(row)
}

const addRenderer = (renderer: IRenderer) => {
    model.value?.push(renderer)
    //emit('addRenderer',renderers.value)
}
const listitem = ref(null);
</script>

<template>


    <VaDataTable
        :columns="columns"
        :items="model"
        class="table-crud"
        striped
    >
        <template #header(actions)="{ label }">
            <VaButton
                block
                @click="add"
                style="min-width: 40px; float: right;"
            >
                Add
            </VaButton>
        </template>

        <template #cell(actions)="{ rowIndex }">
            <VaButton
                icon="edit"
                preset="plain"
                @click="editRowById(rowIndex)"
            />
            <VaButton
                class="ml-3"
                icon="delete"
                preset="plain"
                @click="deleteItemById(rowIndex)"
            />
        </template>

    </VaDataTable>

    <VaModal
        v-model="showModal"
        :beforeOk="hide => {if(editmodel === undefined){(listitem as RenderPropertyListItemThing).submit()}hide()}"
        blur
        class="table-crud"
        close-button
        fixed-layout
        max-height="800px"
    >
        <RenderPropertyListItemThing ref="listitem" v-model="editmodel"
                                     @add-renderer="addRenderer"></RenderPropertyListItemThing>

    </VaModal>


</template>

<style lang="scss">
.table-crud .va-inner-loading table {
    white-space: normal !important;
}
</style>
