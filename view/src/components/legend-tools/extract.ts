
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

import { DIV, H2 } from 'sdi/components/elements';
import tr from 'sdi/locale';

import { startExtract } from '../../events/map';


const render = () => {
    return (
        DIV({ className: 'tool extract' },
            H2({}, tr('extractFeatures')),
            DIV({ className: 'tool-body' },
                DIV({
                    className: 'btn-extract',
                    onClick: startExtract,
                }, tr('start'))))
    );
};

export default render;
