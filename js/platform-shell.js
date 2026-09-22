(function () {
    'use strict';

    const PLATFORM_NAME = '人工智能算法训练平台';
    const VALID_ROLES = new Set(['student', 'teacher', 'admin']);
    const experimentRoutes = {
        'virtual-sim': 'engineering-simulation.html',
        '3d-designer': '3d-designer-enhanced.html',
        'industry-cloud': 'industry-cloud.html',
        '2d-designer': '2d-designer.html',
        'jupyter': 'jupyter-lab.html',
        'blockchain': 'blockchain-lab.html',
        'embedded': 'embedded-sim.html'
    };

    const icons = {
        brand: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 25 14 7h4l8 18h-5l-1.5-4H12l-1.5 4H6Zm7.5-8h4.4L16 12l-2.5 5Z"/><path d="M24 7h4v11h-4z"/></svg>',
        home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/></svg>',
        course: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Zm3 12h12M8 8h7"/></svg>',
        experiment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/></svg>',
        exam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v4h3v14H4V7h3V3Zm0 8h10M7 15h7"/></svg>',
        ai: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="3"/><path d="M9 11h.01M15 11h.01M9 16h6M12 2v4"/></svg>',
        back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>'
    };

    function iconSvg(name) {
        return icons[name] || icons.home;
    }

    function getRole() {
        try {
            const role = localStorage.getItem('userRole');
            return VALID_ROLES.has(role) ? role : 'student';
        } catch (error) {
            return 'student';
        }
    }

    function showPlatformNotice(message, type = 'info') {
        const oldNotice = document.querySelector('.platform-notice');
        if (oldNotice) oldNotice.remove();

        const notice = document.createElement('div');
        notice.className = `platform-notice platform-notice--${type}`;
        notice.setAttribute('role', 'status');
        notice.textContent = message;
        document.body.appendChild(notice);
        requestAnimationFrame(() => notice.classList.add('is-visible'));
        window.setTimeout(() => notice.remove(), 2600);
    }

    function initPlatformShell() {
        const pageId = document.body.dataset.platformPage;
        if (!pageId || document.documentElement.dataset.platformReady === 'true') return;

        document.documentElement.dataset.platformReady = 'true';
        document.documentElement.dataset.platformRole = getRole();
    }

    window.PlatformShell = {
        init: initPlatformShell,
        icon: iconSvg,
        showNotice: showPlatformNotice,
        experimentRoutes
    };

    document.addEventListener('DOMContentLoaded', initPlatformShell);
}());
