# Extract CSS class names from a .module.css file
function Get-CssClasses {
    param([string]$FilePath)
    $content = Get-Content -LiteralPath $FilePath -Raw
    $classes = [System.Collections.ArrayList]@()
    # Match .className { patterns (CSS class definitions)
    $pattern = '\.([a-zA-Z][a-zA-Z0-9_-]*)\s*(?::{1,2}|\{)'
    $matches = [regex]::Matches($content, $pattern)
    $seen = @{}
    foreach ($m in $matches) {
        $class = $m.Groups[1].Value
        # Skip CSS pseudo-selectors and media queries
        if ($class -match '^(hover|focus|active|visited|focus-visible|focus-within|before|after|first-child|last-child|nth-child|not|is|has|open|disabled|placeholder|selection|moz|webkit|ms-|o-)') {
            continue
        }
        if (-not $seen.ContainsKey($class)) {
            $seen[$class] = $true
            [void]$classes.Add($class)
        }
    }
    return $classes
}

# Search for usage of a CSS class in TSX files  
function Search-ClassUsage {
    param([string]$ClassName, [string]$ModuleName, [string]$BaseDir)
    
    # Pattern 1: styles.className in the component file
    $pattern1 = 'styles\.' + [regex]::Escape($ClassName)
    
    # Pattern 2: Common re-export patterns like legalStyles.className
    # We'll search all tsx files for any pattern that ends with .ClassName
    
    $results = @()
    
    # Search in all TSX files
    $tsxFiles = Get-ChildItem -LiteralPath $BaseDir -Recurse -Filter "*.tsx" | Where-Object { -not $_.FullName.Contains('\node_modules\') }
    
    foreach ($file in $tsxFiles) {
        $content = Get-Content -LiteralPath $file.FullName -Raw
        # Match any identifier.ClassName pattern (styles., legalStyles., etc.)
        $usagePattern = '\w+\.' + [regex]::Escape($ClassName) + '\b'
        if ($content -match $usagePattern) {
            $results += $file.FullName
        }
    }
    
    return $results
}

$baseDir = "E:\WORK-FOLDER\WEB-DESIGN-PROJECTS\pexpacks-supplies"
$cssModules = Get-ChildItem -LiteralPath $baseDir -Recurse -Filter "*.module.css" | Where-Object { -not $_.FullName.Contains('\node_modules\') }

$report = @()
$allUnused = @()

foreach ($cssFile in $cssModules) {
    $cssPath = $cssFile.FullName
    $moduleName = $cssFile.BaseName -replace '\.module$', ''
    $dir = $cssFile.DirectoryName
    
    Write-Host "`n=== Processing: $moduleName ==="
    
    # Get CSS classes
    $classes = Get-CssClasses -FilePath $cssPath
    Write-Host "  Found $($classes.Count) classes"
    
    $moduleReport = @{
        Module = $moduleName
        Path = $cssPath
        TotalClasses = $classes.Count
        UnusedClasses = @()
        UsedClasses = @()
    }
    
    # Check each class
    foreach ($class in $classes) {
        $usage = Search-ClassUsage -ClassName $class -ModuleName $moduleName -BaseDir $baseDir
        if ($usage.Count -eq 0) {
            $moduleReport.UnusedClasses += $class
            Write-Host "  UNUSED: $class" -ForegroundColor Red
        } else {
            $moduleReport.UsedClasses += @{ Class = $class; Files = $usage }
        }
    }
    
    if ($moduleReport.UnusedClasses.Count -gt 0) {
        $allUnused += $moduleReport
    }
    $report += $moduleReport
}

# Print summary
Write-Host "`n`n=========================================="
Write-Host "DEAD CSS CLASSES REPORT"
Write-Host "=========================================="

foreach ($m in $allUnused) {
    Write-Host "`n--- $($m.Module) ---"
    Write-Host "  File: $($m.Path)"
    Write-Host "  Unused classes ($($m.UnusedClasses.Count)):"
    foreach ($c in $m.UnusedClasses) {
        Write-Host "    - $c"
    }
}

Write-Host "`n`nTotal CSS modules checked: $($report.Count)"
$totalUnused = ($allUnused | ForEach-Object { $_.UnusedClasses.Count }) | Measure-Object -Sum
Write-Host "Total potentially unused CSS classes: $($totalUnused.Sum)"
