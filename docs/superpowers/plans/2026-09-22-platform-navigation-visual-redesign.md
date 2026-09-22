# 人工智能算法训练平台页面串联与视觉统一 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留现有静态页面功能和 Mock 交互的前提下，打通课程、考试、实验及专业工作台页面，并统一为“人工智能算法训练平台”的蓝青色专业视觉系统。

**Architecture:** 保持静态多页面结构，新增共享 `platform-shell.js` 和 `platform-theme.css`，通过页面元数据渲染统一品牌、角色导航、面包屑与专业工作台返回入口。页面自身的功能脚本保持原位；课程和实验只增加最小跳转逻辑，所有验收由无第三方依赖的 PowerShell 静态审计脚本固定。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、PowerShell 7、Git

**Spec:** `docs/superpowers/specs/2026-09-22-platform-navigation-visual-redesign-design.md`

## Global Constraints

- 品牌名称固定为“人工智能算法训练平台”。
- 保留蓝青色主色体系；深蓝灰用于框架，青蓝色用于选中状态、主操作和关键数据。
- 不引入前端框架、构建工具、包管理依赖或后端接口。
- 不删除、不重写现有按钮、弹窗、画布、图表、Mock 数据和专业工作台功能。
- 正式导航和品牌区域使用统一线性 SVG 图标，不使用 Emoji。
- `color-preview.html` 与 `navigation-template.html` 不进入正式产品导航。
- 旧版 `3d-designer.html` 保留，正式入口使用 `3d-designer-enhanced.html`。
- 当前已有用户修改的 `dashboard.html`、`engineering-simulation.html`、`hardware-agent.html` 不得被覆盖；修改前后都要检查其差异。
- 当前未跟踪的 `images/camera-preview.mp4` 与 `images/camera-snapshot.jpg` 不得删除、移动或加入无关提交。
- 修改过的既有脏文件不得整文件暂存；若无法可靠分离本次改动，则保持未提交并在交付时明确说明。

## Review Focus

- 直接打开专业工作台且没有 `userRole`：页面仍显示品牌和返回入口，默认返回实验详情。
- `localStorage` 中出现未知角色字符串：导航回退到学生菜单，不抛出异常或清空用户数据。
- 实验详情选择尚无独立页面的环境：继续显示演示提示，不跳转到缺失文件。
- 页面已存在不同结构的 `.top-nav`、`.sidebar-menu` 或全屏画布：共享壳层不应重复注入或破坏工作区尺寸。
- CDN 图表或 Three.js 加载失败：本地壳层、链接和返回按钮仍可使用。

---

## File Map

### 新增

- `css/platform-theme.css`：共享品牌、导航、面包屑、通知和专业工作台壳层样式。
- `js/platform-shell.js`：页面配置、角色导航、SVG 图标、品牌归一化、标准页与工作台壳层渲染。
- `tests/verify-platform.ps1`：无外部依赖的静态链接、品牌、脚本接入、路由映射和角色状态检查。

### 修改：共享逻辑

- `js/app.js`：仅在登录页初始化时清理当前角色；退出时仍清理登录状态。
- `js/navigation.js`：复用统一品牌和页面命名，修正现有活动项 ID；保留兼容导出。
- `js/navigation-activate.js`：补齐课程详情和专业页面映射，移除内联颜色覆盖。
- `css/common.css`：与新主题变量对齐，避免旧品牌区域覆盖新壳层。

### 修改：标准业务页

- `index.html`
- `dashboard.html`
- `teacher-dashboard.html`
- `admin-dashboard.html`
- `course-hall.html`
- `course-detail.html`
- `task-management.html`
- `exam-hall.html`
- `exam-management.html`
- `exam-anti-cheat.html`
- `experiment-hall.html`
- `experiment-detail.html`
- `ai-assistant.html`
- `ai-analysis.html`
- `hardware-agent.html`
- `profile.html`

这些页面接入共享主题与壳层，设置 `data-platform-page`，统一 `<title>` 与品牌文案；页面内部功能不重构。

### 修改：专业工作台

- `engineering-simulation.html`
- `industry-cloud.html`
- `2d-designer.html`
- `3d-designer.html`
- `3d-designer-enhanced.html`
- `embedded-sim.html`
- `jupyter-lab.html`
- `blockchain-lab.html`
- `blockchain-dev.html`

