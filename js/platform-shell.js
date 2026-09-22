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

    const navigationByRole = {
        student: [
            ['dashboard.html', '工作台', 'home'],
            ['course-hall.html', '课程', 'course'],
            ['experiment-hall.html', '实验', 'experiment'],
            ['exam-hall.html', '考试', 'exam'],
            ['ai-assistant.html', 'AI 学伴', 'ai'],
            ['ai-analysis.html', '学习分析', 'analysis'],
            ['task-management.html', '任务', 'task'],
            ['hardware-agent.html', '硬件智能体', 'hardware'],
            ['profile.html', '个人中心', 'user']
        ],
        teacher: [
            ['teacher-dashboard.html', '工作台', 'home'],
            ['course-hall.html', '课程', 'course'],
            ['task-management.html', '任务', 'task'],
            ['exam-management.html', '考试', 'exam'],
            ['experiment-hall.html', '实验', 'experiment'],
            ['ai-analysis.html', '教学分析', 'analysis'],
            ['ai-assistant.html', 'AI 助手', 'ai'],
            ['profile.html', '个人中心', 'user']
        ],
        admin: [
            ['admin-dashboard.html', '工作台', 'home'],
            ['course-hall.html', '课程', 'course'],
            ['experiment-hall.html', '实验', 'experiment'],
            ['ai-analysis.html', '数据分析', 'analysis'],
            ['ai-assistant.html', 'AI 助手', 'ai'],
            ['profile.html', '个人中心', 'user']
        ]
    };

    const icons = {
        brand: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 25 14 7h4l8 18h-5l-1.5-4H12l-1.5 4H6Zm7.5-8h4.4L16 12l-2.5 5Z"/><path d="M24 7h4v11h-4z"/></svg>',
        home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/></svg>',
        course: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Zm3 12h12M8 8h7"/></svg>',
        experiment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/></svg>',
        exam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v4h3v14H4V7h3V3Zm0 8h10M7 15h7"/></svg>',
        ai: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="3"/><path d="M9 11h.01M15 11h.01M9 16h6M12 2v4"/></svg>',
        analysis: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
        task: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10M7 9h10M7 14h7M4 4h.01M4 9h.01M4 14h.01M4 19h.01M7 19h5"/></svg>',
        hardware: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M19 9h3M2 15h3M19 15h3"/></svg>',
        user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
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

    function normalizeExistingBrand() {
        document.querySelectorAll('.nav-brand').forEach((brand) => {
            brand.innerHTML = `<span class="platform-brand-mark">${iconSvg('brand')}</span><span class="nav-brand-text">${PLATFORM_NAME}</span>`;
        });

        document.querySelectorAll('.top-nav-logo .logo-icon, .header-logo-icon').forEach((mark) => {
            mark.classList.add('platform-brand-mark');
            mark.innerHTML = iconSvg('brand');
        });
    }

    function renderWorkspaceBar() {
        if (document.querySelector('.platform-workspace-bar')) return;

        const bar = document.createElement('header');
        bar.className = 'platform-workspace-bar';
        bar.innerHTML = `
            <span class="platform-brand-mark">${iconSvg('brand')}</span>
            <strong>${PLATFORM_NAME}</strong>
            <span class="platform-breadcrumbs">实验中心 / ${document.title.split(' - ')[0]}</span>
            <a class="platform-back-link" href="experiment-detail.html">${iconSvg('back')} 返回实验详情</a>`;
        document.body.prepend(bar);
    }

    function currentFile() {
        return window.location.pathname.split('/').pop() || 'dashboard.html';
    }

    function activeFile() {
        const file = currentFile();
        if (file === 'course-detail.html') return 'course-hall.html';
        if (file === 'exam-anti-cheat.html') return 'exam-hall.html';
        if (Object.values(experimentRoutes).includes(file) || file === 'blockchain-dev.html') {
            return 'experiment-hall.html';
        }
        return file;
    }

    function navigationLink(item) {
        const [url, label, icon] = item;
        const active = activeFile() === url ? ' active' : '';
        return `<a href="${url}" class="platform-nav-link nav-link${active}"><span class="platform-nav-icon">${iconSvg(icon)}</span><span>${label}</span></a>`;
    }

    function sidebarLink(item) {
        const [url, label, icon] = item;
        const active = activeFile() === url ? ' active' : '';
        return `<a href="${url}" class="platform-nav-link sidebar-item${active}"><span class="platform-nav-icon">${iconSvg(icon)}</span><span>${label}</span></a>`;
    }

    function renderStandardNavigation(role) {
        const items = navigationByRole[role] || navigationByRole.student;
        document.querySelectorAll('[data-platform-navigation="global"]').forEach((menu) => {
            if (menu.classList.contains('sidebar-menu')) {
                menu.innerHTML = items.map(sidebarLink).join('');
                return;
            }
            menu.innerHTML = items.slice(0, 5).map(navigationLink).join('');
        });
    }

    function normalizeLocalNavigationIcons() {
        document.querySelectorAll('[data-platform-navigation="local"] .sidebar-icon').forEach((mark) => {
            const item = mark.closest('a, button');
            const label = item ? item.textContent.trim() : '';
            let icon = 'task';
            if (/工作台|首页/.test(label)) icon = 'home';
            else if (/课程|题库/.test(label)) icon = 'course';
            else if (/实验/.test(label)) icon = 'experiment';
            else if (/考试|试卷|阅卷|成绩|防作弊/.test(label)) icon = 'exam';
            else if (/分析|统计/.test(label)) icon = 'analysis';
            else if (/用户|学生|个人/.test(label)) icon = 'user';
            else if (/AI|智能体|设备|系统设置/.test(label)) icon = 'hardware';
            mark.classList.add('platform-nav-icon');
            mark.innerHTML = iconSvg(icon);
        });
    }

    function normalizePageTitles() {
        const decorativePrefix = /^[\s📚🔬📝🧠👤🎓🤖📊⚙️]+/u;
        document.querySelectorAll('.page-title, main h1').forEach((heading) => {
            const textNode = Array.from(heading.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
            if (textNode) textNode.nodeValue = textNode.nodeValue.replace(decorativePrefix, '');
        });
    }

    function initPlatformShell() {
        const pageId = document.body.dataset.platformPage;
        if (!pageId || document.documentElement.dataset.platformReady === 'true') return;

        document.documentElement.dataset.platformReady = 'true';
        const role = getRole();
        document.documentElement.dataset.platformRole = role;

        if (document.body.dataset.platformShell === 'workspace') {
            normalizeExistingBrand();
            renderWorkspaceBar();
        } else {
            normalizeExistingBrand();
            renderStandardNavigation(role);
            normalizeLocalNavigationIcons();
            normalizePageTitles();
        }

        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-platform-notice]');
            if (!trigger) return;
            event.preventDefault();
            showPlatformNotice(trigger.dataset.platformNotice || '演示模块暂未开放', 'info');
        });
    }

    window.PlatformShell = {
        init: initPlatformShell,
        icon: iconSvg,
        showNotice: showPlatformNotice,
        experimentRoutes
    };

    document.addEventListener('DOMContentLoaded', initPlatformShell);
}());
