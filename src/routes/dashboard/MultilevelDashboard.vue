<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<template>
    <NavBarDash></NavBarDash>
    <div class="app-container">
        <div
            class="app-layout-container bg grey padd"
            :class="{ editDisabled: !editEnabled }"
            :style="
                backgroundColor ? `--app-background: ${backgroundColor}` : ''
            "
        >
            <div class="layout-settings" v-if="!viewmode">
                <div class="buttons-list">
                    <va-button
                        preset="primary"
                        class="settings-button va-icon-settings"
                        :borderColor="editEnabled ? '#4153b5' : ''"
                        icon="edit"
                        @click="toggleEdit"
                    >
                        {{ t("MultilevelDashboardNavigation.edit") }}
                    </va-button>
                    <va-button
                        v-for="(button, index) in layoutSettingsButtons"
                        :key="index"
                        :preset="button.preset"
                        class="settings-button va-icon-settings"
                        :icon="button.icon"
                        @click="button.action"
                    >
                        {{ button.label }}
                    </va-button>
                </div>
                <div class="widgets-dropdown">
                    <va-dropdown
                        :offset="showSidebar ? [10, -227] : [10, 0]"
                        placement="bottom-start"
                        @close="isDropdownVisible = false"
                        @open="isDropdownVisible = true"
                    >
                        <template #anchor>
                            <va-button
                                class="widgets-dropdown-button"
                                icon="add"
                                v-model="isDropdownVisible"
                                :preset="
                                    isDropdownVisible || isMouseOver
                                        ? 'primary'
                                        : ''
                                "
                                :border-color="
                                    isDropdownVisible ? '#4153b5' : ''
                                "
                                :iconColor="
                                    isMouseOver || isActiveButton
                                        ? '#4153b5'
                                        : ''
                                "
                                :background-opacity="isDropdownVisible ? 0 : 1"
                                color="#4153b5"
                                @mousedown="mousedown"
                                @mouseup="mouseup"
                                @mouseover="mouseover"
                                @mouseleave="mouseleave"
                            >
                                {{
                                    t(
                                        "MultilevelDashboardNavigation.addWidgetButton",
                                    )
                                }}
                            </va-button>
                        </template>
                        <va-dropdown-content
                            class="dropdown-list"
                            style="
                                background-color: var(
                                    --app-dropdown-background
                                );
                                color: var(--app-font-color);
                            "
                        >
                            <div
                                class="dropdown-item"
                                v-for="widget of widgetOptions"
                                :key="widget"
                                @click="addSelectedWidget(widget)"
                            >
                                <div>
                                    {{ t(`Widgets.${widget}`) }}
                                </div>
                            </div>
                        </va-dropdown-content>
                    </va-dropdown>
                </div>
            </div>
            <div class="main-section">
                <template v-for="widget in widgets" :key="widget.id">
                    <div
                        :class="`${widget.id} dashboard-item-container`"
                        :style="getInitialStyle(widget.id)"
                        :ref="widget.id"
                    >
                        <va-dropdown
                            :trigger="editEnabled ? 'right-click' : 'none'"
                            :auto-placement="false"
                            placement="right-start"
                            cursor
                        >
                            <template #anchor>
                                <div class="dashboard-item">
                                    <Suspense>
                                        <template #fallback>
                                            <div>Loading...</div>
                                        </template>
                                        <WidgetWrapper
                                            :ref="`${widget.id}_wrapper`"
                                        >
                                            <component
                                                :is="
                                                    enabledWidgets[
                                                        widget.component
                                                    ]
                                                "
                                                :ref="`${widget.id}_component`"
                                                :initialState="widget.state"
                                            ></component>
                                        </WidgetWrapper>
                                    </Suspense>
                                    <DashboardControls
                                        v-if="editEnabled"
                                        @openSettings="
                                            openSettings(
                                                `${widget.id}_component`,
                                                `${widget.id}_wrapper`,
                                                'Widget',
                                            )
                                        "
                                        @deleteElement="deleteWidget(widget.id)"
                                    />
                                </div>
                            </template>

                            <va-dropdown-content>
                                <div class="dropdown-buttons-container">
                                    <va-button @click="moveUp(widget.id)">
                                        {{ t("LayoutMovingButtons.moveUp") }}
                                    </va-button>
                                    <va-button @click="moveDown(widget.id)">
                                        {{ t("LayoutMovingButtons.moveDown") }}
                                    </va-button>
                                    <va-button @click="moveToTop(widget.id)">
                                        {{ t("LayoutMovingButtons.moveToTop") }}
                                    </va-button>
                                    <va-button @click="moveToBottom(widget.id)">
                                        {{
                                            t(
                                                "LayoutMovingButtons.moveToBottom",
                                            )
                                        }}
                                    </va-button>
                                </div>
                            </va-dropdown-content>
                        </va-dropdown>
                    </div>
                    <Moveable
                        v-bind:target="[`.${widget.id}`]"
                        v-bind:draggable="editEnabled"
                        v-bind:resizable="editEnabled"
                        v-bind:useResizeObserver="true"
                        v-bind:useMutationObserver="true"
                        @drag="drag(widget.id, $event)"
                        @resize="resize(widget.id, $event)"
                        :snappable="true"
                        :snapGridWidth="20"
                        :snapGridHeight="20"
                        :ref="`${widget.id}_control`"
                        :style="getMovableControlStyles(widget.id)"
                    >
                    </Moveable>
                </template>
            </div>
        </div>
        <SidebarSettings
            v-model="showSidebar"
            :settingsSection="settingsSection"
            class="sidebar"
        ></SidebarSettings>
        <ErrorHandlingModal ref="errorHandlingModal" />
        <SaveModal ref="loadsaveModal" />
        <LoadModal ref="loadModalref" />
    </div>
