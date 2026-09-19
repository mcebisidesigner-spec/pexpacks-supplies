# PowerShell 5.1 compatible. replace all ?? with has-key guards.
param([string]$Root = "E:\WORK-FOLDER\WEB-DESIGN-PROJECTS\pexpacks-supplies")

$consumers = @()
$classCount = @{}

# 1) same-dir consumers: components\admin\views\*.tsx (import "./CorePagesView.module.css")
$viewsDir = Join-Path $Root "components\admin\views"
if (Test-Path -LiteralPath $viewsDir) {
  Get-ChildItem -LiteralPath $viewsDir -File -Filter *.tsx | ForEach-Object {
    $hit = Select-String -LiteralPath $_.FullName -Pattern "CorePagesView\.module\.css" -ErrorAction SilentlyContinue
    if ($hit) { $consumers += $_.FullName }
  }
}

# 2) letters + quotations list views (import "../views/CorePagesView.module.css" / "../../views/CorePagesView.module.css")
$subDirs = @("letters", "quotations")
foreach ($sd in $subDirs) {
  $d = Join-Path $Root "components\admin\$sd"
  if (Test-Path -LiteralPath $d) {
    Get-ChildItem -LiteralPath $d -File -Filter *.tsx | ForEach-Object {
      $hit = Select-String -LiteralPath $_.FullName -Pattern "CorePagesView\.module\.css" -ErrorAction SilentlyContinue
      if ($hit) { $consumers += $_.FullName }
    }
  }
}

# 3) app/admin/**/page.tsx importing "@/components/admin/views/CorePagesView.module.css"
$appAdmin = Join-Path $Root "app\admin"
if (Test-Path -LiteralPath $appAdmin) {
  Get-ChildItem -LiteralPath $appAdmin -Recurse -File -Filter page.tsx | ForEach-Object {
    $hit = Select-String -LiteralPath $_.FullName -Pattern "CorePagesView\.module\.css" -ErrorAction SilentlyContinue
    if ($hit) { $consumers += $_.FullName }
  }
}

$consumers = $consumers | Sort-Object -Unique

"=== $($consumers.Count) consumers ==="
foreach ($c in $consumers) {
  $lines = Get-Content -LiteralPath $c
  $used = @{}
  foreach ($line in $lines) {
    foreach ($mm in [regex]::Matches($line, "styles\.([A-Za-z][A-Za-z0-9_]*)")) {
      $k = $mm.Groups[1].Value
      if (-not $used.ContainsKey($k)) { $used[$k] = $true }
      if ($classCount.ContainsKey($k)) { $classCount[$k] = $classCount[$k] + 1 } else { $classCount[$k] = 1 }
    }
  }
  $rel = $c.Substring($Root.Length + 1)
  "$rel : $($used.Count) : $(($used.Keys | Sort-Object) -join ', ')"
}

"=== TOTAL distinct class tokens used: $($classCount.Count) ==="
"=== per-token: how many of the $($consumers.Count) files use it ==="
foreach ($k in ($classCount.Keys | Sort-Object { $classCount[$_] } -Descending)) {
  "{0,3}  {1}" -f $classCount[$k], $k
}
