
/*
 *  Copyright (C) 2017 Atelier Cartographique <contact@atelier-cartographique.be>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { query } from 'sdi/shape';
import { getMessageRecord } from 'sdi/source';
import { SyntheticLayerInfo } from 'sdi/app';

import { getDatasetMetadata } from './metadata';



const queries = {



    getUserData() {
        return query('data/user');
    },



    mapReady() {
        return query('app/map-ready');
    },


    getLayout() {
        const ll = query('app/layout');
        if (ll.length === 0) {
            throw (new Error('PoppingEmptyLayoutList'));
        }
        return ll[ll.length - 1];
    },


    getLayerData(id: string | null) {
        const layers = query('data/layers');
        if (id && id in layers) {
            return layers[id];
        }
        return null;
    },

    getMap(mid: string) {
        const maps = query('data/maps');
        return maps.find(m => m.id === mid);
    },

    getMapInfo() {
        const mid = query('app/current-map');
        const info = query('data/maps').find(m => m.id === mid);
        return (info !== undefined) ? info : null;
    },

    getLayerInfo(layerId: string): SyntheticLayerInfo {
        const mid = query('app/current-map');
        const info = query('data/maps').find(m => m.id === mid);
        if (info) {
            const layers = info.layers;
            const layerInfo = layers.find(l => l.id === layerId);
            if (layerInfo) {
                return getDatasetMetadata(layerInfo.metadataId).fold<SyntheticLayerInfo>(
                    () => ({ name: null, info: null, metadata: null }),
                    metadata => ({
                        name: getMessageRecord(metadata.resourceTitle),
                        info: layerInfo,
                        metadata,
                    })
                );
            }
        }
        return { name: null, info: null, metadata: null };
    },

    getCurrentMap() {
        return query('app/current-map');
    },

    getCurrentLayerId() {
        return query('app/current-layer');
    },

    getCurrentLayerInfo() {
        const lid = query('app/current-layer');
        if (lid) {
            return queries.getLayerInfo(lid);
        }
        return { name: null, info: null, metadata: null };
    },

    getCurrentFeature() {
        return query('app/current-feature');
    },

    getCurrentBaseLayer() {
        const mid = query('app/current-map');
        const map = query('data/maps').find(m => m.id === mid);
        if (map) {
            return map.baseLayer;
        }
        return null;
    },


    getCategories() {
        return query('data/categories');
    },

    getSplash() {
        return query('component/splash');
    },
};

export default queries;