</template>

<script setup lang="ts">
import NavBarDash from "./NavBarDash.vue";
import DashboardControls from "@/components/Dashboard/DashboardControls.vue";
import {
    getCurrentInstance,
    markRaw,
    ref,
    type Ref,
    provide,
    inject, watch, onMounted,
} from "vue";
import { useStoreManager } from "@/composables/storeManager";
import Moveable from "vue3-moveable";
import SidebarSettings from "@/components/Sidebar/SidebarSettings.vue";
import { useDatasourceManager } from "@/composables/datasourceManager";
import { useMoveableLayout } from "@/composables/dashboard/moveableLayout";
import { useSerialization } from "@/composables/dashboard/serialization";
import { useErrorHandler } from "@/composables/dashboard/errorToast";
import { useWidgets } from "@/composables/dashboard/widgets";
import WidgetWrapper from "@/components/Widgets/WidgetWrapper/WidgetWrapper.vue";
import { useI18n } from "vue-i18n";
import ErrorHandlingModal from "@/components/Modals/ErrorHandlingModal.vue";
import SaveModal from "@/components/Modals/SaveModal.vue";
import loadModal from "@/components/Modals/LoadModal.vue";
import LoadModal from "@/components/Modals/LoadModal.vue";
import {useRoute} from "vue-router";

const { t } = useI18n();

const dsManager = useDatasourceManager();
const storeManager = useStoreManager();
const { setOnClick } = useErrorHandler();
const errorHandlingModal = ref(null) as Ref<any>;
const loadsaveModal = ref(null) as Ref<any>;
const loadModalref = ref(null) as Ref<any>;

const editEnabled = ref(false);
let viewmodeByDefault = false;
if(window && window['__env'] && window['__env'].settings && window['__env'].settings.viewmodeByDefault){
    viewmodeByDefault = window['__env'].settings.viewmodeByDefault;
}
const viewmode = ref(viewmodeByDefault);
const showSidebar = ref(false);
const settingsSection = ref(null as any);

const backgroundColor = ref("");
const isDropdownVisible = ref(false);
const isActiveButton = ref(false);
const isMouseOver = ref(false);
const layoutSettingsButtons = ref<
    Array<{ label: string; preset: string; action: () => void; icon: string }>
>([]);

provide("backgroundColor", backgroundColor);
const EventBus = inject("customEventBus") as any;

const instance = getCurrentInstance();

const openErrorModal = (data) => {
    errorHandlingModal.value?.run(data);
};

const openLaodSaveModal = (data) => {
     loadsaveModal.value?.run(data);
};
const openLaodModal = async () => {
    return await loadModalref.value?.run();
};

