import { DIV, H1 } from '../elements';
import { tryLogout } from '../../events/login';
import button from '../button';
import tr from '../../locale';
import appQueries from '../../queries/app';
import { fromNullable } from 'fp-ts/lib/Option';





const logoutButton = button('logout', 'logout');
const username = () => DIV({ className: 'username' }, fromNullable(appQueries.getUserData()).fold(
    () => '',
    u => u.name
));


const render =
    () => (
        DIV({ className: 'login-wrapper' },
            H1({}, tr('connectionSDI')),
            DIV({ className: 'login-widget' },
                username(),
                logoutButton(tryLogout))));

export default render;
