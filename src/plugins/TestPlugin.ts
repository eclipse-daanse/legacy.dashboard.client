import ThingWidget  from './TestPlugin/widgets/ThingWidget.vue';

import {enabledWidgets, widgetNames} from "@/components/Widgets";
import {type StoreManagerI, useStoreManager} from "@/composables/storeManager";
import {useDatasourceManager} from "@/composables/datasourceManager";
import {useDataPointRegistry} from "@/plugins/TestPlugin/composables/datapointRegistry";
import STADataSource from "@/plugins/TestPlugin/dataSources/STADataSource";
import StaStore from "@/plugins/TestPlugin/stores/StaStore";
import TLCDataLabelRendererDescription
    from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/TLCDataLabelRendererDescription";
import ValueUnitDataLabelRendererDescription
    from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRendererDescription";
import OGCSTAStoreItem from "@/components/Stores/ListItems/OGCSTAStoreItem.vue";



export default {

    install: (app) => {
        app.component(OGCSTAStoreItem);
        app.component(ThingWidget);
        enabledWidgets['ThingWidget']= ThingWidget;  //ToDo add register Method on widget registery
        widgetNames.push( { name: "ThingWidget", label: "ThingWidget"});

        //const storemanger = container.get<StoreManagerI>(cid.UseStoreManager); // injection via inverserify
        //console.log(storemanger.register(...)) //register Store

        const storeMgr = useStoreManager();
        const dataSourceMgr = useDatasourceManager();

        dataSourceMgr.registerDataSource(STADataSource);
        storeMgr.registerStoreType(StaStore);
        useDataPointRegistry().registerDataPointRenderer(new TLCDataLabelRendererDescription())
        useDataPointRegistry().registerDataPointRenderer(new ValueUnitDataLabelRendererDescription())

    }
};
