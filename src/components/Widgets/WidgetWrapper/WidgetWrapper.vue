<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>

interface IWrapperSettingsProps {
  title?: string;
  backgroundColor?: string;
  backgroundColorTransparence?: number;
  titleColor?: string;
  titleFontSize?: number;
  borderSize?: number;
  borderColor?: string;
  borderRadius?: number;
  fullscreen?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowX?: number;
  shadowY?: number;
  shadowTransparence?: number;
  transparency?: number;
}

import { computed, ref, provide } from "vue";
import { useSettings } from "@/composables/widgets/settings";
import { useSerialization } from "@/composables/widgets/serialization";
import WidgetWrapperSettings from "./WidgetWrapperSettings.vue";

const settingsComponent = WidgetWrapperSettings;

const props = withDefaults(defineProps<IWrapperSettingsProps>(), {
  title: "",
  backgroundColor: "#fff",
  backgroundColorTransparence: 255,
  titleColor: "#000",
  titleFontSize: 20,
  borderSize: 1,
  borderColor: "#000",
  borderRadius: 4,
  fullscreen: false,
  shadowColor: "#000",
  shadowBlur: 0,
  shadowX: 0,
  shadowY: 0,
  shadowTransparence: 255,
  transparency: 1,
})

const { settings, setSetting } = useSettings<typeof props>(props);
const { getState } = useSerialization(settings);
const loading = ref(false);

provide("updateLoading", loading);

const fullscreenEnabled = ref(false);

defineExpose({
  setSetting,
  settings,
  settingsComponent,
  getState,
});

const getShadow = computed(()=>{
  let post = ''
  if(settings.value.shadowTransparence) {
    post = settings.value.shadowTransparence.toString(16);
  }
  let color = settings.value.shadowColor.replace('#','');
  if(color.length == 3){
    color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
  }

  const ret = `${settings.value.shadowX}px ${settings.value.shadowY}px ${settings.value.shadowBlur}px #${color}${post}`;
  return ret;
});
const getBackground = computed(()=>{
  let post = ''
  if(settings.value.backgroundColorTransparence) {
    post = settings.value.backgroundColorTransparence.toString(16);
  }
  let color = settings.value.backgroundColor.replace('#','');
  if(color.length == 3){
    color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
  }

  const ret = `#${color}${post}`;
  return ret;
});
</script>

<template>
  <div class="wrapper-container">
    <va-inner-loading class="loader" :loading="loading" :size="55">
      <div v-if="settings.fullscreen && !loading" class="wrapper-fullscreen_icon">
        <VaButton
          preset="secondary"
          icon="fullscreen"
          @click="fullscreenEnabled = true"
        />
      </div>
      <div v-if="settings.title && !loading" class="wrapper-title">{{ settings.title }}</div>
      <slot v-if="!loading"></slot>
      <template v-if="fullscreenEnabled && !loading">
        <Teleport to="body">
          <div class="fullscreen-container">
            <div class="wrapper-fullscreen_icon">
              <VaButton
                preset="secondary"
                icon="close"
                @click="fullscreenEnabled = false"
              />
            </div>
            <div v-if="settings.title" class="wrapper-title">{{ settings.title }}</div>
            <slot></slot>
          </div>
        </Teleport>
      </template>
    </va-inner-loading>
  </div>
</template>

<style scoped>
.wrapper-container {
  display: flex;
  position: relative;
  flex-direction: column;
  background-color: v-bind(getBackground);
  border-color: v-bind(settings.borderColor);
  border-width: v-bind(settings.borderSize + "px");
  border-style: solid;
  border-radius: v-bind(settings.borderRadius + "px");
  overflow: hidden;
  width: 100%;
  height: 100%;
  box-Shadow: v-bind(getShadow);
  opacity:v-bind(settings.transparency);
}

.component {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wrapper-title {
  padding: 8px;
  font-size: v-bind(settings.titleFontSize + "px");
  font-weight: 600;
  text-transform: capitalize;
  color: v-bind(settings.titleColor);
}

.wrapper-fullscreen_icon {
  background-color: #eee;
  color: #333;
  position: absolute;
  right: 10px;
  top: 10px;
  border-radius: 4px;
  z-index: 1000;
}

.fullscreen-container {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #fff;
  z-index: 10000000000;
}

.loader {
  height: 100%;
}
</style>
