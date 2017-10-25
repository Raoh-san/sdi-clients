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
import { TimeserieConfig } from 'sdi/source';
import appQueries from './app';


interface NotNullProperties {
    [key: string]: any;
}

const extractPropNamePat = new RegExp('.*\{(.+)\}.*');
const replacePropNamePat = new RegExp('(.*)\{.+\}(.*)');


const getPropName =
    (template: string) => {
        const result = extractPropNamePat.exec(template);
        if (!result) {
            return template;
        }
        if (result.length !== 2) {
            return template;
        }
        return result[1];
    };

const buildURL =
    (template: string, props: NotNullProperties) => {

        const propName = getPropName(template);
        const value = props[propName];

        return template.replace(replacePropNamePat,
            (_m: string, p1: string, p2: string) => (
                `${p1}${value}${p2}`
            ));
    };




const queries = {
    // Id hash layerName | featurePropertyValue
    getData(props: NotNullProperties, config: TimeserieConfig) {
        const series = query('data/timeseries');
        const id = queries.getTimeserieId(props, config);

        if (id && id in series) {
            return series[id];
        }

        return null;
    },

    getTimeserieId(props: NotNullProperties, config: TimeserieConfig) {
        const layer = appQueries.getCurrentLayerId();
        if (layer !== null) {
            const propVal = props[getPropName(config.options.urlTemplate)];
            if (propVal) {
                return `${layer}|${propVal}`;
            }
        }

        return null;
    },

    getTimeserieUrl(props: NotNullProperties, config: TimeserieConfig) {
        return buildURL(config.options.urlTemplate, props);
    },

    getSelection() {
        return query('component/timeserie').selection;
    },

    isEditing() {
        return query('component/timeserie').editingSelection;
    },

    isActive() {
        return query('component/timeserie').active;
    },

    getCursorPosition() {
        return query('component/timeserie').cursorPosition;
    },
};

export default queries;
