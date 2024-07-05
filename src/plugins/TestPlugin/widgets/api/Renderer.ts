import type {IMapProps} from "@/plugins/TestPlugin/widgets/api/MapPreview";
// @ts-ignore
import type {IIconSettings} from "@/components/Widgets/Icon/IconWidgetSettings.vue";

export interface IRenderer {
    thing?:{
        prop:string,
        value:string,
    },
    datastream?:{
        prop:string,
        value:string,
    },
    renderer:{
        point:IIconSettings
        area: IMapProps,
        label: any
    }
    id:string;
    datapoint: {

            setting:any,
            component:string,
            placement:ERefType
    }
}
interface ICompare{
    (loaction: Location): boolean;
}
export enum ERefType {
    Thing  = 'Thing',
    OberservedArea   = 'OberservedArea',
}
