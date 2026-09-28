const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const repoRoot = path.resolve(__dirname, '..');

function readPage(name) {
    return fs.readFileSync(path.join(repoRoot, name), 'utf8');
}

function staticIds(html) {
    return Array.from(html.matchAll(/\bid=["']([^"']+)["']/g), (match) => match[1])
        .filter((id) => !id.includes('${'));
}

function inlineHandlers(html) {
    const handlers = new Set();
    for (const attribute of html.matchAll(/\bon(?:click|change|keydown)=["']([^"']+)["']/g)) {
        for (const call of attribute[1].matchAll(/(?:^|[^.\w])([A-Za-z_$][\w$]*)\s*\(/g)) {
            handlers.add(call[1]);
        }
    }
    return handlers;
}

function declaredFunctions(html) {
    return new Set(Array.from(html.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g), (match) => match[1]));
}

function trainingStep(html, step) {
    const start = html.indexOf(`id="train-step-${step}"`);
    const nextMarker = step < 6 ? `<!-- 步骤${step + 1}:` : '<!-- ModelDeploy';
    const end = html.indexOf(nextMarker, start);

    assert.notEqual(start, -1, `training step ${step} must exist`);
    assert.notEqual(end, -1, `training step ${step} must have a closing boundary`);
    return html.slice(start, end);
}

test('engineering simulation exposes each static DOM id exactly once', () => {
    const ids = staticIds(readPage('engineering-simulation.html'));
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    assert.deepEqual([...new Set(duplicates)], []);
});

test('engineering simulation declares every inline interaction handler', () => {
    const html = readPage('engineering-simulation.html');
    const declared = declaredFunctions(html);
    const missing = [...inlineHandlers(html)].filter((name) => !declared.has(name));

    assert.deepEqual(missing, []);
});

test('engineering simulation provides the message writer used by data generators', () => {
    const declared = declaredFunctions(readPage('engineering-simulation.html'));

    assert.equal(declared.has('addMessageToPanel'), true);
});

test('engineering toolbar utility buttons use visible SVG icons instead of removable emoji', () => {
    const html = readPage('engineering-simulation.html');

    assert.match(html, /id="cloudBtn"[^>]*aria-label="云平台"[\s\S]*?<svg/);
    assert.match(html, /id="desktopBtn"[^>]*aria-label="桌面助手"[\s\S]*?<svg/);
    assert.doesNotMatch(html, /<button class="icon-btn"[^>]*>\s*[🤖☁💻]/u);
});

test('AI assistant MQTT answer includes a local visual explanation', () => {
    const html = readPage('ai-assistant.html');
    const imagePath = path.join(repoRoot, 'images', 'ai-answers', 'mqtt-smart-greenhouse.png');

    assert.equal(fs.existsSync(imagePath), true);
    assert.match(html, /images\/ai-answers\/mqtt-smart-greenhouse\.png/);
    assert.match(html, /知识库参考/);
    assert.doesNotMatch(html, /generateMqttFlowSVG/);
});

test('engineering simulation and industry cloud load the same local bridge', () => {
    for (const page of ['engineering-simulation.html', 'industry-cloud.html']) {
        assert.match(readPage(page), /js\/demo-cloud-bridge\.js/);
    }
});

test('engineering troubleshooting scene has dedicated non-overlapping gateway ports', () => {
    const html = readPage('engineering-simulation.html');

    assert.match(html, /js\/troubleshooting-scenario\.js/);
    assert.match(html, /role:\s*["']temperature["']/);
    assert.match(html, /role:\s*["']humidity["']/);
    assert.match(html, /role:\s*["']actuator["']/);
    assert.match(html, /role:\s*["']power["']/);
    assert.match(html, /createWire\(fan,\s*0,\s*gateway,\s*2\)/);
});

test('engineering assistant and cloud panels close directly and open exclusively', () => {
    const html = readPage('engineering-simulation.html');

    assert.match(html, /function\s+closeCloudPanel\s*\(/);
    assert.match(html, /function\s+closeAIPanel\s*\(/);
    assert.match(html, /function\s+toggleCloudPanel\s*\([\s\S]*?closeAIPanel\(\)/);
    assert.match(html, /function\s+toggleAIPanel\s*\([\s\S]*?closeCloudPanel\(\)/);
    assert.match(html, /class="cloud-panel-close" onclick="closeCloudPanel\(\)"/);
    assert.match(html, /class="ai-panel-close" onclick="closeAIPanel\(\)"/);
});

test('UUSi demo uses generic industry cloud branding', () => {
    for (const page of ['industry-cloud.html', 'experiment-hall.html', 'exam-hall.html', 'exam-anti-cheat.html']) {
        assert.doesNotMatch(readPage(page), /ThingsBoard/i, page);
    }
});

test('model training starts from data upload and keeps early steps navigable', () => {
    const html = readPage('jupyter-lab.html');
    const step1 = trainingStep(html, 1);
    const step2 = trainingStep(html, 2);

    assert.match(html, /let\s+trainStep\s*=\s*1\s*;/);
    assert.match(step1, /数据上传与预处理/);
    assert.match(step1, /onclick="nextTrainStep\(\)"/);
    assert.match(step2, /onclick="prevTrainStep\(\)"/);
    assert.match(step2, /onclick="nextTrainStep\(\)"/);
});