setOnClick(openErrorModal);

const mousedown = () => {
    isActiveButton.value = true;
    document.addEventListener("mouseup", mouseup);
};

const mouseup = () => {
    isActiveButton.value = false;
    document.removeEventListener("mouseup", mouseup);
};

const mouseover = () => {
    isMouseOver.value = true;
};

const mouseleave = () => {
    isMouseOver.value = false;
};

const addSelectedWidget = (selectedWidget) => {
    if (selectedWidget === "") return;

    const widget = widgetNames.filter((e) => e.name === selectedWidget)[0];
    console.log(widget);

    const id: string = `id_${Date.now()}`;

    layout.value[id] = {
        x: 0,
        y: 700,
        width: 300,
        height: 150,
        z: 3005,
    };

    addWidget(widget.name, id);
};

const {
    widgets,
    widgetsStorage,
    addWidget,
    removeWidget,
    widgetNames,
    enabledWidgets,
} = useWidgets();

const widgetOptions = widgetNames.map((widget) => widget.name);

const {
    layout,
    layoutStorage,
    getInitialStyle,
    getMovableControlStyles,
    drag,
    resize,
    moveUp,
    moveDown,
    moveToBottom,
    moveToTop,
} = useMoveableLayout();

const { getSerializedState, loadState } = useSerialization(
    {
        layout: layoutStorage,
        stores: storeManager,
        datasources: dsManager,
        widgets: widgetsStorage,
    },
    EventBus,
);

const toggleEdit = () => {
    editEnabled.value = !editEnabled.value;
};

const saveLayout = () => {
    const state = getSerializedState();
    openLaodSaveModal(state);
    //
    //localStorage.setItem("testLayout", JSON.stringify(state));

    //console.log(state);
};

const loadLayout = async () => {
    const retrievedObject = await openLaodModal();
    if(retrievedObject){
        loadState(retrievedObject);
    }

};

const openStoreList = () => {
    settingsSection.value = { type: "Stores" };
    showSidebar.value = true;
};

const openAppSettings = () => {
    settingsSection.value = { type: "App" };
    showSidebar.value = true;
};

layoutSettingsButtons.value.push(
    {
        label: t("MultilevelDashboardNavigation.save"),
        preset: "primary",
        action: saveLayout,
        icon: "save",
    },
    {
        label: t("MultilevelDashboardNavigation.loadLayout"),
        preset: "primary",
        action: loadLayout,
        icon: "upload",
    },
    {
        label: t("MultilevelDashboardNavigation.storeList"),
        preset: "primary",
        action: openStoreList,
        icon: "list",
    },
    {
        label: t("MultilevelDashboardNavigation.appSettings"),
        preset: "primary",
        action: openAppSettings,
        icon: "settings",
    },
);

const openSettings = (id, wrapperId, type = "Control") => {
    const refs = instance?.refs;

    if (!refs) return;

    const ref = refs[id] as any[];

    let wrapperRef = null as any;
    if (wrapperId) {
        wrapperRef = refs[wrapperId] as any[];
    }

    settingsSection.value = markRaw({
        type,
        component: ref[0],
        wrapper: wrapperRef?.[0],
        id,
    });
    showSidebar.value = true;
};

const deleteWidget = (id) => {
    if (
        settingsSection?.value &&
        `${id}_component` === settingsSection.value.id
    ) {
        settingsSection.value = null;
        showSidebar.value = false;
    }

    delete layout.value[id];
    removeWidget(id);
};

const loadFromUrl = (url)=>{
    fetch(url as string)
        .then((response) => response.json())
        .then(result=>{

            const keys = Object.keys(result);
            if(keys.includes('layout') &&  keys.includes('stores')  && keys.includes('datasources')  && keys.includes('widgets')){
                if(result){
                    loadState(JSON.stringify(result));
                }
            }
            else {
                throw new Error('Format not suported')
            }

        }).catch((e)=>{
        console.log(e);
        openErrorModal({message:'Could not load Configuration from Endpoint!',name:'Config Error'});
    });
}
const route = useRoute()
watch(()=>route.query,(val)=>{
    if(val && val.uri){
        loadFromUrl(val.url);
    }
    if(Object.keys(val).includes('viewmode')){
            viewmode.value=true;
    }
    if(Object.keys(val).includes('noviewmode')){
        viewmode.value=false;
    }
},{immediate:true})


