<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { ref } from "vue";
import type { ITChartSettings } from "@/plugins/charts/Chart";

const props = defineProps<{
    settings: ITChartSettings;
    setSetting: (key: string, value: any) => void;
}>();

const opened = ref(false);

</script>
<template>
  <va-collapse v-model="opened" header="Grid">
        <div class="settings-container">
            <div class="settings-block mb-3">
                <va-switch
                    label="Display X Grid Lines:"
                    :model-value="props.settings.axes.x.grid.display"
                    @update:model-value="props.setSetting('axes.x.grid.display', $event)"
                />
            </div>
            <div class="settings-block mb-3">
                <va-color-input
                    class="axis-color"
                    label="Color x grid:"
                    :model-value="props.settings.axes.x.grid.color"
                    @update:model-value="props.setSetting('axes.x.grid.color', $event)"
                />
            </div>
            <div class="settings-block mb-3">
                <va-input
                    label="Thickness x grid:"
                    :model-value="props.settings.axes.x.grid.thickness"
                    @update:model-value="props.setSetting('axes.x.grid.thickness', $event)"
                />
            </div>
                <!-- <div class="settings-block mb-3">
                <va-input
                    label="Dash x grid:"
                    :model-value="component.settings.X_gridLines.dash.join(' ')"
                    @update:model-value="component.setSetting('X_gridLines.dash', $event.split(' ').map(v=> Number(v)))"
                />
                </div>
                <div class="settings-block mb-3">
                <va-input
                    label="Dash Offset x grid:"
                    :model-value="component.settings.X_gridLines.dashOffset"
                    @update:model-value="component.setSetting('X_gridLines.dashOffset', $event)"
                />
                </div> -->
            <div class="settings-block mb-3">
                <va-color-input
                    class="axis-color"
                    label="Color x tick marks:"
                    :model-value="props.settings.axes.x.grid.tickMarksColor"
                    @update:model-value="props.setSetting('axes.x.grid.tickMarksColor', $event)"
                />
            </div>
            <div class="settings-block mb-3">
                <va-color-input
                    class="axis-color"
                    label="Color x ticks:"
                    :model-value="props.settings.axes.x.ticks.color"
                    @update:model-value="props.setSetting('axes.x.ticks.color', $event)"
                />
            </div>
            <!-- <div class="settings-block mb-3">
                <va-input
                    label="Tick Template:"
                    :model-value="component.settings.axes.x.tickTemplate"
                    @update:model-value="component.setSetting('axes.x.tickTemplate', $event)"
                />
            </div> -->
            <div class="settings-block mb-3">
                <va-switch
                    label="Display Y Grid Lines:"
                    :model-value="props.settings.axes.y.grid.display"
                    @update:model-value="props.setSetting('axes.y.grid.display', $event)"
                />
            </div>
            <div class="settings-block mb-3">
                <va-color-input
                    class="axis-color"
                    label="Color y grid:"
                    :model-value="props.settings.axes.y.grid.color"
                    @update:model-value="props.setSetting('axes.y.grid.color', $event)"
                />
            </div>
            <div class="settings-block mb-3">
                <va-input
                    label="Thickness y grid:"
                    :model-value="props.settings.axes.y.grid.thickness"
                    @update:model-value="props.setSetting('axes.y.grid.thickness', $event)"
                />
            </div>
                <!-- <div class="settings-block mb-3">
                <va-input
                    label="Dash y grid:"
                    :model-value="component.settings.Y_gridLines.dash.join(' ')"
                    @update:model-value="component.setSetting('Y_gridLines.dash', $event.split(' ').map(v=> Number(v)))"
                />
                </div>
                <div class="settings-block mb-3">
                <va-input
                    label="Dash Offset y grid:"
                    :model-value="component.settings.Y_gridLines.dashOffset"
                    @update:model-value="component.setSetting('Y_gridLines.dashOffset', $event)"
                />
                </div> -->
            <div class="settings-block mb-3">
                <va-color-input
                    class="axis-color"
                    label="Color y tick marks:"
                    :model-value="props.settings.axes.y.grid.tickMarksColor"
                    @update:model-value="props.setSetting('axes.y.grid.tickMarksColor', $event)"
                />
            </div>
            <div class="settings-block mb-3">
                <va-color-input
                    class="axis-color"
                    label="Color y ticks:"
                    :model-value="props.settings.axes.y.ticks.color"
                    @update:model-value="props.setSetting('axes.y.ticks.color', $event)"
                />
            </div>
            <!-- <div class="settings-block mb-3">
                <va-input
                    label="Tick Template:"
                    :model-value="component.settings.axes.y.tickTemplate"
                    @update:model-value="component.setSetting('axes.y.tickTemplate', $event)"
                />
            </div> -->
        </div>
    </va-collapse>
</template>