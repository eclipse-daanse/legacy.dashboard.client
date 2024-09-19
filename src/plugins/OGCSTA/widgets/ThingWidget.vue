<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import {LGeoJson, LIcon, LMap, LMarker, LTileLayer} from "@vue-leaflet/vue-leaflet";

import {
    type Location
} from "@/plugins/OGCSTA/dataSources/STAClient";

interface IThingWidgetProps {
    baseMapUrl?: string;
    zoom?: number,
    center?: any,
    attribution?: string,
    renderer: IRenderer[]

}

import {pointOnFeature} from '@turf/point-on-feature';
import {computed, inject, onMounted, reactive, ref, watch} from "vue";
import ThingWidgetSettings from "./ThingWidgetSettings.vue";
import {useSettings} from "@/composables/widgets/settings";
import {useStore} from "@/composables/widgets/store";
import {useSerialization} from "@/composables/widgets/serialization";
import type {Store} from "@/stores/Widgets/Store";
import {resolve} from "@/utils/helpers";
import IconWidget from "@/components/Widgets/Icon/IconWidget.vue";
import type {IRenderer} from "@/plugins/OGCSTA/widgets/api/Renderer";
import {useComparator} from "@/plugins/OGCSTA/composables/comparator";
import {useDataPointRegistry} from "@/plugins/OGCSTA/composables/datapointRegistry";
import StaStore from "@/plugins/OGCSTA/stores/StaStore";
import {useUtils} from "@/plugins/OGCSTA/composables/utils";
import L, {divIcon, DivIcon, point} from "leaflet";
import {LMarkerClusterGroup} from "vue-leaflet-markercluster";
import "vue-leaflet-markercluster/dist/style.css";
import type {TinyEmitter} from "tiny-emitter";

const settingsComponent = ThingWidgetSettings;

const props = withDefaults(defineProps<IThingWidgetProps>(), reactive({
    baseMapUrl: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    zoom: 14,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    center: [50.93115286, 11.60392726],
    renderer: () => []
}));
const map = ref(null);
const {settings, setSetting} = useSettings<typeof props>(props);
const eventbus = inject("customEventBus") as TinyEmitter;
const {store, data, setStore} = useStore<StaStore>(eventbus);
const {getState} = useSerialization(settings);
const thingsLayer = ref(null);
const {compareDatastream, compareThing} = useComparator();
const {isPoint, isFeatureCollection} = useUtils();
const openThing = ref<object[]>([])

defineExpose({
    setSetting,
    settings,
    settingsComponent,
    store,
    setStore,
    getState,
});
const {getById} = useDataPointRegistry();

onMounted(() => {

    const mapDiv = document.getElementById("map");
    const resizeObserver = new ResizeObserver(() => {
        if (map.value && map.value.leafletObject) {
            map.value.leafletObject.invalidateSize();
        }

    });

    resizeObserver.observe(mapDiv);
})

const locations = computed(() => {
    return data.value['locations'];

})
watch(settings, () => {
    console.log('settings changed')
}, {deep: true})

