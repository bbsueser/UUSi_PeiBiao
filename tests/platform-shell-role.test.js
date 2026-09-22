const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('js/platform-shell.js', 'utf8');

function loadShell({ storedRole = null, pageRole = '' } = {}) {
    const writes = [];
    const sandbox = {
        window: {},
        document: {
            readyState: 'loading',
            addEventListener() {},
            body: { dataset: { platformRole: pageRole } }
        },
        localStorage: {
            getItem(key) {
                return key === 'userRole' ? storedRole : null;
            },
            setItem(key, value) {
                writes.push([key, value]);
            }
        },
        console
    };

    vm.createContext(sandbox);
    vm.runInContext(source, sandbox);
    return { shell: sandbox.window.PlatformShell, writes };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

{
    const { shell, writes } = loadShell({ storedRole: 'student', pageRole: 'teacher' });
    assert(typeof shell.resolveRole === 'function', 'PlatformShell.resolveRole must be public');
    assert(shell.resolveRole() === 'teacher', 'dashboard role must override stale storage');
    assert(writes.some(([key, value]) => key === 'userRole' && value === 'teacher'), 'dashboard role must persist');
}

{
    const { shell, writes } = loadShell({ storedRole: 'admin' });
    assert(shell.resolveRole() === 'admin', 'shared pages must retain the stored role');
    assert(writes.length === 0, 'shared pages must not rewrite a valid stored role');
}

{
    const { shell } = loadShell({ storedRole: 'unknown' });
    assert(shell.resolveRole() === 'student', 'unknown roles must fall back to student');
}

console.log('Platform shell role-state tests passed.');
