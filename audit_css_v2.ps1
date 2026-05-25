$baseDir = "E:\WORK-FOLDER\WEB-DESIGN-PROJECTS\pexpacks-supplies"

# Find all CSS module files
$cssModules = Get-ChildItem -LiteralPath $baseDir -Recurse -Filter "*.module.css" | Where-Object { -not $_.FullName.Contains('\node_modules\') }

# Build a mapping: CSS module file path -> all imported names used across TSX files
Write-Host "Building import map..." -ForegroundColor Cyan
$importMap = @{}

$tsxFiles = Get-ChildItem -LiteralPath $baseDir -Recurse -Filter "*.tsx" | Where-Object { -not $_.FullName.Contains('\node_modules\') }

foreach ($tsx in $tsxFiles) {
    $content = Get-Content -LiteralPath $tsx.FullName -Raw
    
    # Find all CSS module imports
    $pattern = 'import\s+(\w+)\s+from\s+["''](.+?\.module\.css)["'']'
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($m in $matches) {
        $importName = $m.Groups[1].Value  # e.g., "styles", "heroStyles"
        $importPath = $m.Groups[2].Value  # e.g., "./HeroBase.module.css"
        
        # Resolve the import path to an absolute path
        if ($importPath.StartsWith('./') -or $importPath.StartsWith('.\')) {
            $resolvedPath = Resolve-Path (Join-Path $tsx.DirectoryName $importPath) -ErrorAction SilentlyContinue
        } elseif ($importPath.StartsWith('@/')) {
            $relativePath = $importPath.Substring(2)
            $resolvedPath = Resolve-Path (Join-Path $baseDir $relativePath) -ErrorAction SilentlyContinue
        } else {
            $resolvedPath = $null
        }
        
        if ($resolvedPath) {
            $normalizedPath = $resolvedPath.Path
            if (-not $importMap.ContainsKey($normalizedPath)) {
                $importMap[$normalizedPath] = @{}
            }
            $importMap[$normalizedPath][$importName] = $true
        }
    }
}

Write-Host "Import map built. Found $($importMap.Count) CSS modules with imports." -ForegroundColor Cyan

# Now for each CSS module, extract classes and check usage
$report = @()
$allResults = @()

foreach ($cssModule in $cssModules) {
    $cssPath = $cssModule.FullName
    $moduleName = $cssModule.BaseName -replace '\.module$', ''
    $shortName = $cssModule.Name
    
    Write-Host "`nProcessing: $shortName" -ForegroundColor Yellow
    
    # Extract CSS class names
    $cssContent = Get-Content -LiteralPath $cssPath -Raw
    
    # Match .className { or .className, or .className:: or .className[
    # But NOT @media, @keyframes, :pseudo-classes starting with :
    $classPattern = '(?<=^|\s|,|{)\.([a-zA-Z_][a-zA-Z0-9_-]*)\s*(?={|,|::|:|\[)'
    $classMatches = [regex]::Matches($cssContent, $classPattern)
    
    $cssClasses = [System.Collections.ArrayList]@()
    $seenClass = @{}
    
    foreach ($cm in $classMatches) {
        $class = $cm.Groups[1].Value
        # Skip things like :hover, :focus, etc.
        if ($class -match '^(hover|focus|active|visited|focus-visible|focus-within|before|after|first-child|last-child|nth-child|not|is|has|where|open|disabled|placeholder|selection|moz|webkit|ms-|o-|apple|link|target|checked|required|optional|read-only|read-write|enabled|disabled|empty|root|host|slotted|part|dir|lang|any-link|local-link|scope|user-invalid|valid|invalid|in-range|out-of-range|popover-open)') {
            continue
        }
        # Skip pseudo-elements
        if ($class -match '^(hover|focus|active|visited|focus-visible|focus-within|before|after|first-letter|first-line|selection|placeholder|marker|backdrop)') {
            continue
        }
        if (-not $seenClass.ContainsKey($class)) {
            $seenClass[$class] = $true
            [void]$cssClasses.Add($class)
        }
    }
    
    Write-Host "  Found $($cssClasses.Count) CSS classes" -ForegroundColor DarkYellow
    
    # Get import names used for this CSS module across ALL TSX files
    $importNames = @()
    if ($importMap.ContainsKey($cssPath)) {
        $importNames = $importMap[$cssPath].Keys
    }
    
    # Also find the companion TSX file (same name, .tsx extension)
    $companionTsx = $null
    $companionDir = $cssModule.DirectoryName
    $companionBaseName = $cssModule.BaseName -replace '\.module$', ''
    $potentialCompanion = Join-Path $companionDir "$companionBaseName.tsx"
    if (Test-Path -LiteralPath $potentialCompanion) {
        $companionTsx = $potentialCompanion
    }
    
    Write-Host "  Import names: $($importNames -join ', ')" -ForegroundColor DarkYellow
    
    $unusedClasses = [System.Collections.ArrayList]@()
    $usedClasses = [System.Collections.ArrayList]@()
    
    foreach ($class in $cssClasses) {
        $found = $false
        
        # Search across ALL TSX files for this class name used with any import alias
        # Pattern: <importName>.<className> or <importName>["<className>"]
        foreach ($importName in $importNames) {
            # Pattern 1: styles.className (dotted)
            $dotPattern = [regex]::Escape($importName) + '\.' + [regex]::Escape($class) + '(?=[\s,;})])'
            # Pattern 2: styles["className"] (bracket notation)
            $bracketPattern = [regex]::Escape($importName) + '\[\"' + [regex]::Escape($class) + '\"\]'
            $bracketPattern2 = [regex]::Escape($importName) + '\[\x27' + [regex]::Escape($class) + '\x27\]'
            
            $combinedPattern = "($dotPattern)|($bracketPattern)|($bracketPattern2)"
            
            # Search in all TSX files
            foreach ($tsx in $tsxFiles) {
                $tsxContent = Get-Content -LiteralPath $tsx.FullName -Raw
                if ($tsxContent -match $combinedPattern) {
                    $found = $true
                    break
                }
            }
            
            if ($found) { break }
        }
        
        if ($found) {
            [void]$usedClasses.Add($class)
        } else {
            [void]$unusedClasses.Add($class)
        }
    }
    
    if ($unusedClasses.Count -gt 0) {
        Write-Host "  UNUSED classes ($($unusedClasses.Count)):" -ForegroundColor Red
        foreach ($c in $unusedClasses) {
            Write-Host "    - $c" -ForegroundColor Red
        }
        
        $allResults += [PSCustomObject]@{
            Module = $moduleName
            File = $cssPath
            TotalClasses = $cssClasses.Count
            UnusedCount = $unusedClasses.Count
            UnusedClasses = ($unusedClasses -join ', ')
            ImportNames = ($importNames -join ', ')
        }
    } else {
        Write-Host "  All $($cssClasses.Count) classes are used!" -ForegroundColor Green
    }
}

Write-Host "`n`n==========================================" -ForegroundColor Cyan
Write-Host "DEAD CSS CLASSES REPORT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if ($allResults.Count -eq 0) {
    Write-Host "No unused CSS classes found!" -ForegroundColor Green
} else {
    foreach ($r in $allResults) {
        Write-Host "`n--- $($r.Module) ---" -ForegroundColor Yellow
        Write-Host "  File: $($r.File)" -ForegroundColor Gray
        Write-Host "  Imported as: $($r.ImportNames)" -ForegroundColor Gray
        Write-Host "  Total classes: $($r.TotalClasses)" -ForegroundColor Gray
        Write-Host "  Unused: $($r.UnusedClasses)" -ForegroundColor Red
    }
    
    $totalUnused = ($allResults | ForEach-Object { $_.UnusedCount }) | Measure-Object -Sum
    Write-Host "`n`nTotal potentially unused CSS classes: $($totalUnused.Sum)" -ForegroundColor Red
}

$totalModules = $cssModules.Count
Write-Host "`nTotal CSS modules checked: $totalModules" -ForegroundColor Cyan
Write-Host "Total TSX files searched: $($tsxFiles.Count)" -ForegroundColor Cyan