const rendereComp = computed(() => {
    console.log('comp renderer')
    return settings.value.renderer;
})
const rev = (arr: any) => {
    return {
        lat: arr[1],
        lng: arr[0]
    }
}
const reverse = (arr: any) => {
    return [arr[1], arr[0]]
}
const settings_co = (loc) => {

    return computed(() => {
        console.log('computed');
        if (resolve(settings, 'value', 'renderer', 0, 'renderer', 'point')) {
            return settings.value.renderer[0].renderer.point;
        } else return null
    });
}
const getStyle = computed(() => {

    return (feature) => {
        if (resolve(settings, 'value', 'renderer', 0, 'renderer', 'point')) {
            return settings.value.renderer[0].renderer.area;
        } else return {}
    }
})
const mapmove = () => {
    let inBounds = map.value.leafletObject.getBounds();

    //@ts-ignore
    if (locations && locations.value) {
        for (const location: Location of locations.value) {

            if (isPoint(location.location)) {
                if (inBounds.contains((reverse(location.location.coordinates)))) {
                    location.Things?.forEach(thing => {
                        thing.Datastreams?.forEach(async ds => {
                            if (!ds.Observations) {
                                ds = (await store.value.getObservations(ds));
                                console.log(ds);
                            }
                        })
                    });
                }
            }

        }

    }

}
const style = computed(() => {

    return (feature: any) => {

    };
})
const getPoints = (renderer) => {

}
const pointToLayerWrapper = (renderer) => {
    return (feature, latlng) => {

        const el = new IconWidget().$mount().$el;
        const outerhtlm = "<div style='background-color:#c30b82;' class='marker-pin'>" +
            el.outerHTML +
            "</div>";

        return L.marker(latlng, {
            icon: new DivIcon({

                html: outerhtlm
            })
        });
    }
};
const collectionToPoint = (fc) => {
    try {
        let point = pointOnFeature(fc)
        return reverse(point.geometry.coordinates)
    } catch (e) {
        return null
    }
}
const getPoint = (PointOrFeature: any) => {
    if (isPoint(PointOrFeature)) {
        return reverse(PointOrFeature.coordinates)
    } else if (isFeatureCollection(PointOrFeature)) {
        try {
            let point = pointOnFeature(PointOrFeature)
            return reverse(point.geometry.coordinates)
        } catch (e) {
            return null
        }
    }
}
const options = computed(() => {
    return {
        pointToLayer: (feature, latlng) => {
            console.log(feature)
            return L.circleMarker(latlng, {
                radius: 0,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 0,
                fillOpacity: 0
            })
        }
    }
})
const clusterDrawer = (cluster: any) => {
    const html = `${cluster.getChildCount()}`
    const icon = divIcon({
        className: 'red-cluster',
        html,
        iconSize: point(50, 50)
    })
    return icon
}
const refHolder = ref<Map<string, any>>(new Map<string, any>())
const setRef = (render, thing) => {

    refHolder.value.set(render.id + '_' + thing['@iot.id'], ref(undefined))
    return refHolder.value.get(render.id + '_' + thing['@iot.id']);
}

const _generatePointsSpiral = (count, centerPt) => {
    let spiderfyDistanceMultiplier = 3,
        legLength = spiderfyDistanceMultiplier * 11,
        separation = spiderfyDistanceMultiplier * 28,
        lengthFactor = spiderfyDistanceMultiplier * 5 * Math.PI * 2,
        angle = 0,
        res = [],
        i;

    res.length = count;


    for (i = count; i >= 0; i--) {
        if (i < count) {
            res[i] = [Math.round(centerPt[0] + legLength * Math.cos(angle)), Math.round(centerPt[1] + legLength * Math.sin(angle))];
        }
        angle += separation / legLength + i * 0.0005;
        legLength += lengthFactor / angle;
    }
    return res;
}
const c = () => {
    alert('c')
}
</script>