onMounted(()=>{
    let viewmodeByDefault = false;
    if(window && window['__env'] && window['__env'].settings && window['__env'].settings.initWithConfigurationURI && window['__env'].settings.initWithConfigurationURI.enabled
        && window['__env'].settings.initWithConfigurationURI.url){
        loadFromUrl(window['__env'].settings.initWithConfigurationURI.url)
    }
})
</script>

<style lang="scss">
.vue-grid-item {
    transition: all 0.2s ease;
    transition-property: left, top, right;
}

.vue-grid-item.no-touch {
    -ms-touch-action: none;
    touch-action: none;
}

.vue-grid-item.cssTransforms {
    transition-property: transform;
    left: 0;
    right: auto;
}

.vue-grid-item.cssTransforms.render-rtl {
    left: auto;
    right: 0;
}

.vue-grid-item.resizing {
    opacity: 0.6;
    z-index: 3;
}

.vue-grid-item.vue-draggable-dragging {
    transition: none;
    z-index: 3;
}

.vue-grid-item.vue-grid-placeholder {
    background: red;
    opacity: 0.2;
    transition-duration: 0.1s;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
}

.vue-grid-item > .vue-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=);
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
}

.vue-grid-item > .vue-rtl-resizable-handle {
    bottom: 0;
    left: 0;
    background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAuMDAwMDAwMDAwMDAwMDAyIiBoZWlnaHQ9IjEwLjAwMDAwMDAwMDAwMDAwMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KIDwhLS0gQ3JlYXRlZCB3aXRoIE1ldGhvZCBEcmF3IC0gaHR0cDovL2dpdGh1Yi5jb20vZHVvcGl4ZWwvTWV0aG9kLURyYXcvIC0tPgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSIxMiIgd2lkdGg9IjEyIiB5PSItMSIgeD0iLTEiLz4KICA8ZyBkaXNwbGF5PSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgeT0iMCIgeD0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgaWQ9ImNhbnZhc0dyaWQiPgogICA8cmVjdCBmaWxsPSJ1cmwoI2dyaWRwYXR0ZXJuKSIgc3Ryb2tlLXdpZHRoPSIwIiB5PSIwIiB4PSIwIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIi8+CiAgPC9nPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxsaW5lIGNhbnZhcz0iI2ZmZmZmZiIgY2FudmFzLW9wYWNpdHk9IjEiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzEiIHkyPSItNzAuMTc4NDA3IiB4Mj0iMTI0LjQ2NDE3NSIgeTE9Ii0zOC4zOTI3MzciIHgxPSIxNDQuODIxMjg5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z181IiB5Mj0iOS4xMDY5NTciIHgyPSIwLjk0NzI0NyIgeTE9Ii0wLjAxODEyOCIgeDE9IjAuOTQ3MjQ3IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z183IiB5Mj0iOSIgeDI9IjEwLjA3MzUyOSIgeTE9IjkiIHgxPSItMC42NTU2NCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9IiM2NjY2NjYiIGZpbGw9Im5vbmUiLz4KIDwvZz4KPC9zdmc+);
    background-position: bottom left;
    padding-left: 3px;
    background-repeat: no-repeat;
    background-origin: content-box;
    cursor: sw-resize;
    right: auto;
}

.vue-grid-item.disable-userselect {
    user-select: none;
}

.vue-grid-layout {
    position: relative;
    transition: height 0.2s ease;
}

.vue-grid-layout {
    background: transparent;
}

.vue-grid-layout .smartwidget {
    height: inherit;
    width: inherit;
}

.vue-grid-layout .smartwidget.smartwidget-fullscreen {
    height: 100%;
    width: 100%;
}

.smart-widget__loading-mask {
    position: absolute;
    z-index: 2000;
    background-color: #ffffffe6;
    margin: 0;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    -webkit-transition: opacity 0.3s;
    transition: opacity 0.3s;
}

.smart-widget__loading-mask .loading-spinner {
    top: 50%;
    margin-top: -21px;
    width: 100%;
    text-align: center;
    position: absolute;
}

