import type {IMapProps} from "@/plugins/TestPlugin/widgets/api/MapPreview";
// @ts-ignore
import type {IIconSettings} from "@/components/Widgets/Icon/IconWidgetSettings.vue";

export interface IPointPin {
    color: string;
}

export interface IDSRenderer {
    datastream: {
        prop: string,
        value: string,
    },
    placement: ERefType,
    observation: {
        setting: any,
        component: string,
    },
    renderer: {
        point_render_as: string,
        point_prop?: string,
        point: IIconSettings;
        pointPin: IPointPin
        area: IMapProps,
        label: any
    },
    id: string;

}

export interface IRenderer {
    thing: {
        prop: string,
        value: string,
    },
    renderer: {
        show_SubElements: boolean,
        point_render_as: string,
        point_prop?: string,
        point: IIconSettings
        pointPin: IPointPin
        area: IMapProps,
        label: any
    }
    ds_renderer: IDSRenderer[],
    id: string;

}

interface ICompare {
    (loaction: Location): boolean;
}

export enum ERefType {
    Thing = 'Thing',
    OberservedArea = 'OberservedArea',
}