<template>
    <div class="cmap_container">
        <l-map id="map" ref="map" :center="center" :max-zoom="21" :useGlobalLeaflet="true" :zoom="zoom"
               style="height: 100%"
               @move="mapmove">
            <l-tile-layer :attribution="attribution" :options="{maxNativeZoom:19,
        maxZoom:25}" :url="baseMapUrl"></l-tile-layer>
            <!--<l-geo-json  :geojson="location.location"  v-for="location in locations" ref="thingsLayer" :options-style="getStyle"></l-geo-json>-->
            <!-- <v-marker-cluster :options="{spiderfyDistanceMultiplier:3.2,animate:true,animateAddingMarkers:true,zoomToBoundsOnClick:false,disableClusteringAtZoom:18}"
                               ref="clusterRef2">-->


            <template v-for="renderer in settings.renderer" :key="renderer.id">

                <template v-for="location in locations" :key="location['@iot.id']+'markr'">
                    <template v-for="thing in location.Things??[]" :key="thing['@iot.id']+'markrThing'">
                        <template v-if="compareThing(thing, renderer)">
                            <template v-if="isFeatureCollection(location.location)">
                                <l-geo-json v-if="!isPoint(location.location)" ref="thingsLayer"
                                            :geojson="location.location" :options="options"
                                            :options-style="renderer.renderer.area"></l-geo-json>
                            </template>


                            <l-marker
                                v-if="getPoint(location.location)"
                                :lat-lng="getPoint(location.location) as  L.LatLngExpression"
                                @click="openThing[thing['@iot.id']]=(openThing[thing['@iot.id']])?!openThing[thing['@iot.id']]:true">
                                <l-icon class-name="someExtraClass">
                                    <template v-if="renderer.renderer.point_render_as=='icon'">
                                        <div :style="{background:renderer.renderer.pointPin.color}" class="pin icon">
                                            <div class="inner">
                                                <IconWidget currentIcon="add_location_alt"
                                                            v-bind="renderer.renderer.point"></IconWidget>
                                            </div>
                                        </div>


                                    </template>
                                    <template v-if="renderer.renderer.point_render_as=='prop'">
                                        <div :style="{background:renderer.renderer.pointPin.color}"
                                             class="pin contain marker">
                                            <div class="inner">
                                                {{ thing[renderer.renderer.point_prop] }}
                                            </div>
                                        </div>
                                    </template>
                                    <!--<div class="pin">
                                        <div class="inner">
                                            <IconWidget v-bind="renderer.renderer.point" v-if="resolve(settings,'renderer',0,'renderer','point')"> </IconWidget>
                                        </div>

                                    </div>-->
                                </l-icon>
                            </l-marker>
                            <template v-for="datastream in thing.Datastreams??[]">
                                <l-geo-json v-if="isFeatureCollection(datastream.observedArea)" ref="thingsLayer"
                                            :geojson="datastream.observedArea" :options="options"
                                            :options-style="renderer.renderer.area"></l-geo-json>
                            </template>
                            <!--<l-marker-cluster-group  :spiderfyOnMaxZoom="1" :spiderfyOnEveryZoom="true" spiderfyDistanceMultiplier="5" :iconCreateFunction="clusterDrawer" :chunkedLoading="true" :ref="setRef(renderer,thing)">-->
                            <template v-for="(datastream,ind) in thing.Datastreams??[]">
                                <template v-for="subrenderer in renderer.ds_renderer">
                                    <template
                                        v-if="compareDatastream(datastream, subrenderer) && openThing[thing['@iot.id']]">
                                        <l-marker
                                            :lat-lng="getPoint(location.location) as L.LatLngExpression">
                                            <l-icon class-name="someExtraClass">
                                                <template v-if="subrenderer.renderer.point_render_as=='icon'">
                                                    <div :style="{marginLeft:_generatePointsSpiral(thing.Datastreams.length,[0,0])
                                [ind][1]+'px',background:subrenderer.renderer.pointPin.color,'margin-top':_generatePointsSpiral(thing.Datastreams.length,[0,0])[ind][0]+'px'}"
                                                         class="pin icon round">
                                                        <div class="inner">
                                                            <IconWidget
                                                                v-bind="subrenderer.renderer.point"></IconWidget>
                                                        </div>
                                                        <template v-if="datastream.Observations">
                                                            <component
                                                                :is="getById(subrenderer.observation.component)?.component"
                                                                v-if="getById(subrenderer.observation.component)"
                                                                :data="datastream.Observations[0]?.result||'null'"
                                                                v-bind="subrenderer.observation.setting"></component>
                                                        </template>

                                                    </div>


                                                </template>
                                                <template v-if="subrenderer.renderer.point_render_as=='prop'">
                                                    <div :style="{background:subrenderer.renderer.pointPin.color,marginLeft:_generatePointsSpiral(thing.Datastreams.length,[0,0])
                                             [ind][1]+'px','margin-top':_generatePointsSpiral(thing.Datastreams.length,[0,0])[ind][0]+'px'}"
                                                         class="pin round contain">
                                                        <div class="inner">
                                                            {{ datastream[subrenderer.renderer.point_prop] }}
                                                        </div>
                                                        <template v-if="datastream.Observations">
                                                            <component
                                                                :is="getById(subrenderer.observation.component)?.component"
                                                                v-if="getById(subrenderer.observation.component)"
                                                                :data="datastream.Observations[0]?.result||'null'"
                                                                v-bind="subrenderer.observation.setting"></component>
                                                        </template>
                                                    </div>
                                                </template>


                                            </l-icon>
                                        </l-marker>
                                    </template>
                                </template>
                            </template>
                            <!--</l-marker-cluster-group>-->
                        </template>
                    </template>
                </template>
            </template>

        </l-map>


    </div>
</template>

<style scoped>
.text-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 1rem;
    align-items: stretch;
}

.pin {
    width: 45px;
    height: 45px;
    border-radius: 50% 50% 50% 0;


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

.component {
    overflow: hidden;
}

.cmap_container {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
<style>
.holder {
    width: 20px;
    height: 20px;
    background-color: #000;
}
</style>
