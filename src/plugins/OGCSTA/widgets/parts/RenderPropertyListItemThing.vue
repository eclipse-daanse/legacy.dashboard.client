<script lang="ts" setup>

import {computed, type ModelRef, reactive, ref, watch} from "vue";
import IconWidget, {type IIconSettingsProps} from "@/components/Widgets/Icon/IconWidget.vue";

import MapSettings from "@/plugins/OGCSTA/widgets/parts/MapSettings.vue";
import IconWidgetSettings, {type IIconSettings} from "@/components/Widgets/Icon/IconWidgetSettings.vue";
import {v4} from "uuid";
import {Comperator, type ICondition, type IDSRenderer, type IRenderer} from "@/plugins/OGCSTA/widgets/api/Renderer";
import MapPreview from "@/plugins/OGCSTA/widgets/parts/MapPreview.vue";
import type {IMapProps} from "@/plugins/OGCSTA/widgets/api/MapPreview";
import {
    type IValueUnitDataLabelRendererComonent
} from "@/plugins/OGCSTA/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRendererSettings.vue";
import {useDataPointRegistry} from "@/plugins/OGCSTA/composables/datapointRegistry";
import MapPreviewPoint from "@/plugins/OGCSTA/widgets/parts/MapPreviewPoint.vue";
import RenderPropertyListItemDataStream from "@/plugins/OGCSTA/widgets/parts/RenderPropertyListItemDataStream.vue";
import {LIcon, LMarker} from "@vue-leaflet/vue-leaflet";

const model: ModelRef<IRenderer> = defineModel<IRenderer>({
    default: () => {
        return reactive({
            thing: [{
                prop: 'id',
                comperator: Comperator.equals,
                value: '*'
            }],
            ds_renderer: [],
            renderer: {
                show_SubElements: false,
                point_render_as: 'icon',
                point_prop: 'name',
                point: {
                    currentIcon: '10k',
                    iconColor: '#545050',
                    iconSize: 48,
                    isIconFilled: false,
                    strokeWeight: 2,
                    opticSize: 24,
                    grade: 1
                } as IIconSettings,
                pointPin: {
                    color: '#ccc'
                },
                area: {
                    stroke: true,
                    color: '#ccc',
                    weight: 2,
                    opacity: 1,
                    lineCap: 'None',
                    dashOffset: 2,
                    fill: true,
                    fillOpacity: 1,
                    className: ''
                } as IMapProps,
            },
            id: v4()
        } as IRenderer)
    }
})
const EMIT_ADD_RENDERER = 'addRenderer';

enum Selector {
    Non,
    All
}

const showModal = ref(false);
const editmodel = ref<IDSRenderer | undefined>(undefined)

const {getAll, getById} = useDataPointRegistry()
const emit = defineEmits<{
    (
        e: 'addRenderer', renderer: IRenderer)
}>()

const thingPropValue = ref('');
const dsPropValue = ref('')

const pointSelectorOptions = [
    {label: 'Icon', value: 'icon'},
    {label: 'Property', value: 'prop'},
    {label: 'None', value: 'none'},
]
const thingsPropOptions = [{
    text: 'id',
    selector: '@iot\.id'
},
    {
        text: 'name',
        selector: 'name'
    },
    {
        text: 'decription',
        selector: 'description'
    },
    {
        text: 'property',
        selector: 'property'
    },
    {
        text: 'all',
        selector: '*'
    }]
const component = ref(undefined);
const MapPrev = ref('');
const valuedatalabelrenderer = ref<IValueUnitDataLabelRendererComonent | undefined>(undefined);

const submit = () => {
    emit(EMIT_ADD_RENDERER, model.value as IRenderer);
}
const rendererOptions = computed(() => {
        let ret = []
        getAll().forEach((val, key) => ret.push({name: val.name, id: val.namespace + val.qualifiedName}));
        return ret
    }
)

defineExpose({
    submit
});

watch(() => (component.value as IconWidget)?.settings, (nv: IIconSettings) => {
    if (nv) {
        model.value!.renderer!.point = nv;
    }
})
watch(() => ((MapPrev.value) as MapPreview)?.settings, (nv: IMapProps) => {
    model.value!.renderer!.area = nv;
})

const columns = [
    {key: "name", sortable: true},
    {key: "id", sortable: true},
    {key: "actions", width: 80},
];
const filtercolumns = [
    {key: "prop", sortable: true},
    {key: "comperator", sortable: true},
    {key: "value", sortable: true},
    {key: "actions", width: 80},
];
const ComperatorOptions = [{
    text: '==',
    selector: Comperator.equals
},
    {
        text: '>',
        selector: Comperator.greaterThen
    },
    {
        text: '>=',
        selector: Comperator.greaterThenEquals
    },
    {
        text: '<',
        selector: Comperator.lessThen
    },
    {
        text: '<=',
        selector: Comperator.lessThenEquals
    },
    {
        text: '!=',
        selector: Comperator.notEQuals
    }
]
const add = () => {
    editmodel.value = undefined;
    showModal.value = true;
}
const editRowById = (row) => {
    console.log(row)
    console.log(model.value?.[row])
    editmodel.value = model.value.ds_renderer[row];
    showModal.value = true;
}

