<script setup lang="ts">
import type L from "leaflet";
import {LGeoJson, LMap, LTileLayer} from "@vue-leaflet/vue-leaflet";
import geoJsonExample from './geoJsonExample.json';
import {computed, ref, watch} from "vue";
import {useSettings} from "@/composables/widgets/settings";
import type {IMapProps} from "@/plugins/TestPlugin/widgets/api/MapPreview";
const baseMapUrl =  "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
const zoom = 5;
const attribution = '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const center =  [50.93115286, 11.60392726];
const geojosonExample = geoJsonExample;



const map = ref(null);
const props = withDefaults(defineProps<IMapProps>(),{
  stroke: true,
  color: '#623375',
  weight: 3,
  opacity: 1.0,
  lineCap: 'round',
  dashOffset: '',
  fill: true,
  fillOpacity: 0.2,
  fillColor:'#7e7e7e',
  className: ''
})
const { settings, setSetting } = useSettings<typeof props>(props);
const style=(feature)=>{
    return settings.value
  };


watch(()=>settings,()=>{
  map.value.leafletObject?.eachLayer((ly:any)=>{
    try {
      ly.setStyle(style)
    }catch (e){
      console.log(e);
    }
  });
},{deep:true})



defineExpose({
  setSetting,
  settings,
  props
});

</script>

<template>
  <div class="pmap_container">
    <l-map id="map" ref="map" :zoom="zoom" :center="center"  :max-zoom="21" style="height: 100%">
      <l-tile-layer :url="baseMapUrl" :attribution="attribution" :options="{maxNativeZoom:19,
        maxZoom:25}"></l-tile-layer>
      <l-geo-json  :geojson="geoJsonExample" :optionsStyle="style"></l-geo-json>
    </l-map>

  </div>
</template>

<style scoped>
.pmap_container{
  width: 100%;
  height: 350px;
}

</style>
