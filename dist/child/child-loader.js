import { filterHooksByAPIVersion } from '../esm';
let hooks;
/** @internal */
export function lateBindHooks(_hooks) {
    hooks = _hooks;
}
const proxy = {
    resolve(...args) {
        return (hooks?.resolve ?? args[2])(...args);
    },
    load(...args) {
        return (hooks?.load ?? args[2])(...args);
    },
    getFormat(...args) {
        return (hooks?.getFormat ?? args[2])(...args);
    },
    transformSource(...args) {
        return (hooks?.transformSource ?? args[2])(...args);
    },
};
/** @internal */
export const { resolve, load, getFormat, transformSource } = filterHooksByAPIVersion(proxy);
//# sourceMappingURL=child-loader.js.map