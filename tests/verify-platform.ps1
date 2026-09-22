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

foreach ($page in $businessPages) {
    Assert-True (Test-Path -LiteralPath (Join-Path $repoRoot $page)) "缺少业务页面: $page"
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
        Assert-True ($html -match 'js/platform-shell\.js') "$page 未接入共享壳层"
        Assert-True ($html -match 'data-platform-page=') "$page 缺少页面元数据"
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
foreach ($pair in $expectedRoutes.GetEnumerator()) {
    $routeLiteral = "'$($pair.Key)': '$($pair.Value)'"
    Assert-True ($shell -match [regex]::Escape($routeLiteral)) "实验路由缺失: $($pair.Key)"
}

$appJs = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'js/app.js')
Assert-True ($appJs -match 'isLoginPage') 'app.js 尚未限制登录页状态清理'

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ -ErrorAction Continue }
    exit 1
}

Write-Host 'Platform verification passed.'