这些页面接入紧凑工作台壳层并提供返回路径；内部编辑器、画布和面板结构保持不变。

---

### Task 1: 建立静态验收脚本

**Files:**
- Create: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: 仓库根目录下的 `.html`、`css/platform-theme.css`、`js/platform-shell.js`、`js/app.js`。
- Produces: `tests/verify-platform.ps1`，退出码 `0` 表示全部通过，非零表示至少一项验收失败。

- [ ] **Step 1: 编写最小失败检查器**

创建脚本，先固定正式页面列表和断言函数：

```powershell
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { $failures.Add($Message) }
}

$businessPages = @(
    'index.html', 'dashboard.html', 'teacher-dashboard.html',
    'admin-dashboard.html', 'course-hall.html', 'course-detail.html',
    'task-management.html', 'exam-hall.html', 'exam-management.html',
    'exam-anti-cheat.html', 'experiment-hall.html', 'experiment-detail.html',
    'ai-assistant.html', 'ai-analysis.html', 'hardware-agent.html',
    'profile.html', 'engineering-simulation.html', 'industry-cloud.html',
    '2d-designer.html', '3d-designer.html', '3d-designer-enhanced.html',
    'embedded-sim.html', 'jupyter-lab.html', 'blockchain-lab.html',
    'blockchain-dev.html'
)

foreach ($page in $businessPages) {
    Assert-True (Test-Path -LiteralPath (Join-Path $repoRoot $page)) "缺少业务页面: $page"
}
```

继续加入以下具体检查：

```powershell
$expectedRoutes = @{
    'virtual-sim'   = 'engineering-simulation.html'
    '3d-designer'   = '3d-designer-enhanced.html'
    'industry-cloud'= 'industry-cloud.html'
    '2d-designer'   = '2d-designer.html'
    'jupyter'       = 'jupyter-lab.html'
    'blockchain'    = 'blockchain-lab.html'
    'embedded'      = 'embedded-sim.html'
}

$missingTargets = [System.Collections.Generic.List[string]]::new()
foreach ($page in Get-ChildItem -LiteralPath $repoRoot -Filter '*.html') {
    $html = Get-Content -Raw -LiteralPath $page.FullName
    foreach ($match in [regex]::Matches($html, '(?:href|action)\s*=\s*["'']([^"''#?]+\.html)')) {
        $target = Join-Path $repoRoot ([IO.Path]::GetFileName($match.Groups[1].Value))
        if (-not (Test-Path -LiteralPath $target)) {
            $missingTargets.Add("$($page.Name) -> $($match.Groups[1].Value)")
        }
    }
}
Assert-True ($missingTargets.Count -eq 0) ("存在缺失链接: " + ($missingTargets -join ', '))

$shellPath = Join-Path $repoRoot 'js/platform-shell.js'
$themePath = Join-Path $repoRoot 'css/platform-theme.css'
Assert-True (Test-Path -LiteralPath $shellPath) '缺少 js/platform-shell.js'
Assert-True (Test-Path -LiteralPath $themePath) '缺少 css/platform-theme.css'

foreach ($page in $businessPages) {
    $html = Get-Content -Raw -LiteralPath (Join-Path $repoRoot $page)
    Assert-True ($html -match '人工智能算法训练平台') "$page 未统一品牌名"
    Assert-True ($html -match 'css/platform-theme\.css') "$page 未接入共享主题"
    if ($page -ne 'index.html') {
        Assert-True ($html -match 'js/platform-shell\.js') "$page 未接入共享壳层"
        Assert-True ($html -match 'data-platform-page=') "$page 缺少页面元数据"
    }
}

$shell = if (Test-Path -LiteralPath $shellPath) { Get-Content -Raw -LiteralPath $shellPath } else { '' }
foreach ($pair in $expectedRoutes.GetEnumerator()) {
    Assert-True ($shell -match [regex]::Escape("'$($pair.Key)': '$($pair.Value)'")) "实验路由缺失: $($pair.Key)"
}

$appJs = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'js/app.js')
Assert-True ($appJs -match "isLoginPage") 'app.js 尚未限制登录页状态清理'

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ -ErrorAction Continue }
    exit 1
}
Write-Host 'Platform verification passed.'
```

- [ ] **Step 2: 运行脚本并确认失败**

Run:

