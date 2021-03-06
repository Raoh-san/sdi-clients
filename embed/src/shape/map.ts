
// imports from sdi
import { IMapInfo, Inspire, FeatureCollection } from 'sdi/source';
import { IMapViewData, IMapScale, Interaction } from 'sdi/map';

export type IdentifiedFeatureCollection = [string, FeatureCollection];

// State Augmentation
declare module 'sdi/shape' {
    export interface IShape {
        'port/map/view': IMapViewData;
        'port/map/scale': IMapScale;
        'port/map/interaction': Interaction;

        'data/map': IMapInfo | null;
        'data/metadata': Inspire[];
        'data/layer': IdentifiedFeatureCollection[];
    }
}
