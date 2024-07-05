<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { ref, type Ref, onMounted } from "vue";
import { useStoreManager } from "@/composables/storeManager";
import type { Store } from "@/stores/Widgets/Store";

import type { XMLAStore } from "@/stores/Widgets/XMLAStore";
import RenderPropertyList, {type IRenderer} from "@/plugins/TestPlugin/widgets/parts/RenderPropertyList.vue";

interface IThingWidgetSettings {
  baseMapUrl: string;
  renderer:IRenderer[];
}

interface ITextComponent {
  store: Store | XMLAStore;
  settings: IThingWidgetSettings;
  setSetting: (key: string, value: any) => void;
  setStore: (store: Store | XMLAStore) => void;
}

const { component } = defineProps<{ component: ITextComponent }>();

const opened = ref({
  mapSection: false,
  storeSection: false,
  RenderSection:false,
});

// TODO: Move to store selection component
const storeManager = useStoreManager();
let stores = ref([]) as Ref<Store[]>;
const requestResult = ref("");

const getStores = () => {
  const storeList = storeManager.getStoreList();

  stores.value = Array.from(storeList.value, function (entry) {
    return { ...entry[1] };
  });
};

const getData = async () => {
  const store = component.store as Store;
  const data = await store.getData();
  requestResult.value = JSON.stringify(data, null, 2);
};

const updateStore = (storeId) => {
  const store = storeManager.getStore(storeId) as Store;
  component.setStore(store);
  getData();
};

onMounted(() => {
  getStores();
  if (component.store) {
    getData();
  }
});
</script>

<template>
  <va-collapse v-model="opened.mapSection" header="Map Settings">
    <div class="settings-container">

      <div class="settings-block">
        <va-color-input
            class="text-color"
            label="Font Color"
            :model-value="component.settings.baseMapUrl"
            @update:model-value="component.setSetting('baseMapUrl', $event)"
        />


      </div>
    </div>
  </va-collapse>
  <va-collapse v-model="opened.RenderSection" header="Render Settings">
    <div class="settings-container">

      <div class="settings-block">

        <RenderPropertyList  :model-value="component.settings.renderer" @update:model-value="value => component.setSetting('renderer',value)"></RenderPropertyList>

      </div>

    </div>
  </va-collapse>
  <va-collapse v-model="opened.storeSection" header="Store settings">
    <div class="settings-container">
      <div>
        <h3 class="mb-2">Select store</h3>
        <div class="mb-2" v-for="store in stores" :key="store.id">
          <va-radio
              :model-value="component.store?.id"
              @update:model-value="updateStore"
              :option="{
              text: `${store.caption} ${store.id}`,
              id: store.id,
            }"
              value-by="id"
              name="store-radio-group"
          />
        </div>
        <pre class="response">{{ requestResult }}</pre>
      </div>
    </div>
  </va-collapse>
</template>
<style lang="scss" scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
}

.settings-block {
  display: flex;
  flex-direction: column;
}

.text-title {
  width: 100%;
}

.text-size {
  width: 63px;
  margin-left: 12px;
}

.text-color {
  width: 156px;
}

.text-weight {
  width: 100px;
}

.align-buttons-group {
  display: flex;
  align-items: flex-end;

  .button-group {
    padding: 2px;
  }

  .align-button {

    &:hover  {
      --va-background-color: rgb(162, 181, 218) !important;
    }

    &:nth-child(4) {
      // padding-left: 10px;
    }
  }
}
</style>
