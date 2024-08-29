<script lang="ts" setup>

import {computed, type ModelRef, reactive, ref, watch} from "vue";
import IconWidget, {type IIconSettingsProps} from "@/components/Widgets/Icon/IconWidget.vue";


import MapSettings from "@/plugins/TestPlugin/widgets/parts/MapSettings.vue";
import IconWidgetSettings, {type IIconSettings} from "@/components/Widgets/Icon/IconWidgetSettings.vue";
import {v4} from "uuid";
import {ERefType, type IDSRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import MapPreview from "@/plugins/TestPlugin/widgets/parts/MapPreview.vue";
import type {IMapProps} from "@/plugins/TestPlugin/widgets/api/MapPreview";
import {
    type IValueUnitDataLabelRendererComonent
} from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRendererSettings.vue";
import {useDataPointRegistry} from "@/plugins/TestPlugin/composables/datapointRegistry";
import MapPreviewPoint from "@/plugins/TestPlugin/widgets/parts/MapPreviewPoint.vue";
import {LIcon, LMarker} from "@vue-leaflet/vue-leaflet";


const model: ModelRef<IDSRenderer> = defineModel<IDSRenderer>({
    default:
        () => {
            return (
                reactive({
                    datastream: {
                        prop: '*',
                        value: '',
                    },
                    placement: ERefType.Thing,
                    renderer: {
                        point_render_as:'icon',
                        point_prop:'name',
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
                    observation: {
                        setting: {},
                        component: 'generalValueUnitDataPointRenderer',

                    },
                    id: v4()
                } as IDSRenderer
            ))
        }
});
const EMIT_ADD_SUB_RENDERER = 'addSubRenderer';

enum Selector {
    Non,
    All
}

const {getAll, getById} = useDataPointRegistry()
const emit = defineEmits<{
    (
        e: 'addSubRenderer', renderer: IDSRenderer)
}>()


const thingPropValue = ref('');
const dsPropValue = ref('')
const thingsPropOptions = [{
    text: 'id',
    selector: '@iot.id'
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
const iconMapComponent = ref(undefined);
const MapPrev = ref('');
const valuedatalabelrenderer = ref<IValueUnitDataLabelRendererComonent | undefined>(undefined);


const submit = () => {
    emit(EMIT_ADD_SUB_RENDERER, model.value as IDSRenderer);
}
const rendererOptions = computed(() => {
        let ret = []
        getAll().forEach((val, key) => ret.push({name: val.name, id: val.namespace + val.qualifiedName}));
        return ret
    }
)
const dataPointcomponentDesc = computed(() => {
    return getById(value.value)
})
const value = computed({
    get: () => model.value?.observation.component,
    set: (val: string) => {
        let m = model.value;
        m!.observation.component = val;
        model.value = m;
    }
})
defineExpose({
    submit
});

watch(() => (iconMapComponent.value as IconWidget)?.settings, (nv: IIconSettings) => {
    console.log(nv);
    if (nv) {
        model.value!.renderer!.point = nv;
    }
})
watch(() => ((MapPrev.value) as MapPreview)?.settings, (nv: IMapProps) => {
    model.value!.renderer!.area = nv;
})
watch(() => ((valuedatalabelrenderer.value) as any)?.settings, (nv: any) => {
    model.value!.observation.setting = nv;
})

const columns = [
    {key: "datastream.prop", sortable: true},
    {key: "datastream.value", sortable: true},
    {key: "actions", width: 80},
];
const add = () => {

}
const pointSelectorOptions = [
    {label: 'Icon', value: 'icon'},
    {label: 'Property', value: 'prop'},
    {label: 'None', value: 'none'},
]

const propName = model.value.renderer.point_prop;
</script>

<template>
    <h1 class="va-h3">DataStreamRenderer</h1>
    <div style="height:15px"></div>

    <h2>Filter</h2>
    <VaDivider class="mb15"/>
    <br>
    <div class="row align-start">

        <div class="flex flex-col md12 ">

            <VaSelect
                v-model="model.datastream.prop"
                :options="thingsPropOptions"
                label="DataStream Prop"
                placeholder="Select an option"
                text-by="text"
                value-by="selector"
            />
            &nbsp;=&nbsp;
            <va-input
                v-model="model.datastream.value"
                class="text-color"
                label="DataStream Value"
            />
        </div>
    </div>
    <br>
    <div style="height:25px"></div>
    <h2>DataStream Indicator</h2>
    <VaDivider class="mb15"/>

    <div class="row align-start">



        <div class="flex flex-col md6 pa-3">
            <MapPreviewPoint ref="MapPrev2">

                <l-marker
                    :lat-lng="[50.92828047934907,11.587408017353823]">
                    <l-icon  class-name="someExtraClass">


                <template v-if="model.renderer.point_render_as=='icon'">
                <div class="pin icon round">
                    <div class="inner">
                        <IconWidget currentIcon="add_location_alt" ref="iconMapComponent" v-bind="model.renderer.point"></IconWidget>
                    </div>

                </div>


                </template>
                <template v-if="model.renderer.point_render_as=='prop'">
                    <div class="pin round contain">
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
            <br>
            <template v-if="model.renderer.point_render_as=='icon'">
                <IconWidgetSettings v-if="iconMapComponent" :component="iconMapComponent"></IconWidgetSettings>
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
            <VaDivider class="mb15"/>
            <va-color-input
                v-if="model.renderer.point_render_as!='none'"
                v-model="model.renderer.pointPin.color"
                class="pin-r-color"
                label="Pin Color"
            />

        </div>

    </div>

    <div style="height:25px"></div>
    <h2>Observed Area</h2>
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
    <h2>Observations</h2>
    <VaDivider class="mb15"/>


    <label id="input-label-240" aria-hidden="true"
           class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer" style="color: var(--va-primary);">render within </label>
    <VaOptionList
        v-model="model.placement"
        :options="[ERefType.Thing,ERefType.OberservedArea]"
        label="render within"
        type="radio"
    />
    <div class="max-w-xs">
        <VaSelect
            v-if="rendererOptions"
            v-model="value"
            :options="rendererOptions"
            label="renderer"
            placeholder="Select an option"
            text-by="name"
            value-by="id"
        />
    </div>

    <template v-if="dataPointcomponentDesc">


        <div class="flex flex-col md6 pa-3">


        </div>
        <div class="row">
        <div class="flex flex-col md6 pa-3">
            <MapPreviewPoint ref="MapPrev2">

                <l-marker
                    :lat-lng="[50.92828047934907,11.587408017353823]">
                    <l-icon  class-name="someExtraClass">


                        <template v-if="model.renderer.point_render_as=='icon'">
                            <div class="pin icon round">
                                <div class="inner">
                                    <IconWidget ref="iconMapComponent2" v-bind="model.renderer.point"></IconWidget>
                                </div>

                            </div>


                        </template>
                        <template v-if="model.renderer.point_render_as=='prop'">
                            <div class="pin round contain">
                                <div class="inner">
                                    {{ model.renderer.point_prop }}
                                </div>
                            </div>
                        </template>
                        <component :is="dataPointcomponentDesc.component" ref="valuedatalabelrenderer"
                                   :data="dataPointcomponentDesc.example" v-bind="model.observation.setting"></component>
                    </l-icon>
                </l-marker>
            </MapPreviewPoint>
        </div>
            <div class="flex flex-col md6 pa-3">
            <template v-if="valuedatalabelrenderer">
                <component :is="valuedatalabelrenderer?.settingsComponent"
                           v-bind="{component:valuedatalabelrenderer}"></component>
            </template>
            </div>

        </div>
    </template>


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
    .datapoint{
        margin-top: 10px;
        margin-left: -1px;
    }

}

</style>
