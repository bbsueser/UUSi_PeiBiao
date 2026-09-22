/**
 * 智慧教学平台 - 导航激活脚本
 * 自动激活当前页面的导航项
 */

// ========== 页面导航映射 ==========
const PAGE_NAV_MAP = {
    'index': null, // 登录页不需要导航
    'dashboard': 'nav-dashboard',
    'teacher-dashboard': 'nav-teacher-dashboard',
    'course-hall': 'nav-course-hall',
    'course-hall.html': 'nav-course-hall',
    'experiment-hall': 'nav-experiment-hall',
    'experiment-hall.html': 'nav-experiment-hall',
    'experiment-detail': 'nav-experiment-detail',
    'experiment-detail.html': 'nav-experiment-detail',
    'exam-hall': 'nav-exam-hall',
    'exam-hall.html': 'nav-exam-hall',
    'exam-management': 'nav-exam-management',
    'exam-management.html': 'nav-exam-management',
    'ai-assistant': 'nav-ai-assistant',
    'ai-assistant.html': 'nav-ai-assistant',
    'ai-analysis': 'nav-ai-analysis',
    'ai-analysis.html': 'nav-ai-analysis',
    'task-management': 'nav-task-management',
    'task-management.html': 'nav-task-management',
    'hardware-agent': 'nav-hardware-agent',
    'hardware-agent.html': 'nav-hardware-agent',
    'profile': 'nav-profile',
    'profile.html': 'nav-profile',
    'course-detail': 'nav-course-hall',
    'course-detail.html': 'nav-course-hall',
    'engineering-simulation.html': 'nav-experiment-hall',
    'industry-cloud.html': 'nav-experiment-hall',
    '2d-designer.html': 'nav-experiment-hall',
    '3d-designer.html': 'nav-experiment-hall',
    '3d-designer-enhanced.html': 'nav-experiment-hall',
    'embedded-sim.html': 'nav-experiment-hall',
    'jupyter-lab.html': 'nav-experiment-hall',
    'blockchain-lab.html': 'nav-experiment-hall',
    'blockchain-dev.html': 'nav-experiment-hall'
};

// ========== 自动激活导航项 ==========
function activateNavigation() {
    // 获取当前页面名称
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 获取对应的导航项ID
    const navItemId = PAGE_NAV_MAP[currentPage];
    
    if (!navItemId) {
        // 登录页或其他特殊页面，不需要激活导航
        return;
    }
    
    // 查找并激活导航项
    const navItem = document.getElementById(navItemId);
    if (navItem) {
        // 移除所有导航项的激活状态
        document.querySelectorAll('.sidebar-item, .sidebar-menu a, .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 激活当前导航项
        navItem.classList.add('active');
        
    }
}

// ========== 页面加载完成后执行 ==========
document.addEventListener('DOMContentLoaded', function() {
    activateNavigation();
    
    // 添加导航项点击事件
    document.querySelectorAll('.sidebar-item, .sidebar-menu a, .nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // 如果已经是激活状态，阻止跳转
            if (this.classList.contains('active')) {
                e.preventDefault();
                console.log('当前页面，无需跳转');
                return;
            }
            
            // 显示加载提示
            const loadingTip = document.createElement('div');
            loadingTip.className = 'page-loading-tip';
            loadingTip.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                            background: rgba(71, 85, 105, 0.9); color: white; padding: 20px 40px; 
                            border-radius: 12px; font-size: 16px; z-index: 9999;">
                    正在跳转...
                </div>
            `;
            document.body.appendChild(loadingTip);
            
            // 300ms后移除提示（页面应该已经跳转）
            setTimeout(() => {
                if (loadingTip.parentNode) {
                    loadingTip.remove();
                }
            }, 300);
        });
    });
});

// ========== 导出函数 ==========
window.activateNavigation = activateNavigation;