```powershell
pwsh -NoProfile -File tests/verify-platform.ps1
```

Expected: FAIL，至少报告缺少 `js/platform-shell.js`、`css/platform-theme.css`、旧品牌或缺失链接。

- [ ] **Step 3: 提交验收脚本**

```powershell
git add -- tests/verify-platform.ps1
git commit -m "test: add platform integration audit"
```

---

### Task 2: 实现共享页面配置与 SVG 图标系统

**Files:**
- Create: `js/platform-shell.js`
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: `<body data-platform-page="..." data-platform-shell="standard|workspace">`、`localStorage.userRole`。
- Produces: `window.PlatformShell.init()`、`window.PlatformShell.icon(name)`、`window.PlatformShell.showNotice(message, type)`、`window.PlatformShell.experimentRoutes`。

- [ ] **Step 1: 扩展失败测试以固定共享接口**

在 `tests/verify-platform.ps1` 加入：

```powershell
foreach ($signature in @(
    'window.PlatformShell',
    'function initPlatformShell',
    'function iconSvg',
    'function showPlatformNotice',
    "const PLATFORM_NAME = '人工智能算法训练平台'"
)) {
    Assert-True ($shell -match [regex]::Escape($signature)) "共享壳层缺少接口: $signature"
}
```

- [ ] **Step 2: 运行测试并确认接口检查失败**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: FAIL with `共享壳层缺少接口`。

- [ ] **Step 3: 创建 `js/platform-shell.js`**

实现以下固定结构：

```javascript
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
```

- [ ] **Step 4: 运行接口测试**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 共享接口检查通过；整体测试仍因主题和页面尚未接入而失败。

- [ ] **Step 5: 提交共享脚本骨架**

```powershell
git add -- js/platform-shell.js tests/verify-platform.ps1
git commit -m "feat: add shared platform shell configuration"
```

---

### Task 3: 实现统一主题和两类壳层

**Files:**
- Create: `css/platform-theme.css`
- Modify: `js/platform-shell.js`
- Modify: `css/common.css`
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: `data-platform-shell="standard|workspace"`、现有 `.nav-brand`、`.nav-brand-text`、`.top-nav`。
- Produces: `.platform-brand-mark`、`.platform-workspace-bar`、`.platform-breadcrumbs`、`.platform-back-link`、`.platform-notice`。

- [ ] **Step 1: 添加壳层样式断言**

在测试中读取 `$theme` 并断言：

```powershell
$theme = if (Test-Path -LiteralPath $themePath) { Get-Content -Raw -LiteralPath $themePath } else { '' }
foreach ($selector in @(
    '.platform-brand-mark',
    '.platform-workspace-bar',
    '.platform-breadcrumbs',
    '.platform-back-link',
    '.platform-notice'
)) {
    Assert-True ($theme -match [regex]::Escape($selector)) "共享主题缺少选择器: $selector"
}
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: FAIL with `共享主题缺少选择器`。

- [ ] **Step 3: 创建 `css/platform-theme.css`**

定义明确的主题变量与壳层组件：

```css
:root {
    --platform-navy-950: #071521;
    --platform-navy-900: #0c2233;
    --platform-navy-800: #13364c;
    --platform-cyan-600: #0785a8;
    --platform-cyan-500: #0aa7c8;
    --platform-cyan-100: #dff6fb;
    --platform-surface: #ffffff;
    --platform-canvas: #f3f7f9;
    --platform-border: #d7e1e7;
    --platform-text: #173042;
    --platform-muted: #607583;
    --platform-radius: 6px;
    --platform-shadow: 0 4px 16px rgba(7, 31, 45, 0.08);
}

.platform-brand-mark {
    width: 34px;
    height: 34px;
    display: inline-grid;
    place-items: center;
    color: #fff;
    background: var(--platform-cyan-600);
    border-radius: 5px;
}

.platform-brand-mark svg,
.platform-icon svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.platform-brand-mark svg {
    fill: currentColor;
    stroke: none;
}

.platform-workspace-bar {
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    color: #eaf8fb;
    background: var(--platform-navy-950);
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    position: relative;
    z-index: 500;
}

