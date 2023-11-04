import { expect, test } from '../../testlib';
export const macroReplNoErrorsAndStdoutContains = test.macro((script, contains, options) => async (t) => {
    macroReplInternal(t, script, contains, undefined, contains, options);
});
export const macroReplStderrContains = test.macro((script, errorContains, options) => async (t) => {
    macroReplInternal(t, script, undefined, errorContains, errorContains, options);
});
async function macroReplInternal(t, script, stdoutContains, stderrContains, waitPattern, options) {
    const r = await t.context.executeInRepl(script, {
        registerHooks: true,
        startInternalOptions: { useGlobal: false },
        waitPattern,
        ...options,
    });
    if (stderrContains)
        expect(r.stderr).toContain(stderrContains);
    else
        expect(r.stderr).toBe('');
    if (stdoutContains)
        expect(r.stdout).toContain(stdoutContains);
}
//# sourceMappingURL=macros.js.map