import { getPatternFromSpec } from './ts-internals';
import { cachedLookup, normalizeSlashes } from './util';
/**
 * @internal
 * May receive non-normalized options -- basePath and patterns -- and will normalize them
 * internally.
 * However, calls to `classifyModule` must pass pre-normalized paths!
 */
export function createModuleTypeClassifier(options) {
    const { patterns, basePath: _basePath } = options;
    const basePath = _basePath !== undefined ? normalizeSlashes(_basePath).replace(/\/$/, '') : undefined;
    const patternTypePairs = Object.entries(patterns ?? []).map(([_pattern, type]) => {
        const pattern = normalizeSlashes(_pattern);
        return { pattern: parsePattern(basePath, pattern), type };
    });
    const classifications = {
        package: {
            moduleType: 'auto',
        },
        cjs: {
            moduleType: 'cjs',
        },
        esm: {
            moduleType: 'esm',
        },
    };
    const auto = classifications.package;
    // Passed path must be normalized!
    function classifyModuleNonCached(path) {
        const matched = matchPatterns(patternTypePairs, (_) => _.pattern, path);
        if (matched)
            return classifications[matched.type];
        return auto;
    }
    const classifyModule = cachedLookup(classifyModuleNonCached);
    function classifyModuleAuto(path) {
        return auto;
    }
    return {
        classifyModuleByModuleTypeOverrides: patternTypePairs.length ? classifyModule : classifyModuleAuto,
    };
}
function parsePattern(basePath, patternString) {
    const pattern = getPatternFromSpec(patternString, basePath);
    return pattern !== undefined ? new RegExp(pattern) : /(?:)/;
}
function matchPatterns(objects, getPattern, candidate) {
    for (let i = objects.length - 1; i >= 0; i--) {
        const object = objects[i];
        const pattern = getPattern(object);
        if (pattern?.test(candidate)) {
            return object;
        }
    }
}
//# sourceMappingURL=module-type-classifier.js.map