.platform-breadcrumbs { color: #8fb2c0; font-size: 13px; }
.platform-back-link { margin-left: auto; color: #d8f4f8; text-decoration: none; }
.platform-back-link:hover { color: #fff; }

.platform-notice {
    position: fixed;
    right: 20px;
    top: 20px;
    z-index: 10000;
    padding: 11px 16px;
    color: #fff;
    background: var(--platform-navy-800);
    border-left: 3px solid var(--platform-cyan-500);
    border-radius: var(--platform-radius);
    box-shadow: var(--platform-shadow);
    opacity: 0;
    transform: translateY(-6px);
    transition: opacity .18s ease, transform .18s ease;
}
.platform-notice.is-visible { opacity: 1; transform: translateY(0); }
```

补齐无障碍焦点、窄屏折行、标准导航低阴影和 `prefers-reduced-motion` 规则。不得给页面全局添加大面积渐变或发光效果。

- [ ] **Step 4: 在共享脚本实现标准页品牌归一化和工作台栏**

增加 `normalizeExistingBrand()` 和 `renderWorkspaceBar()`：

```javascript
function normalizeExistingBrand() {
    document.querySelectorAll('.nav-brand').forEach((brand) => {
        brand.innerHTML = `<span class="platform-brand-mark">${iconSvg('brand')}</span><span class="nav-brand-text">${PLATFORM_NAME}</span>`;
    });
}

function renderWorkspaceBar(pageId) {
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
```

在 `initPlatformShell()` 中根据 `document.body.dataset.platformShell` 调用，并在标准页统一品牌、在工作台页插入紧凑栏。

- [ ] **Step 5: 对齐 `css/common.css` 的品牌区域**

只追加兼容规则，使 `.nav-brand-icon` 不再显示渐变 Emoji 容器，并让 `.platform-brand-mark` 接管 Logo。不要更改其余业务组件。

- [ ] **Step 6: 运行测试**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 主题和壳层组件检查通过；页面接入检查仍失败。

- [ ] **Step 7: 提交共享主题**

```powershell
git add -- css/platform-theme.css css/common.css js/platform-shell.js tests/verify-platform.ps1
git commit -m "feat: add unified platform theme and shell"
```

---

### Task 4: 修复登录角色状态与统一导航配置

**Files:**
- Modify: `js/app.js`
- Modify: `js/navigation.js`
- Modify: `js/navigation-activate.js`
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: `window.location.pathname`、`localStorage.userRole`、`PlatformShell.icon()`。
- Produces: 仅登录页清理角色状态；普通页保留角色；导航活动项按文件名匹配。

- [ ] **Step 1: 固定角色状态测试**

追加检查：

```powershell
Assert-True ($appJs -match "const isLoginPage = .*index\.html") '缺少登录页判断'
Assert-True ($appJs -match 'if \(isLoginPage\)') '角色清理未受登录页条件保护'
Assert-True ($appJs -match "localStorage\.removeItem\('userRole'\)") '退出流程必须能清理角色'
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: FAIL with `缺少登录页判断`。

- [ ] **Step 3: 修改 `js/app.js`**

将初始化改为：

```javascript
document.addEventListener('DOMContentLoaded', function () {
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
```

保留 `handleLogin()`、`logout()` 和记住用户功能。普通页面缺少登录表单时不再执行登录初始化。

- [ ] **Step 4: 修正导航配置**

在 `navigation.js` 中将活动项 ID 与真实文件名统一：`task-management`、`course-hall`、`experiment-hall` 等。图标字段改为图标名称，渲染时调用 `window.PlatformShell?.icon(item.icon)`，无共享脚本时回退为空字符串。

在 `navigation-activate.js` 中补充 `course-detail` 映射到课程、所有专业工具映射到实验，并删除 `navItem.style.background/color/fontWeight` 的内联样式覆盖。

- [ ] **Step 5: 运行测试**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 角色检查通过。

- [ ] **Step 6: 提交角色与导航逻辑**

```powershell
git add -- js/app.js js/navigation.js js/navigation-activate.js tests/verify-platform.ps1
git commit -m "fix: preserve role state across platform pages"
```

---

### Task 5: 接入登录页和标准业务页品牌壳层

**Files:**
- Modify: `index.html`
- Modify: `dashboard.html`
- Modify: `teacher-dashboard.html`
- Modify: `admin-dashboard.html`
- Modify: `course-hall.html`
- Modify: `course-detail.html`
- Modify: `task-management.html`
- Modify: `exam-hall.html`
- Modify: `exam-management.html`
- Modify: `exam-anti-cheat.html`
- Modify: `experiment-hall.html`
- Modify: `experiment-detail.html`
- Modify: `ai-assistant.html`
- Modify: `ai-analysis.html`
- Modify: `hardware-agent.html`
- Modify: `profile.html`
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: `css/platform-theme.css`、`js/platform-shell.js`、页面 ID。
- Produces: 每个正式标准页的统一 `<title>`、共享主题引用、`data-platform-page` 和 `data-platform-shell="standard"`。

- [ ] **Step 1: 扩展标准页元数据检查**

在测试中为每页验证唯一脚本引用：

```powershell
$shellRefs = ([regex]::Matches($html, 'js/platform-shell\.js')).Count
if ($page -ne 'index.html') {
    Assert-True ($shellRefs -eq 1) "$page 的共享壳层引用次数不是 1"
    Assert-True ($html -match 'data-platform-shell="standard"|data-platform-shell="workspace"') "$page 未声明壳层类型"
}
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 多个页面报告未接入主题、脚本和页面元数据。

- [ ] **Step 3: 更新登录页**

在 `index.html`：

- `<title>` 改为 `登录 - 人工智能算法训练平台`。
- 在 `css/login.css` 后引入 `css/platform-theme.css`。
- 品牌名称改为“人工智能算法训练平台”。
- 现有字母 `E` Logo 改为 `.platform-brand-mark` 内联几何 AI SVG。
- 登录页不加载 `platform-shell.js`，避免渲染已登录导航。

- [ ] **Step 4: 更新 15 个标准业务页**

逐页执行相同的最小接入：

```html
<link rel="stylesheet" href="css/platform-theme.css">
...
<body data-platform-page="dashboard" data-platform-shell="standard">
...
<script src="js/platform-shell.js"></script>
```

页面 ID 使用文件名去掉 `.html`。`<title>` 格式统一为“页面名称 - 人工智能算法训练平台”。删除标题和品牌文字前的装饰性 Emoji，但不清除业务卡片中的语义图标。

对 `dashboard.html`、`hardware-agent.html` 只使用小范围补丁；修改前运行 `git diff -- <file>`，修改后再次运行并确认原有差异仍在。不得使用整文件格式化。

- [ ] **Step 5: 运行标准页检查**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 标准页品牌、主题与脚本接入检查通过；专业工作台仍未全部通过。

- [ ] **Step 6: 提交安全文件并保护脏文件**

先确认：

```powershell
git status --short
git diff -- dashboard.html hardware-agent.html
```

暂存除 `dashboard.html`、`hardware-agent.html` 外的本任务文件并提交：

```powershell
git add -- index.html teacher-dashboard.html admin-dashboard.html course-hall.html course-detail.html task-management.html exam-hall.html exam-management.html exam-anti-cheat.html experiment-hall.html experiment-detail.html ai-assistant.html ai-analysis.html profile.html tests/verify-platform.ps1
git commit -m "feat: apply unified brand to core pages"
```

`dashboard.html` 与 `hardware-agent.html` 保持未提交，除非能用交互式暂存只选择本任务新增行。

---

### Task 6: 打通课程、实验和管理员流程

**Files:**
- Modify: `course-hall.html`
- Modify: `course-detail.html`
- Modify: `experiment-hall.html`
- Modify: `experiment-detail.html`
- Modify: `blockchain-lab.html`
- Modify: `admin-dashboard.html`
- Modify: `js/platform-shell.js`
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: `PlatformShell.experimentRoutes`、课程卡片、实验卡片的 `data-env`。
- Produces: `openCourseDetail()`、`launchSelectedExperiment()`、`openBlockchainDev()`、`data-platform-notice` 演示入口。

- [ ] **Step 1: 添加流程断言**

```powershell
$courseHall = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'course-hall.html')
$experimentDetail = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'experiment-detail.html')
$adminDashboard = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'admin-dashboard.html')
$blockchainLab = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'blockchain-lab.html')