const deleteItemById = (row: number) => {
    model.value.ds_renderer.splice(row)
}
const addSubRenderer = (renderer: IDSRenderer) => {
    model.value.ds_renderer.push(renderer)
    //model.value = model.value;
}
const listitem2 = ref(null);
const propName = ref('id');
const newCreateProp = ref();
const newCreateValue = ref();
const newCreateComperator = ref({
    text: '==',
    selector: Comperator.equals
});

const addNewOption = (val) => {
    const option = {
        text: val,
        selector: val,
    };
    thingsPropOptions.push(option);
    return option;
}
const addContition = () => {
    model.value.thing.push({
        comperator: newCreateComperator.value.selector,
        value: newCreateValue.value,
        prop: newCreateProp.value.selector,
    } as ICondition)
    newCreateComperator.value = {
        text: '==',
        selector: Comperator.equals
    };
    newCreateValue.value = "";
    newCreateProp.value = "";

}
</script>

<template>

    <h1 class="va-h3">Thing Renderer</h1>
    <div style="height:15px"></div>
    <h2>Name</h2>
    <VaDivider class="mb15"/>
    <VaInput v-model="model.name"
             placeholder="Enter Name"
    />
    <div style="height:35px"></div>
    <h2>Filter</h2>
    <VaDivider class="mb15"/>

    <div class="row align-start">

        <VaDataTable
            :columns="filtercolumns"
            :items="model.thing"
            class="table-crud thing prop"
            striped
        >
            <template #headerAppend>
                <tr class="table-crud__slot">
                    <th class="p-1">
                        <VaSelect
                            v-model="newCreateProp"
                            :options="thingsPropOptions"
                            :track-by="(option:any) => option.selector"
                            allow-create
                            placeholder="Select an option"
                            @create-new="(val)=>{

                                newCreateProp = addNewOption(val);
                            }"
                        />
                    </th>
                    <th class="p-1">
                        <VaSelect
                            v-model="newCreateComperator"
                            :options="ComperatorOptions"
                            :track-by="(option:any) => option.selector"
                        />
                    </th>
                    <th class="p-1">
                        <VaInput v-model="newCreateValue"
                                 placeholder="Enter value"
                        />
                    </th>
                    <th class="p-1">
                        <VaButton
                            block
                            style="min-width: 40px; float: right;"
                            @click="addContition"
                            :disabled="!newCreateProp  || !newCreateValue"
                        >
                            Add
                        </VaButton>
                    </th>
                </tr>
            </template>


            <template #cell(actions)="{ rowIndex }">
                <VaButton
                    class="ml-3"
                    icon="delete"
                    preset="plain"
                    style="min-width: 40px; float: right;"
                    @click="()=>{
                        model.thing.splice(rowIndex,1)
                    }"
                />
            </template>
            <template #cell(prop)="{ value, row }">
                <div class="table-inline__cell">
                    <VaValue v-slot="doShowInput">
                        <VaSelect
                            v-if="doShowInput.value"
                            :model-value="value"
                            :options="thingsPropOptions"
                            :track-by="(option:any) => option.selector"
                            allow-create
                            placeholder="Select an option"
                            @create-new="(val)=>{
                            const option = addNewOption(val);
                                 row.rowData['prop'] = option.selector;
                                  doShowInput.value = false
                            }"
                            @update:modelValue="(event) => {
                                  row.rowData['prop'] = event.selector
                                  doShowInput.value = false
                                }"
                        />
                        <span
                            class="table-inline__item"
                            :class="doShowInput.value ? 'table-inline__item--hidden' : ''"
                            @click="doShowInput.value = true"
                        >
                            {{ value }}
                      </span>
                    </VaValue>
                </div>
            </template>
            <template #cell(comperator)="{ value, row }">
                <div class="table-inline__cell">
                    <VaValue v-slot="doShowInput">
                        <VaSelect
                            v-if="doShowInput.value"
                            :model-value="{text:ComperatorOptions.filter(e=>e.selector==value)[0].text,selector:value}"
                            :options="ComperatorOptions"
                            :track-by="(option:any) => option.selector"
                            @update:modelValue="(event) => {
                                  row.rowData['comperator'] = event.selector
                                  doShowInput.value = false
                                }"
                        />
                        <span
                            class="table-inline__item"
                            :class="doShowInput.value ? 'table-inline__item--hidden' : ''"
                            @click="doShowInput.value = true"
                        >
                            {{ ComperatorOptions.filter(e => e.selector == value)[0].text }}
                      </span>
                    </VaValue>
                </div>
            </template>
            <template #cell(value)="{ value, row }">
                <div class="table-inline__cell">
                    <VaValue v-slot="doShowInput">

                        <VaInput
                            v-if="doShowInput.value"
                            :model-value="value"
                            @blur="doShowInput.value = false"
                            @change="(event) => {
                                  row.rowData['value'] = event.target.value
                                  doShowInput.value = false
                                }"
                        />
                        <span
                            class="table-inline__item"
                            :class="doShowInput.value ? 'table-inline__item--hidden' : ''"
                            @click="doShowInput.value = true"
                        >
                            {{ value }}
                      </span>
                    </VaValue>
                </div>
            </template>
        </VaDataTable>

    </div>
    <br>
    <div style="height:25px"></div>
    <h2>Point Icon Style</h2>
    <VaDivider class="mb15"/>

    <div class="row align-start">

        <div class="flex flex-col md6 pa-3">
            <MapPreviewPoint ref="MapPrev2" v-bind="model.renderer.point">
                <l-marker
                    :lat-lng="[50.92828047934907,11.587408017353823]">
                    <l-icon class-name="someExtraClass">


                        <template v-if="model.renderer.point_render_as=='icon'">
                            <div class="pin icon">
                                <div class="inner">
                                    <IconWidget ref="component" currentIcon="add_location_alt"
                                                v-bind="model.renderer.point"></IconWidget>
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
                <IconWidgetSettings v-if="component" :component="component"></IconWidgetSettings>
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
                    v-model="model.renderer.pointPin.color"
                    class="pin-color"
                    label="Pin Color"

                />
            </template>
        </div>

    </div>

    <div style="height:25px"></div>
    <h2>Area Style</h2>
    <VaDivider class="mb15"/>

    <div class="row">
        <div class="flex flex-col md6 pa-3">
            <MapPreview ref="MapPrev" v-bind="model.renderer.area"></MapPreview>
        </div>
        <div class="flex flex-col md6 pa-3">
            <MapSettings v-if="MapPrev" :component="MapPrev"></MapSettings>
        </div>

    </div>

    <div style="height:25px"></div>
    <h2>DataLabels</h2>
    <VaDivider class="mb15"/>


    <VaDataTable
        :columns="columns"
        :items="model.ds_renderer"
        class="table-crud2"
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


    <!--<TLCDataLabelRenderer :data="'🟢⚪⚪'" ref="tlc"></TLCDataLabelRenderer>-->
    <VaModal
        v-model="showModal"
        :beforeOk="hide => {if(editmodel === undefined){(listitem2 as RenderPropertyListItemDataStream).submit()}hide()}"
        blur
        class="table-crud"
        close-button
        fixed-layout
        max-height="800px"
    >
        <RenderPropertyListItemDataStream ref="listitem2" v-model="editmodel"
                                          @add-sub-renderer="addSubRenderer"></RenderPropertyListItemDataStream>

    </VaModal>

