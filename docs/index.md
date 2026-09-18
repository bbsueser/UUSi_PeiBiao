🎨 智慧教学平台登录页 - 视觉规范 (V1.0)
一、 项目概述
项目名称: 智慧教学与AI实验平台
核心功能: AI助手辅助学习（物联网/嵌入式/大数据/AI课程）
设计风格: 科技极简 (Tech Minimalism)
关键词: 专业、清晰、未来感、高效、智能
二、 设计语言详述
1. 色彩系统 (Color System)
/* 主色调 - 科技蓝 */
--primary-blue: #1890ff;        /* 主按钮、重点标识、链接 */
--primary-blue-hover: #40a9ff;  /* 主色悬停 */
--primary-blue-active: #096dd9; /* 主色点击 */

/* 中性色 - 背景与文字 */
--bg-body: #f8fafc;            /* 页面背景 - 浅灰白 */
--bg-card: #ffffff;             /* 卡片/登录框背景 */
--bg-header: #0f172a;           /* 顶部导航背景（深蓝黑） */
--text-title: #1e293b;          /* 标题文字 - 深灰 */
--text-body: #334155;           /* 正文文字 */
--text-secondary: #64748b;      /* 辅助/说明文字 */
--text-disabled: #94a3b8;       /* 禁用文字 */

/* 功能色 */
--success: #10b981;             /* 成功 */
--warning: #f59e0b;             /* 警告 */
--error: #ef4444;               /* 错误/失败 */
--info: #3b82f6;                /* 信息 */

/* 边框与分割线 */
--border-light: #e2e8f0;        /* 浅色边框 */
--border-base: #cbd5e1;         /* 常规边框 */
--border-dark: #94a3b8;         /* 深色边框 */
2. 字体系统 (Typography)
/* 字体族 */
font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

/* 标题 */
--h1: 600 2rem/1.3;  /* 32px - 页面主标题 */
--h2: 600 1.5rem/1.4; /* 24px - 区块标题 */
--h3: 600 1.25rem/1.4; /* 20px - 卡片标题 */

/* 正文 */
--text-lg: 400 1.125rem/1.7;  /* 18px - 大正文 */
--text-base: 400 1rem/1.6;    /* 16px - 基础正文（默认） */
--text-sm: 400 0.875rem/1.6;  /* 14px - 小正文/说明 */
--text-xs: 400 0.75rem/1.6;   /* 12px - 极小文字 */

/* 特殊 */
--code-font: "SF Mono", "Monaco", "Consolas", "Courier New", monospace;
3. 间距系统 (Spacing) - 基于 8px 基准
--space-0: 0;     /* 0px */
--space-1: 0.5rem;  /* 8px */
--space-2: 1rem;    /* 16px */
--space-3: 1.5rem;  /* 24px */
--space-4: 2rem;    /* 32px */
--space-5: 3rem;    /* 48px */
--space-6: 4rem;    /* 64px */
4. 圆角与阴影 (Border & Shadow)
/* 圆角 */
--radius-sm: 4px;   /* 小按钮、标签 */
--radius-base: 8px; /* 卡片、输入框、按钮（默认） */
--radius-lg: 12px;  /* 大卡片、模态框 */
--radius-full: 9999px; /* 圆形 */