.smart-widget__loading-mask .circular {
    width: 42px;
    height: 42px;
    animation: loading-rotate 2s linear infinite;
}

.smart-widget__loading-mask .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-width: 2;
    stroke: #5282e4;
    stroke-linecap: round;
}

@keyframes loading-rotate {
    to {
        transform: rotate(360deg);
    }
}

@keyframes loading-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }

    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -40px;
    }

    to {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -120px;
    }
}

.collapse-transition[data-v-5f8fde58] {
    transition:
        0.3s height ease-in-out,
        0.3s padding-top ease-in-out,
        0.3s padding-bottom ease-in-out;
}

.vue-grid-item {
    touch-action: none;
    box-sizing: border-box;
}

.vue-grid-item.vue-grid-placeholder {
    background: #7cbeff;
    opacity: 0.2;
    transition-duration: 0.1s;
    z-index: 2;
    user-select: none;
}

body.no-overflow[data-v-059e0ffc] {
    overflow: hidden;
    position: fixed;
    width: 100%;
}

.smartwidget[data-v-059e0ffc] {
    box-sizing: border-box;
    background: #fff;
    box-shadow: 0 1px 2px #0000000d;
    border: 1px solid #ebeef5;
    width: 100%;
    transition: 0.3s;
}

.smartwidget.is-always-shadow[data-v-059e0ffc] {
    box-shadow: 0 0 10px #e9e9e9;
}

.smartwidget.is-hover-shadow[data-v-059e0ffc]:hover {
    box-shadow: 0 0 10px #e9e9e9;
}

.smartwidget.is-never-shadow[data-v-059e0ffc] {
    box-shadow: 0 1px 2px #0000000d;
}

.smartwidget .widget-header[data-v-059e0ffc] {
    display: flex;
    border-bottom: 1px solid #ebeef5;
}

.smartwidget .widget-header .widget-header__title[data-v-059e0ffc] {
    display: inline-block;
    position: relative;
    width: auto;
    margin: 0;
    font-weight: normal;
    letter-spacing: 0;
    align-items: center;
    font-size: 16px;
}

.smartwidget .widget-header .widget-header__subtitle[data-v-059e0ffc] {
    font-size: 12px;
    color: #777;
    margin-left: 10px;
}

.smartwidget .widget-header .ellis[data-v-059e0ffc] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.smartwidget .widget-header .widget-header__prefix[data-v-059e0ffc] {
    background: #0076db;
    width: 2px;
    height: 16px;
    margin-left: 10px;
}

.smartwidget .widget-header .widget-header__toolbar[data-v-059e0ffc] {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
    padding: 0;
    margin: 0;
}

.smartwidget .widget-header .widget-header__toolbar a[data-v-059e0ffc] {
    display: inline-block;
    text-decoration: none;
    text-align: center;
    height: 24px;
    line-height: 28px;
    padding: 0;
    margin: 0;
    color: #333;
    min-width: 35px;
    position: relative;
    font-family: Arial, Helvetica, sans-serif;
    border-left: 1px solid rgba(0, 0, 0, 0.09);
}

.smartwidget .widget-body-simple[data-v-059e0ffc] {
    display: flex;
    height: inherit;
    width: inherit;
}

.smartwidget .widget-body-simple .widget-body__content {
    width: 100%;
    height: 100%;
}

.smartwidget .widget-body[data-v-059e0ffc] {
    display: flex;
    flex-direction: column;
    will-change: height;
    position: relative;
    overflow: hidden;
}

.smartwidget .widget-body .widget-body__content {
    flex: 1;
}

.smartwidget .widget-body .widget-body__content.fixed-height[data-v-059e0ffc] {
    overflow-y: scroll;
}

.smartwidget .widget-body .widget-body__footer[data-v-059e0ffc] {
    position: relative;
}

.smartwidget .widget-body .widget-body__footer.has-group[data-v-059e0ffc] {
    left: 0;
    bottom: 0;
    width: 100%;
}

.smartwidget .widget-body.is-collapse[data-v-059e0ffc] {
    transition:
        0.3s height ease-in-out,
        0.3s padding-top ease-in-out,
        0.3s padding-bottom ease-in-out;
}

