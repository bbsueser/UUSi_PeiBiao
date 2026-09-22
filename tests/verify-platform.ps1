$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) {
        $failures.Add($Message)
    }
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

$expectedRoutes = @{
    'virtual-sim'    = 'engineering-simulation.html'
    '3d-designer'    = '3d-designer-enhanced.html'
    'industry-cloud' = 'industry-cloud.html'
    '2d-designer'    = '2d-designer.html'
    'jupyter'        = 'jupyter-lab.html'
    'blockchain'     = 'blockchain-lab.html'
    'embedded'       = 'embedded-sim.html'
}

$workspacePages = @(
    'engineering-simulation.html', 'industry-cloud.html', '2d-designer.html',
    '3d-designer.html', '3d-designer-enhanced.html', 'embedded-sim.html',
    'jupyter-lab.html', 'blockchain-lab.html', 'blockchain-dev.html'
)

foreach ($page in $businessPages) {
    Assert-True (Test-Path -LiteralPath (Join-Path $repoRoot $page)) "缺少业务页面: $page"
}

foreach ($page in $workspacePages) {
    $html = Get-Content -Raw -LiteralPath (Join-Path $repoRoot $page)
    Assert-True ($html -match 'data-platform-shell="workspace"') "$page 未声明工作台壳层"
    Assert-True ($html -match 'css/platform-theme\.css') "$page 未接入共享主题"
    Assert-True ($html -match 'js/platform-shell\.js') "$page 未接入共享脚本"
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

$theme = if (Test-Path -LiteralPath $themePath) {
    Get-Content -Raw -LiteralPath $themePath
} else {
    ''
}
foreach ($selector in @(
    '.platform-brand-mark',
    '.platform-workspace-bar',
    '.platform-breadcrumbs',
    '.platform-back-link',
    '.platform-notice'
)) {
    Assert-True ($theme -match [regex]::Escape($selector)) "共享主题缺少选择器: $selector"
}

foreach ($page in $businessPages) {
    $html = Get-Content -Raw -LiteralPath (Join-Path $repoRoot $page)
    Assert-True ($html -match '人工智能算法训练平台') "$page 未统一品牌名"
    Assert-True ($html -match 'css/platform-theme\.css') "$page 未接入共享主题"
    if ($page -ne 'index.html') {
        $shellRefs = ([regex]::Matches($html, 'js/platform-shell\.js')).Count
        Assert-True ($shellRefs -eq 1) "$page 的共享壳层引用次数不是 1"
        Assert-True ($html -match 'data-platform-page=') "$page 缺少页面元数据"
        Assert-True ($html -match 'data-platform-shell="standard"|data-platform-shell="workspace"') "$page 未声明壳层类型"
    }
}

$shell = if (Test-Path -LiteralPath $shellPath) {
    Get-Content -Raw -LiteralPath $shellPath
} else {
    ''
}
foreach ($signature in @(
    'window.PlatformShell',
    'function initPlatformShell',
    'function iconSvg',
    'function showPlatformNotice',
    "const PLATFORM_NAME = '人工智能算法训练平台'"
)) {
    Assert-True ($shell -match [regex]::Escape($signature)) "共享壳层缺少接口: $signature"
}
$navTemplateMatch = [regex]::Match($shell, 'const navigationByRole\s*=\s*\{[\s\S]*?\n\s*\};')
Assert-True $navTemplateMatch.Success '缺少统一角色导航配置'
if ($navTemplateMatch.Success) {
    Assert-True ($navTemplateMatch.Value -notmatch '[📊📚🔬📝🤖📈📋🔌👤🎓]') '正式导航仍包含 Emoji'
}
foreach ($pair in $expectedRoutes.GetEnumerator()) {
    $routeLiteral = "'$($pair.Key)': '$($pair.Value)'"
    Assert-True ($shell -match [regex]::Escape($routeLiteral)) "实验路由缺失: $($pair.Key)"
}

$appJs = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'js/app.js')
Assert-True ($appJs -match 'isLoginPage') 'app.js 尚未限制登录页状态清理'
Assert-True ($appJs -match 'const isLoginPage = .*index\.html') '缺少登录页判断'
Assert-True ($appJs -match 'if \(isLoginPage\)') '角色清理未受登录页条件保护'
Assert-True ($appJs -match "localStorage\.removeItem\('userRole'\)") '退出流程必须能清理角色'

$courseHall = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'course-hall.html')
$experimentDetail = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'experiment-detail.html')
$adminDashboard = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'admin-dashboard.html')
$blockchainLab = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'blockchain-lab.html')
$taskManagement = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'task-management.html')
$examManagement = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'exam-management.html')
$hardwareAgent = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'hardware-agent.html')
$industryCloud = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'industry-cloud.html')

