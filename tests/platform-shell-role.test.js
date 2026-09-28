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
            createElement() {
                return { nodeType: 1, className: '', innerHTML: '' };
            },
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

{
    const { shell } = loadShell();
    assert(typeof shell.stripDecorativeEmoji === 'function', 'PlatformShell must expose emoji normalization');
    assert(shell.stripDecorativeEmoji('📊 技能图谱') === '技能图谱', 'decorative emoji must be removed from labels');
    assert(shell.stripDecorativeEmoji('⚠ 连线错误') === '⚠ 连线错误', 'meaningful warning status must be preserved');
    assert(shell.decorativeIcon('📚') === 'course', 'book emoji must map to the course line icon');
    assert(shell.decorativeIcon('🤖') === 'ai', 'robot emoji must map to the AI line icon');
}

{
    const { shell } = loadShell();
    const textNode = { nodeType: 3, nodeValue: '📚 8 门课程' };
    const leaf = {
        nodeType: 1,
        textContent: '📚 8 门课程',
        children: [],
        childNodes: [textNode],
        classList: { add() {} },
        matches() { return false; }
    };
    const root = {
        nodeType: 9,
        querySelectorAll(selector) {
            return selector.includes('body *') ? [leaf] : [];
        }
    };

    shell.normalizeDecorativeEmoji(root);
    assert(textNode.nodeValue.trim() === '8 门课程', 'decorative emoji must be removed from ordinary leaf labels');
}

{
    const { shell } = loadShell();
    const textNode = { nodeType: 3, nodeValue: '🟢 模拟实验 (已开启)' };
    const parent = {
        nodeType: 1,
        textContent: textNode.nodeValue,
        children: [],
        childNodes: [textNode],
        classList: { add() {} },
        matches() { return true; },
        querySelectorAll() { return []; }
    };
    textNode.parentElement = parent;

    assert(typeof shell.normalizeAddedNode === 'function', 'dynamic emoji normalization must be public');
    shell.normalizeAddedNode(textNode);
    assert(textNode.nodeValue.trim() === '模拟实验 (已开启)', 'dynamic text updates must remove decorative emoji');
}

{
    const { shell } = loadShell();
    const textNode = { nodeType: 3, nodeValue: '☁️' };
    const tooltip = { nodeType: 1 };
    let insertedIcon = null;
    const button = {
        nodeType: 1,
        children: [tooltip],
        childNodes: [textNode, tooltip],
        classList: { add() {} },
        matches() { return false; },
        querySelector() { return null; },
        insertBefore(node) { insertedIcon = node; }
    };
    const root = { nodeType: 9, querySelectorAll() { return [button]; } };

    shell.normalizeDecorativeEmoji(root);
    assert(insertedIcon?.className === 'platform-inline-icon', 'icon-only buttons with tooltips must retain a visible line icon');
    assert(textNode.nodeValue === '', 'the original decorative emoji must still be removed');
}

{
    const { shell } = loadShell();
    const container = {
        nodeType: 1,
        children: [{}],
        childNodes: [{ nodeType: 1 }],
        classList: { add() {} },
        get textContent() {
            throw new Error('container descendant text must not be aggregated');
        }
    };
    const root = { nodeType: 9, querySelectorAll() { return [container]; } };

    shell.normalizeDecorativeEmoji(root);
}

console.log('Platform shell role-state tests passed.');
