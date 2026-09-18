/**
 * 智慧教学平台 - 统一导航配置
 * 用于所有页面的导航跳转
 */

// ========== 导航配置 ==========
const NAV_CONFIG = {
    // 学生端导航
    student: [
        { name: '我的工作台', icon: '📊', url: 'dashboard.html', id: 'dashboard' },
        { name: '课程大厅', icon: '📚', url: 'course-hall.html', id: 'course-hall' },
        { name: '实验大厅', icon: '🔬', url: 'experiment-hall.html', id: 'experiment-hall' },
        { name: '考试大厅', icon: '📝', url: 'exam-hall.html', id: 'exam-hall' },
        { name: 'AI学习助手', icon: '🤖', url: 'ai-assistant.html', id: 'ai-assistant' },
        { name: 'AI分析', icon: '📈', url: 'ai-analysis.html', id: 'ai-analysis' },
        { name: '任务中心', icon: '📋', url: 'task-management.html', id: 'task-center' },
        { name: '硬件智能体', icon: '🔌', url: 'hardware-agent.html', id: 'hardware-agent' },
        { name: '个人中心', icon: '👤', url: 'profile.html', id: 'profile' }
    ],
    
    // 教师端导航
    teacher: [
        { name: '教师工作台', icon: '📊', url: 'teacher-dashboard.html', id: 'teacher-dashboard' },
        { name: '课程管理', icon: '📚', url: 'course-hall.html', id: 'course-management' },
        { name: '任务管理', icon: '📋', url: 'task-management.html', id: 'task-management' },
        { name: '考试管理', icon: '📝', url: 'exam-management.html', id: 'exam-management' },
        { name: '实验大厅', icon: '🔬', url: 'experiment-hall.html', id: 'experiment-hall' },
        { name: '实验详情', icon: '🧪', url: 'experiment-detail.html', id: 'experiment-detail' },
        { name: 'AI分析中心', icon: '📈', url: 'ai-analysis.html', id: 'ai-analysis' },
        { name: 'AI学习助手', icon: '🤖', url: 'ai-assistant.html', id: 'ai-assistant' },
        { name: '个人中心', icon: '👤', url: 'profile.html', id: 'profile' }
    ]
};

// ========== 当前页面检测 ==========
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    return filename.replace('.html', '') || 'index';
}

// ========== 导航渲染函数 ==========
function renderNavigation(role = 'student') {
    const navConfig = NAV_CONFIG[role];
    const currentPage = getCurrentPage();
    
    let navHTML = '';
    
    navConfig.forEach(item => {
        const isActive = currentPage === item.id ? 'active' : '';
        navHTML += `
            <a href="${item.url}" class="sidebar-item ${isActive}" data-page="${item.id}">
                <span class="sidebar-icon">${item.icon}</span>
                ${item.name}
            </a>
        `;
    });
    
    return navHTML;
}

// ========== 顶部导航渲染 ==========
function renderTopNav(role = 'student') {
    const currentPage = getCurrentPage();
    
    const topNavItems = [
        { name: '工作台', url: role === 'teacher' ? 'teacher-dashboard.html' : 'dashboard.html' },
        { name: '课程', url: 'course-hall.html' },
        { name: '实验', url: 'experiment-hall.html' },
        { name: '考试', url: role === 'teacher' ? 'exam-management.html' : 'exam-hall.html' },
        { name: 'AI', url: 'ai-assistant.html' }
    ];
    
    let topNavHTML = '';
    
    topNavItems.forEach(item => {
        const isActive = currentPage.includes(item.url.replace('.html', '')) ? 'active' : '';
        topNavHTML += `
            <a href="${item.url}" class="nav-link ${isActive}">${item.name}</a>
        `;
    });
    
    return topNavHTML;
}

// ========== 初始化导航 ==========
function initNavigation(role = 'student') {
    // 渲染侧边栏导航
    const sidebarContainer = document.querySelector('.sidebar-menu');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = renderNavigation(role);
    }
    
    // 渲染顶部导航
    const topNavContainer = document.querySelector('.nav-menu');
    if (topNavContainer) {
        topNavContainer.innerHTML = renderTopNav(role);
    }
    
    // 添加导航点击事件
    document.querySelectorAll('.sidebar-item, .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // 如果是当前页面，阻止跳转
            if (this.classList.contains('active')) {
                e.preventDefault();
                return;
            }
            
            // 正常跳转
            const url = this.getAttribute('href');
            if (url && url !== '#') {
                window.location.href = url;
            }
        });
    });
}

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    // 从 localStorage 获取用户角色（默认学生）
    const userRole = localStorage.getItem('userRole') || 'student';
    
    // 初始化导航
    initNavigation(userRole);
    
    // 如果是登录页，不渲染导航
    if (getCurrentPage() === 'index') {
        return;
    }
});

// ========== 导出函数 ==========
window.Navigation = {
    init: initNavigation,
    config: NAV_CONFIG,
    getCurrentPage: getCurrentPage,
    renderNavigation: renderNavigation,
    renderTopNav: renderTopNav
};