(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WiringUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function findTargetPort(ports, clientX, clientY, options = {}) {
        const snapDistance = Number.isFinite(options.snapDistance) ? options.snapDistance : 24;
        const excludeDeviceId = options.excludeDeviceId == null ? null : String(options.excludeDeviceId);
        let closest = null;
        let closestDistance = Infinity;

        Array.from(ports || []).forEach((port) => {
            if (!port || !port.dataset || typeof port.getBoundingClientRect !== 'function') return;
            if (excludeDeviceId && port.dataset.deviceId === excludeDeviceId) return;

            const rect = port.getBoundingClientRect();
            if (!rect || rect.width <= 0 || rect.height <= 0) return;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.hypot(clientX - centerX, clientY - centerY);

            if (distance <= snapDistance && distance < closestDistance) {
                closest = port;
                closestDistance = distance;
            }
        });

        return closest;
    }

    return { findTargetPort };
});
