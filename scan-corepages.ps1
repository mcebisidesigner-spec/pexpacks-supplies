# Scan: which styles.<class> tokens are used across all files importing
# "@/components/admin/views/CorePagesView.module.css" or "./CorePagesView.module.css"
# or "../views/CorePagesView.module.css". PowerShell 5.1 compatible (no ??).

$root = (Get-Location).Path
$consumers = @()

# 1) components\admin\views\*.tsx (same-dir import ./CorePagesView.module.css)
$viewsDir = Join-Path $root "components\admin\views"
if (Test-Path -LiteralPath $viewsDir) {
  Get-ChildItem -LiteralPath $viewsDir -File -Filter *.tsx | ForEach-Object { $consumers += $_.FullName }
}

# 2) letters + quotations list views (import ../views/CorePagesView.module.css)
$lettersDir = Join-Path $root "components\admin\letters"
if (Test-Path -LiteralPath $lettersDir) {
  Get-ChildItem -LiteralPath $lettersDir -File -Filter *.tsx | ForEach-Object {
    $hit = Select-String -LiteralPath $_.FullName -Pattern "CorePagesView\.module\.css" -ErrorAction SilentlyContinue
    if ($hit) { $consumers += $_.FullName }
  }
}
$quotsDir = Join-Path $root "components\admin\quotations"
if (Test-Path -LiteralPath $quotsDir) {
  Get-ChildItem -LiteralPath $quotsDir -File -Filter *.tsx | ForEach-Object {
    $hit = Select-String -LiteralPath $_.FullName -Pattern "CorePagesView\.module\.css" -ErrorAction SilentlyContinue
    if ($hit) { $consumers += $_.FullName }
  }
}

# 3) app\admin\**\page.tsx (import @/components/admin/views/CorePagesView.module.css)
$appAdminDir = Join-Path $root "app\admin"
if (Test-Path -LiteralPath $appAdminDir) {
  Get-ChildItem -LiteralPath $appAdminDir -Recurse -File -Filter page.tsx | ForEach-Object {
    $hit = Select-String -LiteralPath $_.FullName -Pattern "CorePagesView\.module\.css" -ErrorAction SilentlyContinue
    if ($hit) { $consumers += $_.FullName }
  }
}

$consumers = $consumers | Sort-Object -Unique

"=== $($consumers.Count) consumers ==="
$classCount = @{}
foreach ($c in $consumers) {
  $lines = Get-Content -LiteralPath $c
  $used = @{}
  foreach ($line in $lines) {
    if ($line -match "styles\.") {
      foreach ($mm in [regex]::Matches($line, "styles\.([A-Za-z][A-Za-z0-9_]*)")) {
        $used[$mm.Groups[1].Value] = $true
        $classCount[$mm.Groups[1].Value] = ($classCount[$mm.Groups[1].Value] ?? 0) + 1
      }
    }
  }
  $rel = $c.Replace("$root\", "")
  "$rel : $($used.Count) classes : $(($used.Keys | Sort-Object) -join ', ')"
}
"=== TOTAL distinct classes used across all consumers: $($classCount.Count) ==="
"=== per class: # of consumer-files using it ==="
$classCount.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
  "{0,3}  {1}" -f $_.Value, $_.Key
}
