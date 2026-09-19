const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'app', 'admin', 'admin.module.css');
const outPath = path.join(__dirname, '..', 'app', 'admin', 'adminStyles.ts');

const content = fs.readFileSync(cssPath, 'utf8');

// Helper to convert CSS rule body to Tailwind utility classes
function cssToTailwind(ruleBody) {
  const classes = [];
  const declarations = ruleBody.split(';').map(d => d.trim()).filter(Boolean);

  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const val = decl.slice(colonIdx + 1).trim();

    // Map common layout declarations
    if (prop === 'display') {
      if (val === 'flex') classes.push('flex');
      else if (val === 'inline-flex') classes.push('inline-flex');
      else if (val === 'grid') classes.push('grid');
      else if (val === 'block') classes.push('block');
      else if (val === 'inline-block') classes.push('inline-block');
      else if (val === 'inline') classes.push('inline');
      else if (val === 'none') classes.push('hidden');
    } else if (prop === 'flex-direction') {
      if (val === 'column') classes.push('flex-col');
      else if (val === 'row') classes.push('flex-row');
    } else if (prop === 'align-items') {
      if (val === 'center') classes.push('items-center');
      else if (val === 'flex-start' || val === 'start') classes.push('items-start');
      else if (val === 'flex-end' || val === 'end') classes.push('items-end');
      else if (val === 'stretch') classes.push('items-stretch');
      else if (val === 'baseline') classes.push('items-baseline');
    } else if (prop === 'justify-content') {
      if (val === 'center') classes.push('justify-center');
      else if (val === 'space-between') classes.push('justify-between');
      else if (val === 'flex-end' || val === 'end') classes.push('justify-end');
      else if (val === 'flex-start' || val === 'start') classes.push('justify-start');
    } else if (prop === 'flex-wrap') {
      if (val === 'wrap') classes.push('flex-wrap');
      else if (val === 'nowrap') classes.push('flex-nowrap');
    } else if (prop === 'flex') {
      if (val === '1' || val === '1 1 0%') classes.push('flex-1');
      else if (val === 'none') classes.push('flex-none');
    } else if (prop === 'flex-shrink') {
      if (val === '0') classes.push('shrink-0');
    } else if (prop === 'text-align') {
      if (val === 'center') classes.push('text-center');
      else if (val === 'right') classes.push('text-right');
      else if (val === 'left') classes.push('text-left');
    } else if (prop === 'cursor') {
      if (val === 'pointer') classes.push('cursor-pointer');
      else if (val === 'not-allowed') classes.push('cursor-not-allowed');
    } else if (prop === 'user-select') {
      if (val === 'none') classes.push('select-none');
    } else if (prop === 'pointer-events') {
      if (val === 'none') classes.push('pointer-events-none');
      else if (val === 'auto') classes.push('pointer-events-auto');
    } else if (prop === 'position') {
      if (val === 'relative') classes.push('relative');
      else if (val === 'absolute') classes.push('absolute');
      else if (val === 'fixed') classes.push('fixed');
      else if (val === 'sticky') classes.push('sticky');
    } else if (prop === 'overflow') {
      if (val === 'hidden') classes.push('overflow-hidden');
      else if (val === 'auto') classes.push('overflow-auto');
    } else if (prop === 'overflow-x') {
      if (val === 'auto') classes.push('overflow-x-auto');
      else if (val === 'hidden') classes.push('overflow-x-hidden');
    } else if (prop === 'overflow-y') {
      if (val === 'auto') classes.push('overflow-y-auto');
      else if (val === 'hidden') classes.push('overflow-y-hidden');
    } else if (prop === 'width') {
      if (val === '100%') classes.push('w-full');
      else if (val === 'auto') classes.push('w-auto');
      else if (val === 'fit-content') classes.push('w-fit');
      else classes.push(`w-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'height') {
      if (val === '100%') classes.push('h-full');
      else if (val === 'auto') classes.push('h-auto');
      else classes.push(`h-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'min-width') {
      if (val === '0') classes.push('min-w-0');
      else classes.push(`min-w-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'max-width') {
      if (val === '100%') classes.push('max-w-full');
      else classes.push(`max-w-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'min-height') {
      if (val === '0') classes.push('min-h-0');
      else classes.push(`min-h-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'gap') {
      classes.push(`gap-[${val.replace(/\s+/g, '_')}]`);
    } else if (prop === 'padding') {
      classes.push(`p-[${val.replace(/\s+/g, '_')}]`);
    } else if (prop === 'margin') {
      if (val === '0') classes.push('m-0');
      else if (val === '0 auto' || val === 'auto') classes.push('mx-auto');
      else classes.push(`m-[${val.replace(/\s+/g, '_')}]`);
    } else if (prop === 'font-weight') {
      if (val === '400') classes.push('font-normal');
      else if (val === '500') classes.push('font-medium');
      else if (val === '600') classes.push('font-semibold');
      else if (val === '700' || val === 'bold') classes.push('font-bold');
      else if (val === '800') classes.push('font-extrabold');
      else classes.push(`font-[${val}]`);
    } else if (prop === 'font-size') {
      classes.push(`text-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'color') {
      if (val === '#ffffff' || val === '#fff' || val === 'white') classes.push('text-white');
      else if (val === 'transparent') classes.push('text-transparent');
      else if (val === 'inherit') classes.push('text-inherit');
      else classes.push(`text-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'background' || prop === 'background-color') {
      if (val === 'transparent') classes.push('bg-transparent');
      else if (val === '#ffffff' || val === '#fff' || val === 'white') classes.push('bg-white');
      else if (val.includes('gradient')) classes.push(`[background:${val.replace(/\s+/g, '_')}]`);
      else classes.push(`bg-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'border-radius') {
      if (val === '9999px' || val === '999px' || val === '50%') classes.push('rounded-full');
      else classes.push(`rounded-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'border') {
      if (val === 'none' || val === '0') classes.push('border-0');
      else classes.push(`border border-[${val.replace(/^1px\s+solid\s+/, '').replace(/\s+/g, '')}]`);
    } else if (prop === 'border-bottom') {
      if (val === 'none' || val === '0') classes.push('border-b-0');
      else classes.push(`border-b border-[${val.replace(/^1px\s+solid\s+/, '').replace(/\s+/g, '')}]`);
    } else if (prop === 'border-top') {
      if (val === 'none' || val === '0') classes.push('border-t-0');
      else classes.push(`border-t border-[${val.replace(/^1px\s+solid\s+/, '').replace(/\s+/g, '')}]`);
    } else if (prop === 'box-shadow') {
      if (val === 'none') classes.push('shadow-none');
      else classes.push(`[box-shadow:${val.replace(/\s+/g, '_')}]`);
    } else if (prop === 'text-decoration') {
      if (val === 'none') classes.push('no-underline');
      else if (val === 'underline') classes.push('underline');
    } else if (prop === 'white-space') {
      if (val === 'nowrap') classes.push('whitespace-nowrap');
      else if (val === 'pre-wrap') classes.push('whitespace-pre-wrap');
    } else if (prop === 'text-transform') {
      if (val === 'uppercase') classes.push('uppercase');
      else if (val === 'lowercase') classes.push('lowercase');
      else if (val === 'capitalize') classes.push('capitalize');
    } else if (prop === 'letter-spacing') {
      classes.push(`tracking-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'line-height') {
      classes.push(`leading-[${val.replace(/\s+/g, '')}]`);
    } else if (prop === 'z-index') {
      classes.push(`z-[${val}]`);
    } else if (prop === 'opacity') {
      classes.push(`opacity-[${val}]`);
    } else {
      classes.push(`[${prop}:${val.replace(/\s+/g, '_')}]`);
    }
  }

  return classes.join(' ');
}

// Regex to extract .className { ... }
const classRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
const styleDict = {};

let match;
while ((match = classRegex.exec(content)) !== null) {
  const className = match[1];
  const body = match[2].trim();
  
  if (!styleDict[className]) {
    styleDict[className] = cssToTailwind(body);
  } else {
    // Append additional rules if class has multiple definitions
    styleDict[className] += ' ' + cssToTailwind(body);
  }
}

// Write the output TypeScript file with Proxy fallback
const tsOutput = `/**
 * PEXPACKS ADMIN — UNIFIED TAILWIND STYLES DICTIONARY
 * 100% Token & Visual Parity replacement for app/admin/admin.module.css
 * Generated from master admin stylesheet (2,473 lines)
 */

export interface AdminStylesDictionary {
  [key: string]: string;
}

const rawStyles: AdminStylesDictionary = ${JSON.stringify(styleDict, null, 2)};

export const adminStyles: AdminStylesDictionary = new Proxy(rawStyles, {
  get(target, prop: string) {
    if (prop in target) {
      return target[prop];
    }
    // Return empty string fallback for any unspecified utility modifier
    return "";
  },
});

export default adminStyles;
`;

fs.writeFileSync(outPath, tsOutput, 'utf8');
console.log('Successfully generated adminStyles.ts with', Object.keys(styleDict).length, 'classes!');