Assert-True ($courseHall -match 'course-detail\.html') '课程大厅不能进入课程详情'
Assert-True ($experimentDetail -match 'launchSelectedExperiment') '实验详情缺少启动路由'
Assert-True ($blockchainLab -match 'blockchain-dev\.html') '区块链仿真不能进入开发环境'
Assert-True ($adminDashboard -notmatch 'href="(?:user-management|system-settings)\.html"') '管理员页面仍含死链'
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 上述四项至少一项失败。

- [ ] **Step 3: 打通课程流程**

为课程卡片增加 `data-course-id`，为“开始学习/继续学习”按钮添加真实链接，卡片键盘激活调用：

```javascript
function openCourseDetail(courseId) {
    const target = `course-detail.html?course=${encodeURIComponent(courseId)}`;
    window.location.href = target;
}
```

按钮使用 `<a href="course-detail.html?course=..." class="course-action">`，阻止卡片与按钮重复触发。课程详情页增加返回 `course-hall.html` 的面包屑。

- [ ] **Step 4: 打通实验启动流程**

用以下逻辑替换只显示通知的 `startExperiment()`：

```javascript
function launchSelectedExperiment() {
    const selected = document.querySelector('.env-card.active');
    const env = selected?.dataset.env;
    const route = window.PlatformShell?.experimentRoutes?.[env];
    if (route) {
        window.location.href = route;
        return;
    }
    const name = selected?.querySelector('.env-card-title')?.textContent?.trim() || '该实验环境';
    window.PlatformShell?.showNotice(`${name}当前为演示入口，暂未配置独立页面`, 'info');
}

function startExperiment() {
    launchSelectedExperiment();
}
```

