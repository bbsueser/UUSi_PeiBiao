const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

function loadCharts(echarts) {
    let source = '';
    try {
        source = fs.readFileSync('js/demo-chart-fallback.js', 'utf8');
    } catch {}
    const sandbox = { window: { echarts } };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox);
    return sandbox.window.DemoCharts;
}

test('offline chart adapter renders a local placeholder when ECharts is unavailable', () => {
    const charts = loadCharts(undefined);
    const element = { innerHTML: '', classList: { add() {} } };

    assert.equal(typeof charts?.init, 'function');
    const chart = charts.init(element, '训练曲线');
    chart.setOption({ series: [] });
    assert.match(element.innerHTML, /训练曲线/);
    assert.match(element.innerHTML, /离线演示图表/);
});

test('chart adapter delegates to ECharts when the library is present', () => {
    const expected = { setOption() {} };
    const charts = loadCharts({ init() { return expected; } });

    assert.equal(charts.init({}, '图表'), expected);
});
