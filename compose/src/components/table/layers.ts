
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

import * as debug from 'debug';
import { SelectRowHandler } from 'sdi/components/table';
import { base } from './base';
import queries from '../../queries/table';
// import appQueries from '../../queries/app';
import appEvents from '../../events/app';
import { DIV } from 'sdi/components/elements';
import tr from 'sdi/locale';
import { AppLayout } from '../../shape/types';
import { button } from '../button';

const logger = debug('sdi:table/layers');

const closeButton = button('close');

const toolbar = () => {
    return DIV({ className: 'table-toolbar', key: 'table-toolbar' },
        DIV({ className: 'table-title' }, tr('selectLayer')),
        closeButton(() => {
            appEvents.setLayout(AppLayout.MapAndInfo);
        }));
};

const onRowSelect: SelectRowHandler =
    () => {
        appEvents.setLayout(AppLayout.LayerSelectAndInspire);
    };


const render = base({
    className: 'layer-select-wrapper',
    loadData: queries.loadLayerListData,
    loadKeys: queries.loadLayerListKeys,
    loadTypes: queries.loadLayerListTypes,
    toolbar,
    onRowSelect,
});

export default render;

logger('loaded');

