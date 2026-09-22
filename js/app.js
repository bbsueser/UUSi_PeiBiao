/**
 * 智慧教学与AI实验平台 - 主应用脚本
 * 包含：登录逻辑、表单验证、第三方登录、通知提示、角色选择等
 */

// ========== 全局变量 - 当前选中角色 ==========
let currentRole = 'student';

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const isLoginPage = currentFile === 'index.html' || currentFile === '';

    if (isLoginPage) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        initFormValidation();
        loadRememberedUser();
        initRoleSelector();

        const defaultRole = document.querySelector('.role-option[data-role="student"]');
        if (defaultRole) {
            defaultRole.classList.add('selected');
            currentRole = 'student';
        }
    }
});

// ========== 角色选择初始化 ==========
function initRoleSelector() {
    const roleOptions = document.querySelectorAll('.role-option');
    
    roleOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            selectRole(this);
        });
    });
}

// ========== 选择角色 ==========
function selectRole(element) {
    console.log('选择角色:', element.dataset.role);  // 调试日志
    
    // 移除所有选中状态
    document.querySelectorAll('.role-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // 添加选中状态
    element.classList.add('selected');
    
    // 更新当前角色
    currentRole = element.dataset.role;
    
    // 更新用户名placeholder
    const usernameInput = document.querySelector('input[name="username"]');
    if (usernameInput) {
        const placeholders = {
            'student': '学号/邮箱',
            'teacher': '工号/邮箱',
            'admin': '管理员账号/邮箱'
        };
        usernameInput.placeholder = placeholders[currentRole];
    }
    
    // 显示选中提示
    const roleNames = {
        'student': '学生',
        'teacher': '教师',
        'admin': '管理员'
    };
    showNotification(`已选择${roleNames[currentRole]}角色`, 'info');
}

// ========== 登录处理函数 ==========
function handleLogin(event) {
    // 阻止表单默认提交行为
    event.preventDefault();
    
    // 获取表单数据
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    const rememberMe = formData.get('remember');
    
    // 前端验证
    if (!username || !password) {
        showNotification('请输入用户名和密码', 'warning');
        return;
    }
    
    // 用户名格式验证
    if (!validateUsername(username)) {
        showNotification('请输入有效的学号、工号或邮箱', 'error');
        return;
    }
    
    // 记住我功能
    if (rememberMe) {
        saveUserCredentials(username);
    } else {
        clearUserCredentials();
    }
    
    // 保存角色信息
    localStorage.setItem('userRole', currentRole);
    localStorage.setItem('userName', currentRole === 'student' ? '魏同学' : (currentRole === 'teacher' ? '王老师' : '管理员'));
    
    // 模拟登录成功
    const roleNames = {
        'student': '学生',
        'teacher': '教师',
        'admin': '管理员'
    };
    showNotification(`${roleNames[currentRole]}登录成功，正在跳转...`, 'success');
    
    // 根据角色跳转到不同页面
    setTimeout(function() {
        const dashboards = {
            'student': 'dashboard.html',
            'teacher': 'teacher-dashboard.html',
            'admin': 'admin-dashboard.html'
        };
        window.location.href = dashboards[currentRole];
    }, 1000);
}

// ========== 用户名验证 ==========
function validateUsername(username) {
    // 学号/工号：数字，至少6位
    const idPattern = /^\d{6,}$/;
    
    // 邮箱：标准邮箱格式
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return idPattern.test(username) || emailPattern.test(username);
}

// ========== 记住我功能 ==========
function saveUserCredentials(username) {
    try {
        localStorage.setItem('rememberedUser', username);
        localStorage.setItem('rememberMeChecked', 'true');
    } catch (e) {
        console.warn('无法保存用户信息:', e);
    }
}

function loadRememberedUser() {
    try {
        const rememberedUser = localStorage.getItem('rememberedUser');
        const rememberMeChecked = localStorage.getItem('rememberMeChecked');
        
        if (rememberedUser && rememberMeChecked === 'true') {
            const usernameInput = document.querySelector('input[name="username"]');
            const rememberCheckbox = document.getElementById('rememberMe');
            
            if (usernameInput) {
                usernameInput.value = rememberedUser;
            }
            
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    } catch (e) {
        console.warn('无法加载用户信息:', e);
    }
}

function clearUserCredentials() {
    try {
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('rememberMeChecked');
    } catch (e) {
        console.warn('无法清除用户信息:', e);
    }
}

// ========== 第三方登录 ==========
function socialLogin(platform) {
    const platformNames = {
        'wechat': '微信',
        'work_wechat': '企业微信'
    };
    
    showNotification(`正在跳转到${platformNames[platform]}登录...`, 'info');
    
    // 模拟第三方登录流程
    setTimeout(function() {
        showNotification(`${platformNames[platform]}登录功能开发中，敬请期待`, 'warning');
    }, 1500);
}

// ========== 忘记密码 ==========
function showForgotPassword() {
    showNotification('忘记密码功能开发中，请联系管理员', 'info');
}

// ========== 注册引导 ==========
function showRegister() {
    showNotification('注册功能开发中，请联系管理员获取账号', 'info');
}

// ========== 表单验证初始化 ==========
function initFormValidation() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // 添加实时验证反馈
        const inputs = loginForm.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // 清除错误状态
                this.style.borderColor = '';
            });
        });
    }
}

// ========== 单字段验证 ==========
function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        field.style.borderColor = '#ef4444';
        showNotification('请填写所有必填项', 'warning');
        return false;
    }
    
    // 用户名特殊验证
    if (field.name === 'username' && value && !validateUsername(value)) {
        field.style.borderColor = '#ef4444';
        showNotification('请输入有效的学号、工号或邮箱', 'error');
        return false;
    }
    
    return true;
}

// ========== 通知提示系统 ==========
function showNotification(message, type = 'info') {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
    `;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        padding: '14px 22px',
        borderRadius: '8px',
        backgroundColor: getNotificationColor(type),
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: 'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: '10000',
        transform: 'translateX(120%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '400px'
    });
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 动画显示
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // 自动消失
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 350);
    }, 3000);
}

// ========== 获取通知图标 ==========
function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// ========== 获取通知颜色 ==========
function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#1890ff'
    };
    return colors[type] || colors.info;
}

// ========== 工具函数：退出登录 ==========
function logout() {
    if (confirm('确定要退出登录吗？')) {
        clearUserCredentials();
        window.location.href = 'index.html';
    }
}

// ========== 工具函数：格式化日期 ==========
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
