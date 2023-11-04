import { expectStream } from '@cspotcode/expect-stream';
import { PassThrough } from 'stream';
import { delay } from '../../helpers/misc';
import { TEST_DIR } from '../../helpers/paths';
/**
 * pass to test.context() to get REPL testing helper functions
 */
export async function ctxRepl(t) {
    const { tsNodeUnderTest } = t.context;
    return { createReplViaApi, executeInRepl };
    function createReplViaApi({ registerHooks, createReplOpts, createServiceOpts }) {
        const stdin = new PassThrough();
        const stdout = new PassThrough();
        const stderr = new PassThrough();
        const replService = tsNodeUnderTest.createRepl({
            stdin,
            stdout,
            stderr,
            ...createReplOpts,
        });
        const service = (registerHooks ? tsNodeUnderTest.register : tsNodeUnderTest.create)({
            ...replService.evalAwarePartialHost,
            project: `${TEST_DIR}/tsconfig.json`,
            ...createServiceOpts,
            tsTrace: replService.console.log.bind(replService.console),
        });
        replService.setService(service);
        t.teardown(async () => {
            service.enabled(false);
        });
        return { stdin, stdout, stderr, replService, service };
    }
    async function executeInRepl(input, options) {
        const { waitPattern, 
        // Wait longer if there's a signal to end it early
        waitMs = waitPattern != null ? 20e3 : 1e3, startInternalOptions, ...rest } = options;
        const { stdin, stdout, stderr, replService } = createReplViaApi(rest);
        if (startInternalOptions) {
            replService.startInternal(startInternalOptions);
        }
        else {
            replService.start();
        }
        stdin.write(input);
        stdin.end();
        const stdoutPromise = expectStream(stdout);
        const stderrPromise = expectStream(stderr);
        // Wait for expected output pattern or timeout, whichever comes first
        await Promise.race([
            delay(waitMs),
            waitPattern != null ? stdoutPromise.wait(waitPattern) : stdoutPromise,
            waitPattern != null ? stderrPromise.wait(waitPattern) : stderrPromise,
        ]);
        stdout.end();
        stderr.end();
        return {
            stdin,
            stdout: await stdoutPromise,
            stderr: await stderrPromise,
        };
    }
}
//# sourceMappingURL=ctx-repl.js.map