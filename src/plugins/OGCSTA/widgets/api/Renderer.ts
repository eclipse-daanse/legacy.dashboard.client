import type {IMapProps} from "@/plugins/OGCSTA/widgets/api/MapPreview";
// @ts-ignore
import type {IIconSettings} from "@/components/Widgets/Icon/IconWidgetSettings.vue";

export interface IPointPin {
    color: string;
}

export interface IDSRenderer {
    name:string,
    datastream: ICondition[],
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
export interface ICondition {

        prop: string,
        comperator: Comperator
        value: string,

}


export interface IRenderer {
    name:string,
    thing: ICondition[],
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
export enum Comperator {
    equals = 'eq',
    lessThen = 'lt',
    greaterThen = 'gt',
    lessThenEquals = 'lte',
    greaterThenEquals = 'gte',
    notEQuals = "neq"
}
