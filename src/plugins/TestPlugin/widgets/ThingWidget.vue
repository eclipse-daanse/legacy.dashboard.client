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


//@ts-ignore
import CustomMarker from 'vue-leaflet-custom-marker';
import {
 type Location
} from "@/plugins/TestPlugin/dataSources/STAClient";

interface IThingWidgetProps {
  baseMapUrl?: string;
  zoom?:number,
  center?:any,
  attribution?:string,
  renderer:IRenderer[]

}
import {pointOnFeature} from '@turf/point-on-feature';
import {computed, onMounted, ref, watch} from "vue";
import ThingWidgetSettings from "./ThingWidgetSettings.vue";
import { useSettings } from "@/composables/widgets/settings";
import { useStore } from "@/composables/widgets/store";
import { useSerialization } from "@/composables/widgets/serialization";
import type { Store } from "@/stores/Widgets/Store";
import {resolve} from "@/utils/helpers";
import IconWidget from "@/components/Widgets/Icon/IconWidget.vue";
import type {IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import {useComparator} from "@/plugins/TestPlugin/composables/comparator";
import {useDataPointRegistry} from "@/plugins/TestPlugin/composables/datapointRegistry";
import StaStore from "@/plugins/TestPlugin/stores/StaStore";
import {useUtils} from "@/plugins/TestPlugin/composables/utils";
import {DivIcon} from "leaflet";
import {LMarkerClusterGroup} from "vue-leaflet-markercluster";
import "vue-leaflet-markercluster/dist/style.css";
const settingsComponent = ThingWidgetSettings;

const props = withDefaults(defineProps<IThingWidgetProps>(), {
  baseMapUrl: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  zoom:14,
  attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  center: [50.93115286, 11.60392726],
  renderer:() => []
});
const map = ref(null);
const { settings, setSetting } = useSettings<typeof props>(props);
const { store, data, setStore } = useStore<StaStore>();
const { getState } = useSerialization(settings);
const thingsLayer = ref(null);
const {compareDatastream,compareThing} = useComparator();
const {isPoint,isFeatureCollection} = useUtils();

defineExpose({
  setSetting,
  settings,
  settingsComponent,
  store,
  setStore,
  getState,
});
const {getById}= useDataPointRegistry();


onMounted(()=>{


const mapDiv = document.getElementById("map");
const resizeObserver = new ResizeObserver(() => {
  if(map.value && map.value.leafletObject){
    map.value.leafletObject.invalidateSize();
  }

});

resizeObserver.observe(mapDiv);
})


const locations = computed(()=>{
  return data.value['locations'];

})
watch(settings,()=>{
  console.log('settings changed')
},{deep:true})

const rendereComp = computed(()=>{
  console.log('comp renderer')
  return settings.value.renderer;
})
const rev=(arr: any)=> {
  return {
    lat: arr[1],
    lng: arr[0]
  }
}
const reverse=(arr: any)=> {
  return [arr[1],arr[0]]
}
const settings_co = (loc)=>  {

  return computed(()=>{
    console.log('computed');
    if(resolve(settings,'value','renderer',0,'renderer','point')){
      return settings.value.renderer[0].renderer.point;
    }else return null
  });
}
const getStyle = computed(()=>{

  return (feature)=> {
    if (resolve(settings, 'value', 'renderer', 0, 'renderer', 'point')) {
      return
        settings.value.renderer[0].renderer.area

    } else return {}
  }
})
const mapmove =  ()=>{
  let inBounds = map.value.leafletObject.getBounds();
  /*map.value.leafletObject.eachLayer(function(layer){
    console.log(layer)
    layer.eachLayer(function(marker) {
      if (inBounds.contains(marker.getLatLng())) {
        console.log(marker)
      }
    })
  });*/

  //@ts-ignore
  if(locations && locations.value) {

    /*myLayer.eachLayer(function(marker) {
      if (bounds.contains(marker.getLatLng())) {
        inBounds.push(marker.options.title);
      }
    });*/
    for(const location:Location of locations.value){

      if(isPoint(location.location)){
        if (inBounds.contains((reverse(location.location.coordinates)))){
          location.Things?.forEach(thing=>{
            thing.Datastreams?.forEach(async ds=>{
              if (!ds.Observations){
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
const style = computed(()=>{

  return (feature: any) => {

  };
})
const getPoints=(renderer)=>{

}
const pointToLayerWrapper = (renderer)=>{
  return (feature, latlng) =>{

    const el = new IconWidget().$mount().$el;

    return L.marker(latlng,{
      icon:new DivIcon({

        html: el.outerHTML
      })
    });
  }
};
const collectionToPoint=(fc)=>{
  try{
    let point =  pointOnFeature(fc)
    return reverse(point.geometry.coordinates)
  }catch (e){
    return null
  }
}
const getPoint=(PointOrFeature:any)=>{
  if(isPoint(PointOrFeature)){
    return reverse(PointOrFeature.coordinates)
  }else if(isFeatureCollection(PointOrFeature)){
    try{
    let point =  pointOnFeature(PointOrFeature)
    return reverse(point.geometry.coordinates)
    }catch (e){
      return null
    }
  }
}
const options=computed(()=>{
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
</script>

<template>
  <div class="cmap_container">
    <l-map id="map" ref="map" :zoom="zoom" :center="center"  :max-zoom="21" @move="mapmove"style="height: 100%">
      <l-tile-layer :url="baseMapUrl" :attribution="attribution" :options="{maxNativeZoom:19,
        maxZoom:25}"></l-tile-layer>
      <!--<l-geo-json  :geojson="location.location"  v-for="location in locations" ref="thingsLayer" :options-style="getStyle"></l-geo-json>-->
     <!-- <v-marker-cluster :options="{spiderfyDistanceMultiplier:3.2,animate:true,animateAddingMarkers:true,zoomToBoundsOnClick:false,disableClusteringAtZoom:18}"
                        ref="clusterRef2">-->


      <template v-for="renderer in rendereComp" :key="renderer.id">

        <template v-for="location in locations" :key="location['@iot.id']+'markr'">
          <template v-for="thing in location.Things??[]" :key="thing['@iot.id']+'markrThing'">
            <template v-if="compareThing(thing, renderer)">
              <template v-if="isFeatureCollection(location.location)">
                <l-geo-json  :geojson="location.location"  ref="thingsLayer" :options-style="renderer.renderer.area" :options="options" v-if="!isPoint(location.location)"></l-geo-json>
                {{location.location}}
              </template>


                <l-marker
                    :lat-lng="getPoint(location.location)" v-if="getPoint(location.location)">
                  <l-icon  class-name="someExtraClass">
                    <div>
                    <IconWidget v-bind="renderer.renderer.point" v-if="resolve(settings,'renderer',0,'renderer','point')"> </IconWidget>
                    </div>
                  </l-icon>
                </l-marker>
              <template v-for="datastream in thing.Datastreams??[]">
                <l-geo-json  :geojson="datastream.observedArea"  ref="thingsLayer" :options-style="renderer.renderer.area"  :options="options"></l-geo-json>
              </template>
              <l-marker-cluster-group>
              <template v-for="datastream in thing.Datastreams??[]">
                  <template v-if="compareDatastream(datastream, renderer)">
                  <l-marker
                      :lat-lng="getPoint(location.location)">
                    <l-icon  class-name="someExtraClass">
                      <IconWidget v-bind="renderer.renderer.point"> </IconWidget>
                <template v-if="datastream.Observations">
                  <component v-if="getById(renderer.datapoint.component)" :is="getById(renderer.datapoint.component)?.component" v-bind="renderer.datapoint.setting" :data="datastream.Observations[0]?.result||'null'"></component>
                </template>
                    </l-icon>
                  </l-marker>
                  </template>
              </template>
              </l-marker-cluster-group>
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

.component {
  overflow: hidden;
}
.cmap_container{
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
<style>
.holder{
  width:20px;
  height:20px;
  background-color: #000;
}
</style>
