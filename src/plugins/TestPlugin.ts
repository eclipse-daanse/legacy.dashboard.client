import Picon  from './TestPlugin/Icon/PiconWidget.vue';

import {enabledWidgets, widgetNames} from "@/components/Widgets";
import {cid, container, inject, injectable} from 'inversify-props';
import {type StoreManagerI, useStoreManager} from "@/composables/storeManager";
import {useDatasourceManager} from "@/composables/datasourceManager";
import STADataSource from "@/plugins/TestPlugin/dataSources/STADataSource";
import StaStore from "@/plugins/TestPlugin/stores/StaStore";



export default {

    install: (app) => {
        app.component(Picon);
        enabledWidgets['PiconWidget']= Picon;  //ToDo add register Method on widget registery
        widgetNames.push( { name: "PiconWidget", label: "p-icon"});

        const storemanger = container.get<StoreManagerI>(cid.UseStoreManager); // injection via inverserify
        //console.log(storemanger.register(...)) //register Store

        const storeMgr = useStoreManager();
        const dataSourceMgr = useDatasourceManager();

        dataSourceMgr.registerDataSource(STADataSource);
        storeMgr.registerStoreType(StaStore);

    }
};