实验大厅正式的 3D 入口改为增强版，并确保“查看详情/开始实验”先进入 `experiment-detail.html`。

- [ ] **Step 5: 连接区块链开发环境**

在 `blockchain-lab.html` 的实验导航或工具区加入：

```html
<a class="platform-tool-link" href="blockchain-dev.html">打开智能合约开发环境</a>
```

- [ ] **Step 6: 消除管理员死链**

把 `user-management.html`、`system-settings.html` 链接改为按钮或 `href="#" data-platform-notice="演示模块暂未开放"`。在 `platform-shell.js` 委托监听 `[data-platform-notice]`，阻止默认跳转并调用 `showPlatformNotice()`。

- [ ] **Step 7: 运行流程测试**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 课程、实验、区块链和管理员流程检查全部通过。

- [ ] **Step 8: 提交流程改造**

```powershell
git add -- course-hall.html course-detail.html experiment-hall.html experiment-detail.html blockchain-lab.html admin-dashboard.html js/platform-shell.js tests/verify-platform.ps1
git commit -m "feat: connect course and experiment journeys"
```

---

### Task 7: 接入所有专业工作台与返回路径

**Files:**
- Modify: `engineering-simulation.html`
- Modify: `industry-cloud.html`
- Modify: `2d-designer.html`
- Modify: `3d-designer.html`
- Modify: `3d-designer-enhanced.html`
- Modify: `embedded-sim.html`
- Modify: `jupyter-lab.html`
- Modify: `blockchain-lab.html`
- Modify: `blockchain-dev.html`
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: `data-platform-shell="workspace"`、`platform-theme.css`、`platform-shell.js`。
- Produces: 所有专业工作台的统一紧凑品牌栏和返回 `experiment-detail.html` 的入口。

- [ ] **Step 1: 固定工作台接入测试**

