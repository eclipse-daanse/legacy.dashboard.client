import type {IRenderer} from "@/plugins/OGCSTA/widgets/api/Renderer";
import type {IOGCSTA} from "@/plugins/OGCSTA/dataSources/STADataSource";
import type {Datastream, Thing} from "@/plugins/OGCSTA/dataSources/STAClient";
import {isArray} from "lodash";

export function useUtils() {

    const isPoint = (point: any) => {
        if (!point) return false;
        if (!point.type) return false;
        if (point.type !== 'Point') return false;
        if (!point.coordinates || !isArray(point.coordinates) || point.coordinates.length != 2) return false;
        //if (!point.location) return false;
        //if (!point.location.latitude) return false;
        //if (!point.location.longitude) return false;

        return true;
    }
    const isFeature = (point: any) => {
        if (!point) return false;
        if (!point.type) return false;
        if (point.type !== 'Feature') return false;

        return true;
    };

    const isFeatureCollection = (point: any) => {
        if (!point) return false;
        if (!point.type) return false;
        if (point.type !== 'FeatureCollection') return false;

        return true;
    }

    const transformToGeoJson=(geom:any)=>{
        if(!geom)return null;
        if(geom.type == 'Feature' || geom.type == 'FeatureCollection') return geom;
        if(['Polygon','MultiPolygon','Line','MultiLine','Point','MultiPoint'].includes(geom.type) ){
            const res = {"type": "Feature",
                "properties": {},geometry:geom};
            return res;
        } return null;

    }

    return {
        isFeature,
        isFeatureCollection,
        isPoint,
        transformToGeoJson
    }
}
