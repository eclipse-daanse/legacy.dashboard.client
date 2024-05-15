<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import type { IconSharingComponentProps, IconComponentProps } from "@/@types/widgets";
import { ref, computed, type Ref, type Component } from "vue";
import IconWidgetSettings from "./IconWidgetSettings.vue";
const settings: Component = IconWidgetSettings;

const props = defineProps({
  initialState: {
    type: Object,
    required: false,
  },
  currentIcon: {
    type: String,
    required: false,
    default: "",
  },
  iconColor: {
    type: String,
    required: false,
    default: "#000",
  },
  iconSize: {
    type: Number,
    required: false,
    default: 100,
  },
  isIconFilled: {
    type: Boolean,
    required: false,
    default: false,
  },
  strokeWeight: {
    type: Number,
    required: false,
    default: 100,
  },
  opticSize: {
    type: Number,
    required: false,
    default: 48,
  },
  grade: {
    type: Number,
    required: false,
    default: 0,
  }
}) as IconComponentProps;

const innerCurrentIcon: Ref<string> = ref(props.currentIcon || "");
const innerIconColor: Ref<string> = ref(props.iconColor || "#000");
const innerIconSize: Ref<number> = ref(props.iconSize || 100);
const innerIsIconFilled: Ref<boolean> = ref(props.isIconFilled || false);
const innerStrokeWeight: Ref<number> = ref(props.strokeWeight || 100);
const innerOpticSize: Ref<number> = ref(props.opticSize || 48);
const innerGrade: Ref<number> = ref(props.grade || 48);

const iconStyle = computed<string>(() => {
  return `
    font-variation-settings:
      'FILL' ${+innerIsIconFilled.value},
      'wght' ${innerStrokeWeight.value},
      'GRAD' ${innerGrade.value},
      'opsz' ${innerOpticSize.value};
  `
});

defineExpose({
  currentIcon: innerCurrentIcon,
  iconColor: innerIconColor,
  iconSize: innerIconSize,
  isIconFilled: innerIsIconFilled,
  strokeWeight: innerStrokeWeight,
  opticSize: innerOpticSize,
  grade: innerGrade,
  settings,
}) as unknown as IconSharingComponentProps;
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <div class="icon">
    <div :style="iconStyle">
      <span class="material-symbols-outlined">{{ innerCurrentIcon }}</span>
    </div>
  </div>
  <div>TEST COMPONENT</div>
</template>

<style scoped>
.icon {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: v-bind(`${innerIconSize}px`);
  color: v-bind(innerIconColor);
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}
</style>