Assert-True ($courseHall -match 'course-detail\.html') '课程大厅不能进入课程详情'
Assert-True ($experimentDetail -match 'launchSelectedExperiment') '实验详情缺少启动路由'
Assert-True ($blockchainLab -match 'blockchain-dev\.html') '区块链仿真不能进入开发环境'
Assert-True ($adminDashboard -notmatch 'href="(?:user-management|system-settings)\.html"') '管理员页面仍含死链'

# 共享导航只能改写显式声明为 global 的容器，页面内部功能菜单必须保留。
Assert-True ($shell -match 'querySelectorAll\(''\[data-platform-navigation="global"\]''\)') '共享壳层仍会扫描通用菜单类'
Assert-True ($shell -notmatch 'querySelectorAll\(''\.nav-menu''\)|querySelectorAll\(''\.sidebar-menu''\)') '共享壳层仍会无条件替换通用菜单'
Assert-True ($taskManagement -match '<nav class="sidebar-menu" data-platform-navigation="local">[\s\S]*?data-tab="task-assign"') '任务管理功能标签未声明为本地导航'
Assert-True ($examManagement -match '<nav class="sidebar-menu" data-platform-navigation="local">[\s\S]*?data-tab="exam-create"') '考试管理功能标签未声明为本地导航'
Assert-True ($hardwareAgent -notmatch 'class="nav-menu" data-platform-navigation="global"') '硬件智能体功能菜单被错误声明为全局导航'
Assert-True ($adminDashboard -match 'class="nav-menu" data-platform-navigation="local"[\s\S]*?data-platform-notice') '管理员顶部演示入口未受本地导航保护'
Assert-True ($adminDashboard -match 'class="sidebar-menu" data-platform-navigation="local"[\s\S]*?data-platform-notice') '管理员侧栏演示入口未受本地导航保护'

# 工作台壳层必须为固定 44px 顶栏留出真实空间，不能遮挡或裁切原工作区。
foreach ($layoutRule in @(
    'data-platform-page="embedded-sim"\] \.main-layout',
    'data-platform-page="blockchain-dev"\] \.ide-layout',
    'data-platform-page="2d-designer"\] \.main-container',
    'data-platform-page="engineering-simulation"\] \.main-content',
    'data-platform-page="jupyter-lab"\] \.header',
    'data-platform-page="industry-cloud"\] \.top-nav',
    'data-platform-page="3d-designer"\] \.top-nav',
    'data-platform-page="3d-designer-enhanced"\] \.top-nav'
)) {
    Assert-True ($theme -match $layoutRule) "共享主题缺少工作台占位规则: $layoutRule"
}
Assert-True ($theme -match '@media \(max-width: 720px\)[\s\S]*?\.platform-breadcrumbs\s*\{[\s\S]*?display:\s*none') '窄屏工作台顶栏高度仍可能换行变化'

# 非标准品牌结构也要在不替换功能控件的前提下去除 Emoji 标识。
Assert-True ($shell -match '\.top-nav-logo \.logo-icon') '考试防作弊页品牌图标未纳入归一化'
Assert-True ($shell -match '\.header-logo-icon') '专业工作台品牌图标未纳入归一化'
Assert-True ($shell -match '\[data-platform-navigation="local"\] \.sidebar-icon') '本地功能菜单的 Emoji 图标未做无损归一化'
Assert-True ($shell -match 'dataset\.platformShell === ''workspace''\)[\s\S]*?normalizeExistingBrand\(\);[\s\S]*?renderWorkspaceBar\(\)') '工作台页面未执行已有品牌归一化'
Assert-True ($industryCloud -match 'class="industry-sidebar" data-platform-navigation="local"') '行业云功能侧栏未声明为本地导航'
Assert-True ($industryCloud -match 'class="sidebar-icon"') '行业云侧栏 Emoji 未包裹为可归一化图标'
Assert-True ($shell -match "closest\('a, button, \.sidebar-item, \.sidebar-group-title, \.sidebar-header'\)") '行业云本地导航图标无法读取所在项目语义'
Assert-True ($theme -match 'data-platform-page="industry-cloud"\] \.industry-sidebar\s*\{[\s\S]*?top:\s*calc\(60px \+ var\(--platform-workspace-bar-height\)\)') '行业云吸顶侧栏未避让平台栏与原导航'

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ -ErrorAction Continue }
    exit 1
}

Write-Host 'Platform verification passed.'