/* 阴影 */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 12px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
--shadow-card: 0 4px 12px rgba(0, 0, 0, 0.05);
--shadow-input-focus: 0 0 0 3px rgba(24, 144, 255, 0.1);
三、 布局与结构
1. 页面布局 (两栏响应式)
左侧区域 (占 60%)：
- 背景：深蓝渐变 (#0f172a → #1e293b) 或抽象科技感图形
- 内容：品牌Logo + 宣传语 + 科技感装饰元素
- 移动端：隐藏或变为顶部横幅

右侧区域 (占 40%)：
- 背景：var(--bg-body)
- 内容：登录卡片（居中对齐，最大宽度 400px）
- 移动端：宽度 100%，适当内边距
2. 登录卡片结构
<!-- 卡片容器 -->
<div class="login-card">
  <!-- 标题区 -->
  <h1>智慧教学与AI实验平台</h1>
  <p class="subtitle">赋能物联网、嵌入式与人工智能的学习与实践</p>
  
  <!-- 表单区 -->
  <form>
    <!-- 用户名输入 -->
    <div class="input-group">
      <input type="text" placeholder="学号/工号/邮箱">
    </div>
    
    <!-- 密码输入 -->
    <div class="input-group">
      <input type="password" placeholder="密码">
    </div>
    
    <!-- 辅助选项 -->
    <div class="form-options">
      <label><input type="checkbox"> 记住我</label>
      <a href="#">忘记密码？</a>
    </div>
    
    <!-- 登录按钮 -->
    <button class="btn-primary">登录</button>
    
    <!-- 第三方登录 -->
    <div class="divider">或通过以下方式登录</div>
    <div class="social-login">
      <button class="btn-outline">微信</button>
      <button class="btn-outline">企业微信</button>
    </div>
    
    <!-- 注册引导 -->
    <div class="register-hint">
      没有账号？<a href="#">立即注册</a>
    </div>
  </form>
  
  <!-- AI助手提示 -->
  <div class="ai-hint">
    <span class="ai-icon">🤖</span>
    <span>登录后体验AI编程助手</span>
  </div>
</div>
四、 组件样式规范
1. 输入框 (Input)
.input-group {
  margin-bottom: var(--space-3);
}

.input-group input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-base);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  background: var(--bg-card);
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: var(--shadow-input-focus);
}

.input-group input::placeholder {
  color: var(--text-secondary);
}
2. 按钮 (Buttons)
/* 主按钮 */
.btn-primary {
  width: 100%;
  padding: var(--space-2) var(--space-4);
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: var(--radius-base);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-blue-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-base);
}

.btn-primary:active {
  background: var(--primary-blue-active);
  transform: translateY(0);
}

/* 次要按钮 */
.btn-outline {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px solid var(--border-base);
  border-radius: var(--radius-base);
  color: var(--text-body);
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-outline:hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}
3. 分割线 (Divider)
.divider {
  display: flex;
  align-items: center;
  margin: var(--space-4) 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-light);
  margin: 0 var(--space-2);
}
五、 动效与交互
1. 转场动画
/* 页面加载 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeInUp 0.6s ease-out;
}
2. 悬停效果
/* 卡片悬停 */
.login-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
3. AI助手提示
.ai-hint {
  margin-top: var(--space-4);
  padding: var(--space-2);
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: var(--radius-base);
  border-left: 4px solid var(--primary-blue);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-body);
}

.ai-icon {
  font-size: 1.25rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
六、 响应式断点
/* 移动端优先 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
七、 图标与图形建议
左侧区域背景：抽象数据流、电路板纹理、神经网络节点图
品牌Logo：简洁几何图形 + 品牌名称
AI助手图标：🤖 或 自定义简约机器人图标
第三方登录图标：使用官方品牌图标，保持原色
八、 可访问性 (A11y) 要求
所有交互元素必须有 :focus状态
颜色对比度 ≥ 4.5:1
支持键盘导航 (Tab 键顺序)
图片必须有 alt描述
表单字段必须有 label或 aria-label
九、 交付物清单
[ ] 设计变量文件 (variables.css)
[ ] 登录页HTML结构
[ ] 主样式文件 (login.css)
[ ] 响应式样式
[ ] 交互脚本 (login.js)
[ ] 图片/图标资源
[ ] 暗色模式方案 (可选)
[ ] 组件库集成说明
🎯 使用说明
将此提示词保存在项目根目录 /docs/design-spec.md
在IDE中创建CSS变量文件，导入到全局样式
按照"组件样式规范"逐块实现
完成后运行无障碍检查工具（如axe DevTools）
需要我生成具体的HTML/CSS/JS代码文件吗？我可以提供完整的、可运行的登录页代码。