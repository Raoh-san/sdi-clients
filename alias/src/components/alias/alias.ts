
import { DIV } from 'sdi/components/elements';

import form from './form';
import table from './table';

const render =
    () => {
        return DIV({}, table(), form())
    };


export default render;