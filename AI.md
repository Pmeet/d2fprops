# AI Development Guide for d2fprops

This document provides context for AI assistants to understand and modify this codebase. **Read this first before making any changes.**

---

## What is d2fprops?

**d2fprops** is a collection of attribute-based utilities ("props") for Webflow websites. Each prop is independent and adds functionality via `data-*` attributes — no custom JavaScript required from the user.

---

## IMPORTANT: Naming Conventions

### For NEW Props (Future Development)

All **new** props must follow this naming convention:

```
data-d2f-{prop-name}
data-d2f-{prop-name}-{option}
```

**Examples:**
- `data-d2f-tabs`, `data-d2f-tabs-active`
- `data-d2f-accordion`, `data-d2f-accordion-open`
- `data-d2f-slider`, `data-d2f-slider-autoplay`

### Exception: Video Prop (Legacy Support)

The **video** prop supports TWO naming conventions for backwards compatibility:

| Convention | Attributes | Status |
|------------|------------|--------|
| Legacy | `data-vdo`, `data-vdo-src`, etc. | Supported (existing sites) |
| New | `data-video`, `data-video-src`, etc. | Supported (recommended) |

**Why?** The video prop was developed before d2fprops naming was standardized. Existing implementations use `data-vdo-*` and must continue working.

**Implementation pattern:**
```typescript
// Define both attribute sets
const ATTR_LEGACY = { ROOT: "data-vdo", SRC: "data-vdo-src", ... };
const ATTR_NEW = { ROOT: "data-video", SRC: "data-video-src", ... };

// Helper to read with fallback
function getAttr(el, newAttr, legacyAttr) {
  return el.getAttribute(newAttr) ?? el.getAttribute(legacyAttr);
}

// Select both in init
document.querySelectorAll(`[${ATTR_LEGACY.ROOT}], [${ATTR_NEW.ROOT}]`);
```

---

## Architecture Overview

```
d2fprops/
├── src/
│   ├── index.ts                 # Main export (re-exports all props)
│   └── props/
│       ├── video/               # Video prop
│       │   ├── index.ts         # Logic (TypeScript)
│       │   ├── styles.css       # Styles
│       │   └── README.md        # User documentation for this prop
│       ├── [future-prop]/       # Future props follow same structure
│       │   ├── index.ts
│       │   ├── styles.css
│       │   └── README.md        # REQUIRED: User docs
│       └── ...
├── dist/                        # Built outputs (per prop)
├── build.js                     # Build script (auto-discovers props)
├── package.json
├── tsconfig.json
├── AI.md                        # This file
└── README.md                    # Main user documentation
```

---

## Prop Structure Requirements

Every prop MUST have:

1. **`index.ts`** — Main logic
2. **`styles.css`** — Styles (if needed)
3. **`README.md`** — User-facing documentation explaining:
   - Installation (CDN script tag)
   - All attributes with descriptions
   - Examples
   - Troubleshooting

---

## Naming Convention Reference

### For New Props (data-d2f-{prop})

| Type | Pattern | Example |
|------|---------|---------|
| Root attribute | `data-d2f-{prop}` | `data-d2f-tabs` |
| Option attributes | `data-d2f-{prop}-{option}` | `data-d2f-tabs-active` |
| CSS classes | `d2f-{prop}-{element}` | `d2f-tabs-panel` |
| CSS variables | `--d2f-{prop}-{name}` | `--d2f-tabs-height` |
| JS init flag | `_d2f{Prop}Init` | `_d2fTabsInit` |

### For Video Prop (Special Case)

Supports both `data-vdo-*` (legacy) and `data-video-*` (new).

---

## How to Add a New Prop

### Step 1: Create folder structure

```bash
mkdir -p src/props/my-prop
```

### Step 2: Create `index.ts`

```typescript
/**
 * d2fprops / my-prop
 * Brief description of what this prop does
 */

// ============================================================
// CONSTANTS
// ============================================================

const ATTR = {
  ROOT: "data-d2f-my-prop",          // Note: data-d2f- prefix!
  OPTION_ONE: "data-d2f-my-prop-option",
} as const;

const CSS_PREFIX = "d2f-my-prop";

// ============================================================
// TYPES
// ============================================================

interface MyPropElement extends HTMLElement {
  _d2fMyPropInit?: boolean;
}

// ============================================================
// INITIALIZATION
// ============================================================

function initOne(el: MyPropElement): void {
  if (el._d2fMyPropInit) return;
  el._d2fMyPropInit = true;

  // Implementation here
}

export function init(): void {
  document.querySelectorAll<MyPropElement>(`[${ATTR.ROOT}]`).forEach(initOne);
}

// ============================================================
// AUTO-INIT
// ============================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
```

### Step 3: Create `styles.css`

```css
/**
 * d2fprops / my-prop
 */

[data-d2f-my-prop] {
  /* Base styles */
}

.d2f-my-prop__element {
  /* Component styles */
}
```

