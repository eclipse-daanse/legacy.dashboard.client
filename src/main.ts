/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors:

*/
import { createApp } from "vue";
import { createPinia } from "pinia";
import SOAPClient from "./plugins/SOAPClient";
import EventBus from "./plugins/EventBus";
import { createI18n } from "vue-i18n";
import { languages, defaultLocale } from "./i18n";

import App from "./App.vue";
// import router from './router'

import "./assets/main.css";
import {
    createVuesticEssential,
    createIconsConfig,
    VaButton,
    VaButtonToggle,
    VaSplit,
    VaImage,
    VaModal,
    VaCardTitle,
    VaCardContent,
    VaCardActions,
    VaInput,
    VaNavbar,
    VaNavbarItem,
    VaOptionList,
    VaSelect,
    VaTreeView,
    VaProgressCircle,
    VaChip,
    VaIcon,
    VaCheckbox,
    VaDropdown,
    VaDropdownContent,
    VaButtonGroup,
    VaDivider,
    VaButtonDropdown,
    VaDataTable,
    VaToast,
    VaSidebar,
    VaList,
    VaListLabel,
    VaListItem,
    VaListItemSection,
    VaSidebarItem,
    VaSidebarItemContent,
    VaSidebarItemTitle,
    VaScrollContainer,
    VaListItemLabel,
    VaRadio,
    VaCollapse,
    VaColorInput,
    VaTextarea,
    VaSlider,
    VaPagination,
    VaCounter,
    VaSwitch,
    VaDateInput,
    VaTimeInput,
    VaTabs,
    VaTab,
    VaFileUpload,
} from "vuestic-ui";
import "vuestic-ui/css";

import "./scss/main.scss";
import { router } from "@/router/router";
import { ref } from "vue";

import VueSmartWidget from "vue-smart-widget";
import {useDatasourceManager} from "@/composables/datasourceManager";
import XMLADatasource from "@/dataSources/XmlaDatasource";
import RESTDatasource from "@/dataSources/RestDatasource";
import MQTTDatasource from "@/dataSources/MqttDatasource";
import {useStoreManager} from "@/composables/storeManager";
import {XMLAStore} from "@/stores/Widgets/XMLAStore";
import {Store} from "@/stores/Widgets/Store";
import Chart from "@/plugins/charts/Chart";
import CSVStore from "@/plugins/charts/stores/CSVStore";
import OGCSTAComposerPlugin from "@/plugins/OGCSTAComposer/OGCSTAComposerPlugin";

//@ts-ignore
const app = createApp(App);

const pinia = createPinia();

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem("language") || defaultLocale,
    fallbackLocale: "en",
    messages: Object.assign({}, languages),
});

app.use(i18n);

const isDarkTheme = ref(
    JSON.parse(localStorage?.getItem("isDarkTheme")??'false'),
);
const htmlElement = document.documentElement;
htmlElement.classList.add(isDarkTheme.value ? "dark-theme" : "light-theme");

//@ts-ignore
pinia.use(SOAPClient);
app.use(pinia);
app.use(router);
app.use(VueSmartWidget);


app.use(EventBus);
const fonts = [
    {
        name: "mdi-{icon}",
        resolve: ({ icon }) => ({
            class: "material-icons-outlined",
            content: icon,
            tag: "span",
        }),
    },
];

// @ts-ignore
app.use(
    createVuesticEssential({
        components: {
            VaButton,
            VaButtonToggle,
            VaSplit,
            VaImage,
            VaModal,
            VaCardTitle,
            VaCardContent,
            VaCardActions,
            VaInput,
            VaNavbar,
            VaNavbarItem,
            VaOptionList,
            VaSelect,
            VaTreeView,
            VaProgressCircle,
            VaChip,
            VaIcon,
            VaCheckbox,
            VaDropdown,
            VaDropdownContent,
            VaButtonGroup,
            VaDivider,
            VaDataTable,
            VaToast,
            VaButtonDropdown,
            VaSidebar,
            VaSidebarItem,
            VaSidebarItemContent,
            VaSidebarItemTitle,
            VaScrollContainer,
            VaList,
            VaListLabel,
            VaListItem,
            VaListItemSection,
            VaListItemLabel,
            VaRadio,
            VaCollapse,
            VaColorInput,
            VaTextarea,
            VaSlider,
            VaPagination,
            VaCounter,
            VaSwitch,
            VaDateInput,
            VaTimeInput,
            VaTabs,
            VaTab,
            VaFileUpload
        },
        config: {
            colors: {
                variables: {
                    primary: "#133370",
                },
            },
            icons: createIconsConfig({ fonts }),
        },
    }),
);
useDatasourceManager().registerDataSource(XMLADatasource);
useDatasourceManager().registerDataSource(RESTDatasource);
useDatasourceManager().registerDataSource(MQTTDatasource);


useStoreManager().registerStoreType(XMLAStore);
useStoreManager().registerStoreType(Store);



app.use(Chart);
app.use(OGCSTAComposerPlugin);
app.mount("#app");
export default app;
