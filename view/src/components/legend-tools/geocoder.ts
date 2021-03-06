
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

import { ChangeEvent, KeyboardEvent } from 'react';

import { DIV, INPUT, SPAN } from 'sdi/components/elements';
import tr from 'sdi/locale';
import { isENTER } from 'sdi/components/keycodes';
import { getLang } from 'sdi/app';

import events from '../../events/legend';
import queries from '../../queries/legend';
import { viewEvents, putMark } from '../../events/map';
import { queryService, IUgWsResult, IUgWsAddress } from '../../ports/geocoder';

const updateAddress = (e: ChangeEvent<HTMLInputElement>) => {
    events.updateGeocoderTerm(e.target.value);
};

const searchAddress = () => {
    const state = queries.toolsGeocoder();
    const lang = getLang();
    queryService(state.address, lang)
        .then(events.updateGeocoderResponse)
        .then(events.unfoldGeocoder);
};

const addressToString = (a: IUgWsAddress) => {
    return `${a.street.name} ${a.number}, ${a.street.postCode} ${a.street.municipality}`;
};

const renderResults = (results: IUgWsResult[]) => {
    return results.map((result, key) => {
        const coords: [number, number] = [result.point.x, result.point.y];
        return DIV({ className: 'adress-result', key },
            SPAN({
                onClick: () => {
                    events.updateGeocoderResponse(null);
                    events.foldGeocoder();
                    viewEvents.updateMapView({
                        dirty: 'geo',
                        center: coords,
                        zoom: 12,
                    });
                    putMark(coords);
                },
            }, addressToString(result.address)));
    });
};

const render = () => {
    const state = queries.toolsGeocoder();
    if (!state.folded && (state.serviceResponse !== null)) {
        return DIV({ className: 'tool geocoder' },
            DIV({ className: 'tool-body adress' }, renderResults(state.serviceResponse.result)));
    }
    return (
        DIV({ className: 'tool geocoder' },
            DIV({ className: 'tool-body adress' },
                INPUT({
                    type: 'text',
                    name: 'adress',
                    placeholder: tr('geocode'),
                    onChange: updateAddress,
                    onKeyPress: (e: KeyboardEvent<HTMLInputElement>) => {
                        if (isENTER(e)) {
                            searchAddress();
                        }
                    },
                }),
                DIV({
                    className: 'btn-search',
                    onClick: searchAddress,
                }, )))
    );


};

export default render;
