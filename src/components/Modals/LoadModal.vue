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
import IconWidget from "@/components/Widgets/Icon/IconWidget.vue";
import {controlOrMetaSymbol} from "@storybook/manager-api";
import {useToast} from "vuestic-ui";

export default {
    name: "LoadModal",
    components: {IconWidget},
    setup() {
        const releaseEndPointUrl = ref<String>('');
        if (window && window['__env'] && window['__env'].settings && window['__env'].settings.releaseEndPointUrl) {
            releaseEndPointUrl.value = window['__env'].settings.releaseEndPointUrl;
        }
        const {init, notify, closeAll} = useToast()
        const data = ref(undefined);
        const deleteFile = ref(undefined);
        const uploadFile = ref(undefined);
        const sureuploadFile = ref(false)
        const url_name = ref("https://");
        const loadingUrl = ref(false);
        const errorMessage = ref("");
        const error = ref(false);
        const date = ref(new Date());
        const opened = (_data) => {
            data.value = _data;
        }
        const {isOpened, run, close} = usePromisifiedModal(() => {
        }, opened);
        const ok = () => {
            close(null);
        }
        const sureDelete = ref(false);
        const savedData = computed(() => {
            let ret = [];
            let a = date.value;
            Object.keys(localStorage).forEach((e, key) => {
                try {
                    let content = JSON.parse(localStorage.getItem(e));
                    const keys = Object.keys(content);
                    if (keys.includes('layout') && keys.includes('stores') && keys.includes('datasources') && keys.includes('widgets')) {
                        ret.push({
                            icon: key,
                            file: e,
                            date: "",
                            size: localStorage.getItem(e).length,
                        })
                    }

                } catch (e) {
                    console.log(e)
                }

            })
            return ret;
        })
        const columns = ref([
            {key: 'icon', label: 'icon'},
            {key: 'file', label: 'file'},
            {key: 'date', label: 'date'},
            {key: 'size', label: 'size'},
            {key: 'options', label: 'options', width: releaseEndPointUrl.value?'130px':'90px'}]);
        const rowClick = (row) => {
            close(localStorage.getItem(row.item.file));
        }
        const upload = ref(undefined);
        const isOpenedName = ref(false);
        const save_Ename = ref("");
        const content = ref<any>(undefined);
        const downloadItemById = (row) => {
            let blob = new Blob([localStorage.getItem(row.file)], {type: "application/json"});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = row.file + '.json';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

        }
        watch(upload, (newVal) => {
            if (newVal) {
                let name = newVal[0].name;
                let reader = new FileReader();
                reader.addEventListener('load', (result) => {
                    save_Ename.value = name.split('.')[0];
                    isOpenedName.value = true;
                    content.value = result.target.result ?? undefined;

                });
                reader.readAsText(newVal[0]);
            }
        })
        watch(isOpened, () => {
            date.value = new Date();
        })
        const save = () => {
            localStorage.setItem(save_Ename.value!, content.value);
            cancel();
        }
        const cancel = () => {
            isOpenedName.value = false;
            content.value = undefined;
            save_Ename.value = '';
            upload.value = undefined;
            deleteFile.value = undefined;
            date.value = new Date();
        }
        const deleteItemById = (row) => {
            deleteFile.value = row.file;
            sureDelete.value = true;
        }
        const wantToUpload = (row) => {
            uploadFile.value = row.file;
            sureuploadFile.value = true;
        }
        const release = () => {
            if (uploadFile.value) {
                fetch(releaseEndPointUrl.value + '/' + uploadFile.value, {
                    method: 'POST',
                    body: localStorage.getItem(uploadFile.value),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then(result => {
                        notify({message: 'Upload successfull', color: 'success'});
                    }).catch(e => {
                    console.log(e);
                    notify({message: 'Upload failed', color: 'danger'});
                }).finally(() => {

                })
            }
        }
        const sdelete = () => {
            if (deleteFile.value) {
                localStorage.removeItem(deleteFile.value!);
            }
            cancel();
        }
        const sameName = computed(() => {
            return Object.keys(localStorage).includes(save_Ename.value)
        })
        const urlDialog = ref(false);

        const load = () => {
            error.value = false;
            errorMessage.value = "";

            loadingUrl.value = true;
            fetch(url_name.value)
                .then((response) => response.json())
                .then(result => {

                    const keys = Object.keys(result);
                    if (keys.includes('layout') && keys.includes('stores') && keys.includes('datasources') && keys.includes('widgets')) {
                        urlDialog.value = false;
                        isOpenedName.value = true;
                        content.value = JSON.stringify(result);
                    } else {
                        throw new Error('Format not suported')
                    }

                }).catch(e => {
                console.log(e);
                error.value = true;
                errorMessage.value = e.toString();
            }).finally(() => {
                loadingUrl.value = false;
            })
        }
        return {
            errorMessage,
            error,
            load,
            loadingUrl,
            url_name,
            urlDialog,
            sameName,
            deleteItemById,
            sureDelete,
            sdelete,
            cancel,
            save,
            save_Ename,
            isOpenedName,
            upload,
            downloadItemById,
            rowClick,
            savedData,
            columns,
            isOpened,
            run,
            close,
            ok,
            release,
            releaseEndPointUrl,
            sureuploadFile,
            uploadFile,
            wantToUpload
        };
    }
}
</script>

<template>
    <va-modal
        blur
        :modelValue="isOpened"
        no-padding
        hide-default-actions
        size="auto"
        class="save-modal"
        stateful
    >
        <template #footer class="footer">
            <div class="flexbox">

                <VaFileUpload v-model="upload" class="marginr"/>
                <VaButton @click="urlDialog=true"> get from URL</VaButton>
            </div>
            <VaButton preset="secondary" @click="ok"> cancel</VaButton>
        </template>
        <template #default="{ ok }">
            <div class="save-modal-content">
                <div class="m-4">
                    <h6 class="va-h6">Load...</h6>
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
                        >
                            <template #cell(options)="{ rowIndex ,row}">
                                <VaButton
                                    preset="plain"
                                    icon="download"
                                    class="ml-3"
                                    @click="(ev)=>{ev.stopImmediatePropagation();downloadItemById(row.rowData)}"
                                />
                                <VaButton
                                    preset="plain"
                                    icon="delete"
                                    class="ml-3"
                                    @click="(ev)=>{ev.stopImmediatePropagation();deleteItemById(row.rowData)}"
                                />
                                <VaButton
                                    preset="plain"
                                    icon="cloud_upload"
                                    class="ml-3"
                                    v-if="releaseEndPointUrl"
                                    @click="(ev)=>{ev.stopImmediatePropagation();wantToUpload(row.rowData)}"
                                />
                            </template>
                            <template #cell(icon)="{ rowIndex ,row}">
                                <VaIcon name="newspaper"/>

                            </template>
                        </VaDataTable>


                    </div>

                </div>


            </div>
        </template>

    </va-modal>
    <va-modal
        :modelValue="isOpenedName"
        size="auto"
        hide-default-actions
    >

        <template #default="{ ok }">

            <h1 class="mb-4">Save As</h1>
            <va-divider/>
            <VaInput
                class="full"
                v-model="save_Ename"

                placeholder="save as"
            />


        </template>
        <template #footer class="footer">
            <VaButton preset="secondary" @click="cancel"> cancel</VaButton>
            <VaButton color="danger" @click="()=>{save()}" v-if="sameName"> override</VaButton>
            <VaButton @click="()=>{save()}" v-else> save</VaButton>
        </template>

    </va-modal>
    <VaModal
        size="auto"
        hide-default-actions
        v-model="sureDelete">
        <div class="deleteDailog">
            <h5 class="va-h5">
                Delete Item ?
            </h5>
        </div>
        <template #footer class="footer">
            <VaButton preset="secondary" @click="()=>{cancel(),sureDelete=false}"> cancel</VaButton>
            <VaButton color="danger" @click="()=>{sdelete(),sureDelete=false}"> Delete</VaButton>
        </template>
    </VaModal>
    <VaModal
        size="auto"
        hide-default-actions
        v-model="sureuploadFile">
        <div class="deleteDailog">
            <h5 class="va-h5">
                Upload Config {{ uploadFile }} ?
            </h5>
        </div>
        <template #footer class="footer">
            <VaButton preset="secondary" @click="()=>{cancel(),sureuploadFile=false}"> cancel</VaButton>
            <VaButton @click="()=>{release(),sureuploadFile=false}"> Upload</VaButton>
        </template>
    </VaModal>
    <va-modal
        :modelValue="urlDialog"
        size="auto"
        hide-default-actions
    >

        <template #default="{ ok }">

            <h1 class="mb-4">Enter URL:</h1>
            <va-divider/>
            <VaInput
                class="full"
                v-model="url_name"
                :error-messages="errorMessage"
                :error="error"
                placeholder="url"
            />


        </template>
        <template #footer class="footer">

            <VaButton preset="secondary" @click="cancel"> cancel</VaButton>

            <VaButton :loading="loadingUrl" @click="()=>{load()}"> load</VaButton>


        </template>

    </va-modal>

</template>

<style lang="scss" scoped>
.marginr {
    margin-right: 15px;
}

.flexbox {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
}

.deleteDailog {
    min-width: 250px;
}

.save-modal-content {

    padding: 10px;
    width: 100%;
    min-width: 500px;

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
        flex-wrap: nowrap;
        justify-content: flex-end;
    }
}
</style>
