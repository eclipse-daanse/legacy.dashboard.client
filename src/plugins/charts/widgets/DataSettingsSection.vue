<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { ref, computed, unref, toRaw } from "vue";
import type { Store } from "@/stores/Widgets/Store";
import { useStoreManager } from "@/composables/storeManager";
import useComposerManager from "@/plugins/charts/composables/ComposerManager";
import type { IChartComponent } from "@/plugins/charts/Chart";
import { XMLAComposer } from "@/plugins/charts/impl/XMLAComposer";
import CSVComposerV from "@/plugins/charts/widgets/parts/CSVComposerV.vue";
import XMLAComposerV from "@/plugins/charts/widgets/parts/XMLAComposerV.vue";

const {component} = defineProps<{
  component: IChartComponent
}>();

const opened = ref(false);

const storeManager = useStoreManager();

const getStores = computed(() => {
    const storeList = storeManager.getStoreList();
    return Array.from(storeList.value.values());
});

const addComposer = (store: IStore) => {
    console.log("add ");
    const ComposerClass = useComposerManager().getComposerForStoreType(
        store.type,
    );
    const storeData = component.setStore(store as Store);
    if (ComposerClass) {
        const aComposer = new ComposerClass();
        aComposer.setStore(storeData.store);
        aComposer.setData(storeData.data);

        const val = [...toRaw(unref(component.settings.composer))];
        val.push(aComposer);
        component.setSetting("composer", val);
    }
};
</script>

<template>
    <va-collapse v-model="opened" header="Data" v-if="component">
          <div class="settings-container">
              <div class="settings-block">
                  <!--<DataSetPropertyList  v-model="component.settings.dataSets" @updatev-model="value => component.setSetting('dataSets',value)"></DataSetPropertyList>-->
                  <VaDropdown>
                      <template #anchor>
                          <VaButton> Add+ </VaButton>
                      </template>

                      <VaDropdownContent>
                          <VaList>
                              <template v-for="store in getStores">
                                  <VaListItem
                                      v-if="
                                          useComposerManager().isRegistered(
                                              store.type,
                                          )
                                      "
                                      @click="addComposer(store)"
                                  >
                                      {{ store.caption }}
                                  </VaListItem>
                              </template>
                          </VaList>
                      </VaDropdownContent>
                  </VaDropdown>
              </div>
              <div
                  class="composers"
                  v-for="(composer, i) in component.settings.composer"
              >
                  <template v-if="composer instanceof XMLAComposer">
                      <XMLAComposerV
                          :modelValue="component.settings.composer[i]"
                          :axes="component.settings.axes"
                          :component="component"
                      ></XMLAComposerV>
                  </template>
                  <template v-else>
                      <CSVComposerV
                          :modelValue="component.settings.composer[i]"
                          :axes="component.settings.axes"
                          :component="component"
                      ></CSVComposerV>
                  </template>
              </div>
          </div>
      </va-collapse>
</template>