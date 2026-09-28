(function () {
    'use strict';

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    }

    function renderFallback(element, title) {
        element.classList.add('demo-chart-fallback');
        element.innerHTML = `
            <div style="height:100%;min-height:180px;display:flex;flex-direction:column;padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;box-sizing:border-box">
                <div style="font-weight:600;color:#334155;margin-bottom:16px">${escapeHtml(title)}</div>
                <div style="flex:1;display:flex;align-items:flex-end;gap:10px;border-left:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;padding:12px 16px 0">
                    <i style="height:38%;flex:1;background:#38bdf8;border-radius:3px 3px 0 0"></i>
                    <i style="height:65%;flex:1;background:#0ea5e9;border-radius:3px 3px 0 0"></i>
                    <i style="height:82%;flex:1;background:#0284c7;border-radius:3px 3px 0 0"></i>
                    <i style="height:56%;flex:1;background:#0369a1;border-radius:3px 3px 0 0"></i>
                    <i style="height:74%;flex:1;background:#075985;border-radius:3px 3px 0 0"></i>
                </div>
                <div style="font-size:12px;color:#64748b;text-align:right;margin-top:8px">离线演示图表</div>
            </div>`;
        return { setOption() {} };
    }

    function init(element, title) {
        if (window.echarts && typeof window.echarts.init === 'function') {
            return window.echarts.init(element);
        }
        return renderFallback(element, title || '数据图表');
    }

    window.DemoCharts = { init };
}());