### Step 4: Create `README.md`

```markdown
# d2fprops / my-prop

Description of what this prop does.

## Installation

\`\`\`html
<script defer src="https://cdn.jsdelivr.net/npm/d2fprops/dist/my-prop/my-prop.bundle.min.js"></script>
\`\`\`

## Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-d2f-my-prop` | Root marker | Required |
| `data-d2f-my-prop-option` | Description | `default` |

## Examples

\`\`\`html
<div data-d2f-my-prop>...</div>
\`\`\`
```

### Step 5: Build and test

```bash
npm run build
```

---

## Existing Props

### video

**Purpose:** Attribute-based video player with modal/inline playback

**Location:** `src/props/video/`

**Naming:** Supports both legacy (`data-vdo-*`) and new (`data-video-*`)

**Attributes:**

| Attribute (Legacy) | Attribute (New) | Purpose |
|--------------------|-----------------|---------|
| `data-vdo` | `data-video` | Root marker |
| `data-vdo-src` | `data-video-src` | Video URL |
| `data-vdo-mode` | `data-video-mode` | `modal` or `inline` |
| `data-vdo-autoplay` | `data-video-autoplay` | `1` or `0` |
| `data-vdo-muted` | `data-video-muted` | `1` or `0` |
| `data-vdo-ratio` | `data-video-ratio` | e.g., `16/9` |
| `data-vdo-poster` | `data-video-poster` | Custom poster URL |
| `data-vdo-play-toggle` | `data-video-play-toggle` | Elements to hide on play |

**Key implementation details:**
- Uses `getAttr()` helper to check new attribute first, then legacy
- Selects both `[data-vdo]` and `[data-video]` elements
- CSS targets both attribute selectors

---

## Build System

Uses **esbuild** via `build.js`. Auto-discovers props by scanning `src/props/`.

```bash
npm run build    # Build all props
```

### Outputs per prop:
- `dist/{prop}/{prop}.js` — IIFE for direct `<script>` use
- `dist/{prop}/{prop}.min.js` — Minified IIFE
- `dist/{prop}/{prop}.esm.js` — ES module for bundlers
- `dist/{prop}/{prop}.bundle.min.js` — JS with CSS auto-injected
- `dist/{prop}/{prop}.css` — Standalone styles
- `dist/{prop}/{prop}.min.css` — Minified styles

---

## Design Principles

1. **Zero dependencies** — Each prop works standalone
2. **Attribute-first** — All config via data attributes
3. **Backwards compatible** — Never break existing implementations
4. **Accessible** — Keyboard nav, ARIA, focus management
5. **Webflow-native** — Works in Designer, no code required
6. **Lazy loading** — Iframes use `loading="lazy"`
7. **No conflicts** — All classes/vars prefixed with `d2f-{prop}`
8. **Privacy-conscious** — YouTube uses `youtube-nocookie.com`

---

## Common Modifications

### Adding a new attribute to a prop

1. Add to the `ATTR` object
2. Read in `initOne()` using `el.getAttribute()`
3. Use the value in your logic
4. Update the prop's README.md

### Adding a new video provider (e.g., Vimeo)

1. Add URL detector: `isVimeoUrl()`
2. Add ID extractor: `getVimeoId()`
3. Add iframe builder: `buildVimeoIframe()`
4. Add condition in `play()` handler
5. Update video/README.md

---

## Testing Locally

1. Build: `npm run build`
2. Create `test.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="dist/video/video.css">
</head>
<body>
  <div data-vdo data-vdo-src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div>
  <script src="dist/video/video.js"></script>
</body>
</html>
```
3. Open in browser

---

## Publishing

```bash
npm version patch  # or minor/major
npm publish
```

Props become available at:
```
https://cdn.jsdelivr.net/npm/d2fprops/dist/{prop}/{prop}.bundle.min.js
```

---

## Checklist for New Props

- [ ] Created `src/props/{prop}/index.ts`
- [ ] Created `src/props/{prop}/styles.css` (if needed)
- [ ] Created `src/props/{prop}/README.md` with full documentation
- [ ] Used `data-d2f-{prop}` naming convention
- [ ] Used `d2f-{prop}` prefix for CSS classes
- [ ] Added auto-init pattern
- [ ] Added double-init prevention
- [ ] Updated main README.md with new prop
- [ ] Tested build: `npm run build`
- [ ] Tested in browser

---

## File Reference

| File | Purpose |
|------|---------|
| `src/props/{prop}/index.ts` | Prop logic |
| `src/props/{prop}/styles.css` | Prop styles |
| `src/props/{prop}/README.md` | User documentation |
| `src/index.ts` | Re-exports all props |
| `build.js` | Build script (esbuild) |
| `package.json` | Package config |
| `AI.md` | This file |
| `README.md` | Main user docs |