</template>

<style lang="scss" scoped>
.va-input-wrapper__size-keeper {
 width: 100%;
 min-width: 100%;
}

.table-crud {

    &.thing{
        --va-form-element-default-width: 0;
        --va-input-wrapper-width:auto;
        th{
            padding: 5px;
        }
        th:nth-child(1){
            width: 250px;
        }
        th:nth-child(2){
            width: 50px;
        }
    }


.va-input {
    display: block;
}

&__slot {
    th {
        vertical-align: middle;
    }
}
}

.table-inline {
&__cell {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
}

&__item {
    cursor: pointer;

    &--hidden {
        z-index: -1;
        opacity: 0;
        pointer-events: none;
    }
}

.va-input {
    position: absolute;
    width: 100%;
}
}

.mb15 {
margin-bottom: 15px;
}

.pin {
width: 45px;
height: 45px;
border-radius: 50% 50% 50% 0;

background: v-bind('model.renderer.pointPin.color');
transform: rotate(-45deg);
left: 50%;
top: 50%;
margin: -15px 71px 0 -15px;
box-shadow: -4px -6px 8px #0000005c;

&.round {
    border-radius: 50% 50% 50% 50%;
}

&.contain {
    width: auto;
    height: auto;
    border-radius: 25%;
    display: inline-block;
    transform: rotate(0deg);
    padding: 4px;
    margin: 0px;

    .inner {
        width: auto;
        height: auto;
        margin: 0;
        position: relative;
        transform: rotate(0deg);
        border-radius: 17%;
        display: inline-block;
        font-size: 13px;
        padding: 3px;
    }
}

&.marker {
    &::before {

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

    }
}

.inner {
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
