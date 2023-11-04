import { dirname } from 'path';
/**
 * @internal
 * Copied from https://unpkg.com/yn@3.1.1/index.js
 * Because people get weird when they see you have dependencies. /jk
 * This is a lazy way to make the dep number go down, we haven't touched this
 * dep in ages, and we didn't use all its features, so we stripped them.
 */
export function yn(input) {
    input = String(input).trim();
    if (/^(?:y|yes|true|1)$/i.test(input)) {
        return true;
    }
    if (/^(?:n|no|false|0)$/i.test(input)) {
        return false;
    }
}
/**
 * Like `Object.assign`, but ignores `undefined` properties.
 *
 * @internal
 */
export function assign(initialValue, ...sources) {
    for (const source of sources) {
        for (const key of Object.keys(source)) {
            const value = source[key];
            if (value !== undefined)
                initialValue[key] = value;
        }
    }
    return initialValue;
}
/**
 * Split a string array of values
 * and remove empty strings from the resulting array.
 * @internal
 */
export function split(value) {
    return typeof value === 'string' ? value.split(/ *, */g).filter((v) => v !== '') : undefined;
}
/**
 * Parse a string as JSON.
 * @internal
 */
export function parse(value) {
    return typeof value === 'string' ? JSON.parse(value) : undefined;
}
const directorySeparator = '/';
const backslashRegExp = /\\/g;
/**
 * Replace backslashes with forward slashes.
 * @internal
 */
export function normalizeSlashes(value) {
    return value.replace(backslashRegExp, directorySeparator);
}
/**
 * Safe `hasOwnProperty`
 * @internal
 */
export function hasOwnProperty(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
}
/**
 * Cached fs operation wrapper.
 */
export function cachedLookup(fn) {
    const cache = new Map();
    return (arg) => {
        if (!cache.has(arg)) {
            const v = fn(arg);
            cache.set(arg, v);
            return v;
        }
        return cache.get(arg);
    };
}
/**
 * @internal
 * Require something with v8-compile-cache, which should make subsequent requires faster.
 * Do lots of error-handling so that, worst case, we require without the cache, and users are not blocked.
 */
export function attemptRequireWithV8CompileCache(requireFn, specifier) {
    try {
        const v8CC = require('v8-compile-cache-lib').install();
        try {
            return requireFn(specifier);
        }
        finally {
            v8CC?.uninstall();
        }
    }
    catch (e) {
        return requireFn(specifier);
    }
}
/**
 * Helper to discover dependencies relative to a user's project, optionally
 * falling back to relative to ts-node.  This supports global installations of
 * ts-node, for example where someone does `#!/usr/bin/env -S ts-node --swc` and
 * we need to fallback to a global install of @swc/core
 * @internal
 */
export function createProjectLocalResolveHelper(localDirectory) {
    return function projectLocalResolveHelper(specifier, fallbackToTsNodeRelative) {
        return require.resolve(specifier, {
            paths: fallbackToTsNodeRelative ? [localDirectory, __dirname] : [localDirectory],
        });
    };
}
/**
 * Used as a reminder of all the factors we must consider when finding project-local dependencies and when a config file
 * on disk may or may not exist.
 * @internal
 */
export function getBasePathForProjectLocalDependencyResolution(configFilePath, projectSearchDirOption, projectOption, cwdOption) {
    if (configFilePath != null)
        return dirname(configFilePath);
    return projectSearchDirOption ?? projectOption ?? cwdOption;
    // TODO technically breaks if projectOption is path to a file, not a directory,
    // and we attempt to resolve relative specifiers.  By the time we resolve relative specifiers,
    // should have configFilePath, so not reach this codepath.
}
/** @internal */
export function once(fn) {
    let value;
    let ran = false;
    function onceFn(...args) {
        if (ran)
            return value;
        value = fn(...args);
        ran = true;
        return value;
    }
    return onceFn;
}
/** @internal */
export function versionGteLt(version, gteRequirement, ltRequirement) {
    const [major, minor, patch, extra] = parse(version);
    const [gteMajor, gteMinor, gtePatch] = parse(gteRequirement);
    const isGte = major > gteMajor || (major === gteMajor && (minor > gteMinor || (minor === gteMinor && patch >= gtePatch)));
    let isLt = true;
    if (ltRequirement) {
        const [ltMajor, ltMinor, ltPatch] = parse(ltRequirement);
        isLt = major < ltMajor || (major === ltMajor && (minor < ltMinor || (minor === ltMinor && patch < ltPatch)));
    }
    return isGte && isLt;
    function parse(requirement) {
        return requirement.split(/[\.-]/).map((s) => parseInt(s, 10));
    }
}
//# sourceMappingURL=util.js.map