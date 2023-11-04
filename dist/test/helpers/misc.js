import { TEST_DIR } from './paths';
import { join } from 'path';
import { promisify } from 'util';
import { createRequire } from 'module';
export const testsDirRequire = createRequire(join(TEST_DIR, 'index.js'));
export const ts = testsDirRequire('typescript');
export const delay = promisify(setTimeout);
/** Essentially Array:includes, but with tweaked types for checks on enums */
export function isOneOf(value, arrayOfPossibilities) {
    return arrayOfPossibilities.includes(value);
}
//# sourceMappingURL=misc.js.map