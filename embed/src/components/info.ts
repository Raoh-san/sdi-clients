
import { DIV, H1, A } from 'sdi/components/elements';
import tr, { fromRecord, formatDate } from 'sdi/locale';

import { getMapInfo } from '../queries/app';




const render =
    () => getMapInfo().fold(
        () => DIV(),
        mapInfo => DIV({ className: 'map-infos' },
            DIV({ className: 'map-title' },
                H1({}, A({ href: '/index.html', target: '_top' }, fromRecord(mapInfo.title)))),
            DIV({ className: 'map-date' },
                DIV({ className: 'map-date-label' }, tr('lastModified')),
                DIV({ className: 'map-date-value' },
                    formatDate(new Date(mapInfo.lastModified))))));

export default render;
