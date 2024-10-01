<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts">
import {usePromisifiedModal} from "@/composables/promisifiedModal";
import {computed, ref, watch} from "vue";

export default {
    name: "SaveModal",
    setup() {
        const data = ref(undefined);
        const opened = (_data) => {
            data.value = _data;
        }
        const {isOpened, run, close} = usePromisifiedModal(() => {
        }, opened);
        const date = ref(new Date());
        const ok = () => {
            close(null);
        }
        const savedData = computed(() => {
            let a = date.value;
            let ret = [];
            Object.keys(localStorage).forEach((e, key) => {
                try {
                    let content = JSON.parse(localStorage.getItem(e));
                    const keys = Object.keys(content);
                    if (keys.includes('layout') && keys.includes('stores') && keys.includes('datasources') && keys.includes('widgets')) {
                        ret.push({
                            icon: key,
                            file: e,
                            date: "",
                            size: localStorage.getItem(e).length
                        })
                    }

                } catch (e) {
                    console.log(e)
                }

            })
            return ret;
        })
        const saveUrlLoading = ref<boolean>(false);
        const columns = ref(['icon', 'file', 'date', 'size']);
        const save_Ename = ref('');
        const isDisabled = computed(() => {
            return save_Ename.value == '';
        })

        const save = () => {
            localStorage.setItem(save_Ename.value!, data.value as string);
            date.value = new Date();
            ok();
        }

        const rowClick = (row) => {
            save_Ename.value = row.item.file
        }

        const sameName = computed(() => {
            return Object.keys(localStorage).includes(save_Ename.value)
        })

        watch(isOpened, () => {
            date.value = new Date();
        })
        return {
            sameName,
            save,
            rowClick,
            save_Ename,
            isDisabled,
            savedData,
            columns,
            isOpened,
            run,
            close,
            ok,
        };
    }
}
</script>

<template>
    <va-modal
        :modelValue="isOpened"
        no-padding
        hide-default-actions
        size="auto"
        blur
        class="save-modal"
    >
        <template #footer class="footer">
            <VaButton preset="secondary" @click="ok"> cancel</VaButton>
            <VaButton color="danger" @click="save" :disabled="isDisabled" v-if="sameName"> overide</VaButton>
            <VaButton @click="save" :disabled="isDisabled" v-else> save</VaButton>


        </template>
        <template #default="{ ok }">
            <div class="save-modal-content">

                <div class="m-4">
                    <h6 class="va-h6">Save...</h6>
                    <va-divider/>

                    <div class="keys">
                        <VaDataTable
                            class="dt"
                            striped
                            virtual-scroller
                            sticky-header
                            :items="savedData"
                            :columns="columns"
                            hoverable
                            @row:click="rowClick"
                        />

                    </div>
                    <va-divider/>
                    <br>
                    <VaInput
                        class="full"
                        v-model="save_Ename"

                        placeholder="save as"
                    />
                </div>


            </div>
        </template>

    </va-modal>
</template>

<style lang="scss" scoped>
.save-modal-content {

    min-width: 500px;
    padding: 10px;
    width: 100%;

    button {
        align-self: flex-start;
    }

    .dt {
        height: 250px;
    }

    .full {
        width: 100%;
    }

}
</style>
<style>
.save-modal {
    .va-modal__footer {
        padding: 10px 16px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }
}
</style>