.smartwidget.smartwidget-fullscreen[data-v-059e0ffc] {
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 6666;
}

.smartwidget.smartwidget-fullscreen .widget-header[data-v-059e0ffc] {
    cursor: default;
}

.smartwidget svg.sw-loading[data-v-059e0ffc] {
    animation: rotating 2s linear infinite;
    cursor: not-allowed;
}

.moveable-control.moveable-origin {
    display: none;
}

.va-dropdown__content {
    z-index: 10000000 !important;
}

.app-layout-container.editDisabled .moveable-line {
    display: none;
}

.va-dropdown__content.va-select-dropdown__content.va-dropdown__content-wrapper {
    z-index: 20000000 !important;
}
</style>
<style scoped lang="scss">
.padd {
    padding: 15px;
    background-color: var(--app-background);
}

.app-layout-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding-left: 65px;
    gap: 1rem;
}

.layout-settings {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    height: 40px;
    margin-left: 22px;
}

.widgets-dropdown {
    margin-right: 9px;
}

.dropdown-list {
    display: flex;
    flex-direction: column;
    height: 308px;
    padding: 0;
    -webkit-box-shadow: var(--app-dropdown-box-shadow);
    -moz-box-shadow: var(--app-dropdown-box-shadow);
    box-shadow: var(--app-dropdown-box-shadow);
}

.dropdown-item {
    width: 100%;
    height: 100%;
    min-width: 284px;
    font-size: 16px;
    font-weight: 500;
    line-height: 19.5px;
    padding: 12.25px 0 12.25px 16px;
    cursor: pointer;
    box-sizing: border-box;
}

.dropdown-item:hover {
    transition: background-color 0.5s ease;
    background-color: var(--app-dropdown-background--hover);
    color: var(--app-font-color);
}

.widgets-dropdown-button {
    height: 100%;
    font-size: 16px;
    font-weight: 500;
    line-height: 19.5px;
    border: 2px solid transparent;
    border-radius: 8px;
    box-sizing: border-box;

    &:hover {
        color: var(--app-dropdown-button-color--hover) !important;

        --va-background-color: var(
            --app-dropdown-button-background-color--hover
        ) !important;
        --va-background-color-opacity: 1 !important;
        --va-background-mask-opacity: 0 !important;
    }

    &:active {
        box-sizing: border-box;
        border: 2px solid var(--app-secondary-button-border) !important;
        border-radius: 8px;
        color: var(--app-dropdown-button-color--active) !important;

        --va-background-color: var(
            --app-dropdown-button-background-color--active
        ) !important;
        --va-background-color-opacity: 1 !important;
        --va-background-mask-opacity: 0 !important;
    }
}

.buttons-list {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.settings-button {
    height: 100%;
    font-size: 12px;
    font-weight: 600;
    line-height: 14.5px;
    margin-left: 12px;
    border-radius: 72px;
    border: 2px solid transparent;
    color: var(--app-secondary-button-color) !important;
    box-sizing: border-box;

    --va-button-font-weight: 590;
    --va-background-color-opacity: 0 !important;
    --va-button-padding: 3px 10px;

    &:hover {
        --va-background-color: var(--app-secondary-button--hover) !important;
        --va-background-color-opacity: 0.5 !important;
    }

    &:active {
        border: 2px solid var(--app-secondary-button-border) !important;
    }

    :deep(.va-button__content) {
        font-weight: 600;
    }
}

.main-section {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    gap: 1rem;
    overflow: auto;
    background: v-bind(backgroundColor);
    border-radius: 8px;
}

.dashboard-container {
    flex-grow: 1;
    width: 100%;
    min-height: 100%;
    position: relative;
}

.dashboard-item {
    position: absolute;
    width: 100%;
    height: 100%;
}

.dashboard-item-container {
    position: absolute;
}

.dropdown-buttons-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.widget-content {
    position: absolute;
    width: 100%;
    height: 100%;
}

.target {
    width: 100%;
    height: 100%;
}

.layout-center {
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    align-items: center;
    height: 100%;

    h1 {
        font-size: 45px;
        font-weight: 300;
    }
}

.app-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    overflow: hidden;
}

.sidebar {
    z-index: 1000000;
    border-left: 1px solid #b1b1b1;
}
</style>
