import type {IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import type {IOGCSTA} from "@/plugins/TestPlugin/dataSources/STADataSource";
import type {Datastream, Thing} from "@/plugins/TestPlugin/dataSources/STAClient";
import {isArray} from "lodash";

export function useUtils() {

    const isPoint = (point: any) => {
        if (point.type !== 'Point') return false;
        if (!point.coordinates || !isArray(point.coordinates) || point.coordinates.length != 2) return false;
        //if (!point.location) return false;
        //if (!point.location.latitude) return false;
        //if (!point.location.longitude) return false;

        return true;
    }

    const isFeatureCollection = (point: any) => {
        if (!point) return false;
        if (!point.type) return false;
        if (point.type !== 'FeatureCollection') return false;
        return true;
    }

    return {
        isFeatureCollection,
        isPoint
    }
}
