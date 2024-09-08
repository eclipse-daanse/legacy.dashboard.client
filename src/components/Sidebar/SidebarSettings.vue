<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import StoreList from "@/components/Sidebar/StoreList.vue";
import SidebarControl from "@/components/Sidebar/SidebarControl.vue";
import SidebarWidget from "@/components/Sidebar/SidebarWidget.vue";
import SidebarAppSettings from "./SidebarAppSettings.vue";
import SidebarDataSourceList from './SidebarDataSourceList.vue';

const { t } = useI18n();
const props = defineProps(["modelValue", "settingsSection"]);

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <va-sidebar
    :modelValue="modelValue"
    animated="right"
    width="524px"
  >
    <div class="settings-sidebar">
      <div class="settings-sidebar-content">
        <template v-if="props.settingsSection?.type === 'Stores'">
          <StoreList></StoreList>
        </template>
        <template v-if="props.settingsSection?.type === 'Control'">
          <SidebarControl
            :component="props.settingsSection.component"
            :key="props.settingsSection.id"
          />
        </template>
        <template v-if="props.settingsSection?.type === 'Widget'">
          <SidebarWidget
            :component="props.settingsSection.component"
            :wrapper="props.settingsSection.wrapper"
            :key="props.settingsSection.id"
          />
        </template>
        <template v-if="props.settingsSection?.type === 'App'">
          <SidebarAppSettings />
        </template>
        <template v-if="props.settingsSection?.type === 'SourceList'">
          <SidebarDataSourceList />
        </template>
      </div>

      <div class="settings-sidebar-actions">
        <va-button
          class="sidebar-button-close mr-4"
          preset="primary"
          @click="$emit('update:modelValue', !modelValue)"
        >
          {{ t('SidebarSettings.closeButton') }}
        </va-button>
        <!-- <va-button
          class="sidebar-button-done ml-2"
          color="#4153b5"
        >
        {{ t('SidebarSettings.doneButton') }}
        </va-button> -->
      </div>
    </div>
  </va-sidebar>
</template>

<style lang="scss">
.settings-sidebar {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  color: var(--app-font-color);
  border-left: 1px solid var(--app-sidebar-border);
}

.settings-sidebar-content {
  flex-grow: 1;
  width: 100%;
  background-color: var(--app-sidebar-settings);
}

.settings-sidebar-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: auto;
  padding: 0 4px 32px 0;
  background-color: var(--app-sidebar-settings);
}
</style>
<style lang="scss" scoped>
.sidebar-button-done {
  height: 100%;
  border: 2px solid transparent;
  box-sizing: border-box;

  &:hover {
    color: #1a2d91 !important;
    --va-background-color: #b0befe !important;
    --va-background-color-opacity: 1 !important;
  }

  &:active {
    color: #1a2d91 !important;
    border: 2px solid #4153b5 !important;
    --va-background-color: #fafafa !important;
  }
}

.sidebar-button-close {
  height: 100%;
  border-radius: 72px;
  border: 2px solid transparent;
  color: var(--app-secondary-button-color) !important;
  box-sizing: border-box;

  --va-button-font-weight: 500;
  --va-button-padding: 4.25px 10px;
  --va-background-color-opacity: 0 !important;

  &:hover {
    --va-background-color: var(--app-secondary-button--hover) !important;
    --va-background-color-opacity: 0.5 !important;
  }

  &:active {
    border: 2px solid var(--app-secondary-button-border) !important;
  }
}
</style>