```powershell
$workspacePages = @(
    'engineering-simulation.html', 'industry-cloud.html', '2d-designer.html',
    '3d-designer.html', '3d-designer-enhanced.html', 'embedded-sim.html',
    'jupyter-lab.html', 'blockchain-lab.html', 'blockchain-dev.html'
)
foreach ($page in $workspacePages) {
    $html = Get-Content -Raw -LiteralPath (Join-Path $repoRoot $page)
    Assert-True ($html -match 'data-platform-shell="workspace"') "$page 未声明工作台壳层"
    Assert-True ($html -match 'css/platform-theme\.css') "$page 未接入共享主题"
    Assert-True ($html -match 'js/platform-shell\.js') "$page 未接入共享脚本"
}
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 所有尚未接入的专业页失败。

- [ ] **Step 3: 逐页增加工作台元数据**

每页只做三项结构改动：

```html
<link rel="stylesheet" href="css/platform-theme.css">
...
<body data-platform-page="engineering-simulation" data-platform-shell="workspace">
...
<script src="js/platform-shell.js"></script>
```

脚本放在现有页面脚本之后、`</body>` 之前。页面 ID 与文件名一致。统一 `<title>` 后缀为“人工智能算法训练平台”。

对 `engineering-simulation.html` 先执行：

```powershell
git diff -- engineering-simulation.html
```

只使用小范围补丁添加引用和属性，修改后再次检查差异，确保用户已有工作仍保留。

- [ ] **Step 4: 处理全屏高度兼容**

为依赖 `100vh` 的页面设置页面局部变量，不修改其内部面板结构：

```css
body[data-platform-shell="workspace"] {
    --platform-workspace-bar-height: 44px;
}
body[data-platform-shell="workspace"] .workspace,
body[data-platform-shell="workspace"] .app-container {
    min-height: calc(100vh - var(--platform-workspace-bar-height));
}
```

若页面根容器类名不同，只给该页面现有根容器追加等价的 `calc()` 覆盖，不进行整体 CSS 格式化。

- [ ] **Step 5: 运行工作台检查**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 所有专业工作台接入检查通过。

- [ ] **Step 6: 提交非脏工作台文件**

```powershell
git add -- industry-cloud.html 2d-designer.html 3d-designer.html 3d-designer-enhanced.html embedded-sim.html jupyter-lab.html blockchain-lab.html blockchain-dev.html tests/verify-platform.ps1
git commit -m "feat: add navigation shell to experiment workspaces"
```

`engineering-simulation.html` 保持未提交，除非可通过交互式暂存可靠分离本次新增行。

---

### Task 8: 收敛正式导航图标和视觉噪声

**Files:**
- Modify: `css/platform-theme.css`
- Modify: `js/platform-shell.js`
- Modify: 标准业务页中现有品牌与导航节点
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: 共享导航配置、SVG 图标映射、现有 `.nav-link` 和 `.sidebar-item`。
- Produces: 无 Emoji 的正式品牌与导航、低阴影小圆角的统一视觉。

- [ ] **Step 1: 添加正式导航 Emoji 检查**

测试只扫描由共享脚本生成的品牌和导航模板，避免误伤业务内容中的状态 Emoji：

```powershell
$navTemplateMatch = [regex]::Match($shell, 'const navigationByRole\s*=\s*\{[\s\S]*?\n\s*\};')
Assert-True $navTemplateMatch.Success '缺少统一角色导航配置'
if ($navTemplateMatch.Success) {
    Assert-True ($navTemplateMatch.Value -notmatch '[📊📚🔬📝🤖📈📋🔌👤🎓]') '正式导航仍包含 Emoji'
}
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 若统一导航尚未实现或仍含 Emoji，则失败。

- [ ] **Step 3: 完成统一角色导航渲染**

在 `platform-shell.js` 定义 `navigationByRole`，每项只使用图标名称：

```javascript
const navigationByRole = {
    student: [
        ['dashboard.html', '工作台', 'home'],
        ['course-hall.html', '课程', 'course'],
        ['experiment-hall.html', '实验', 'experiment'],
        ['exam-hall.html', '考试', 'exam'],
        ['ai-assistant.html', 'AI 学伴', 'ai']
    ],
    teacher: [
        ['teacher-dashboard.html', '工作台', 'home'],
        ['course-hall.html', '课程', 'course'],
        ['task-management.html', '任务', 'course'],
        ['exam-management.html', '考试', 'exam'],
        ['ai-analysis.html', '分析', 'ai']
    ],
    admin: [
        ['admin-dashboard.html', '工作台', 'home'],
        ['course-hall.html', '课程', 'course'],
        ['experiment-hall.html', '实验', 'experiment'],
        ['ai-analysis.html', '分析', 'ai']
    ]
};
```

对存在 `.nav-menu` 的标准页替换其菜单内容；侧边栏只在标记 `data-platform-navigation="global"` 时替换，避免覆盖实验详情中的局部功能导航。

- [ ] **Step 4: 收敛视觉效果**

在共享主题中覆盖正式导航和通用卡片：阴影不超过 `var(--platform-shadow)`，圆角使用 `6px` 或 `8px`，主导航不使用渐变。不得覆盖图表配色、仿真节点状态色或编辑器语法色。

- [ ] **Step 5: 运行视觉结构检查**

Run: `pwsh -NoProfile -File tests/verify-platform.ps1`

Expected: 正式导航配置存在且无 Emoji，所有静态检查通过。

- [ ] **Step 6: 提交视觉收敛**

先用 `git diff --name-only` 确认没有意外大范围重写，再只暂存本任务的干净文件或可分离补丁：

```powershell
git add -- css/platform-theme.css js/platform-shell.js tests/verify-platform.ps1
git commit -m "style: refine platform navigation and visual language"
```

---

### Task 9: 全站验证与差异审计

**Files:**
- Modify: 仅修复本轮验证发现的问题
- Test: `tests/verify-platform.ps1`

**Interfaces:**
- Consumes: 所有前述任务成果。
- Produces: 全部静态验收通过、无缺失 HTML 目标、受保护用户文件差异清晰。

- [ ] **Step 1: 运行完整静态验收**

Run:

```powershell
pwsh -NoProfile -File tests/verify-platform.ps1
```

Expected: `Platform verification passed.` and exit code `0`。

- [ ] **Step 2: 独立扫描所有本地 HTML 目标**

Run:

```powershell
$root = (Get-Location).Path
$files = Get-ChildItem -LiteralPath $root -Filter '*.html'
$names = @{}; $files | ForEach-Object { $names[$_.Name] = $true }
foreach ($file in $files) {
    $html = Get-Content -Raw -LiteralPath $file.FullName
    foreach ($match in [regex]::Matches($html, '(?:href|action)\s*=\s*["'']([^"''#?]+\.html)')) {
        $target = [IO.Path]::GetFileName($match.Groups[1].Value)
        if (-not $names.ContainsKey($target)) { Write-Error "$($file.Name) -> $target" }
    }
}
```

Expected: 无输出、无错误。

- [ ] **Step 3: 检查品牌残留**

Run:

```powershell
rg -n -g '*.html' '<title>.*(?:智慧教学|智联网综合实践|智慧教育综合实训)' .
```

Expected: 无匹配。

- [ ] **Step 4: 检查共享接入数量**

Run:

```powershell
rg -l -g '*.html' 'js/platform-shell.js' .
rg -l -g '*.html' 'css/platform-theme.css' .
```

Expected: 除 `index.html`、`color-preview.html`、`navigation-template.html` 外的正式业务页均出现；登录页只出现在主题列表中。

- [ ] **Step 5: 检查受保护工作区差异**

Run:

```powershell
git status --short
git diff -- dashboard.html engineering-simulation.html hardware-agent.html
git diff --check
```

Expected: 无空白错误；三份受保护文件的原有修改仍存在，本轮新增改动局限于品牌、主题引用、页面元数据和共享脚本引用。

- [ ] **Step 6: 浏览器烟雾测试**

通过本地静态服务器或允许访问本地页面的现有预览方式检查：

1. 登录页选择学生、教师、管理员后分别进入正确工作台。
2. 从课程大厅进入课程详情，再返回课程大厅。
3. 从实验大厅进入实验详情，依次启动工程仿真、行业云、2D、增强版 3D、嵌入式、Jupyter 和区块链。
4. 每个专业工作台使用返回入口回到实验详情。
5. 区块链仿真进入智能合约开发环境并返回。
6. 管理员“用户管理”“系统设置”显示演示提示，不发生 404。

Expected: 所有路径可达；页面内部既有交互仍可操作；控制台无由共享壳层引起的异常。

- [ ] **Step 7: 提交验证修复或记录无额外修改**

如果验证产生代码修复，只暂存对应修复文件：

```powershell
git add -- tests/verify-platform.ps1 css/platform-theme.css js/platform-shell.js
git commit -m "test: complete platform navigation verification"
```

若没有修复，不创建空提交。

---

## Completion Checklist

- [ ] `tests/verify-platform.ps1` 以退出码 `0` 完成。
- [ ] 所有正式本地 HTML 链接目标存在。
- [ ] 课程、考试、实验和专业工作台主路径完成烟雾测试。
- [ ] 品牌名统一为“人工智能算法训练平台”。
- [ ] 正式品牌和导航使用线性 SVG，不使用 Emoji。
- [ ] 登录角色在普通页面之间跳转时保持。
- [ ] 管理员死链已消除。
- [ ] `dashboard.html`、`engineering-simulation.html`、`hardware-agent.html` 的用户已有修改保留。
- [ ] 两个未跟踪媒体文件未被删除、移动或意外提交。
- [ ] `git diff --check` 无错误。
