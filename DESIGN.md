# Hearth Design System — SAATHI (साथी)

The **Hearth Design System** is the visual and interaction foundation of the SAATHI vocational counselling platform. It was custom-engineered to resonate deeply with rural Indian households, departing from sterile corporate blue/purple tech interfaces in favor of natural clay, terracotta, and warm earthen tones.

---

## 1. Design Philosophy

Rural families evaluating career decisions gather around communal hearths, courtyards, and kitchen tables. The visual language reflects:
- **Earthen Warmth & Dignity**: Terracotta, burnt sienna, and natural clay evoke pride in craft and hands-on skill trades.
- **Visual Distinction for Family Roles**: Students and parents have distinct, harmonious visual identities (Marigold vs. Forest Leaf).
- **Zero Gimmicks / No Purple Neon**: Generic corporate SaaS purple gradients (`#7c3aed`) are strictly prohibited.
- **Sunlight & Glare Resistance**: Warm parchment backgrounds (`#FFFDF9`) minimize harsh glare when viewed on mobile screens under direct sunlight in outdoor rural settings.

---

## 2. Color Palette & Semantic Tokens

### Core Brand Tokens

| Token | Light Mode Hex | Dark Mode Hex | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `#C4562B` (Terracotta) | `#D86A3E` | Main brand identity, primary CTAs, active highlights |
| `--color-primary-hover` | `#AF4A23` | `#E27E53` | Hover states on primary elements |
| `--color-primary-light` | `#F8EDE7` | `#32211B` | Soft badges, subtle highlights, active card borders |
| `--color-student` | `#EFA531` (Marigold) | `#F4B34C` | Student Window, aspirations, youth agency |
| `--color-student-light` | `#FDF4E5` | `#342817` | Student badge backgrounds, aspiration cards |
| `--color-parent` | `#2F7D5C` (Forest Leaf) | `#419B74` | Parent Window, security, consent verification |
| `--color-parent-light` | `#EBF4F0` | `#1B2F25` | Parent badge backgrounds, consent ledger |

### Neutral & Surface Tokens

| Token | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#FFFDF9` (Parchment) | `#171311` (Charcoal) | Base page background |
| `--color-surface` | `#FFFFFF` | `#1F1A17` | Elevated card surfaces |
| `--color-raised` | `#F9F4EE` | `#28211D` | Form inputs, secondary panels |
| `--color-border` | `#E8DDD2` | `#3D3430` | Structural dividers, card borders |
| `--color-text` | `#3A2E2A` (Umber) | `#F5EFEB` (Warm White) | Primary text (WCAG AAA contrast) |
| `--color-subtext` | `#6A5B55` | `#B8AAA3` | Supporting metadata, field labels |

### Status Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--color-success` | `#287A52` | Verified data badge, consensus reached, high confidence |
| `--color-success-bg` | `#EAF5EF` | Success notification and confirmation banners |
| `--color-error` | `#B83226` | Form validation errors, critical gaps, unaddressed worries |
| `--color-error-bg` | `#FDF2F0` | Error alert banners |

---

## 3. Typography System

SAATHI pairs an editorial serif for headings with a legible grotesque sans for content:

### Typefaces
- **Headings**: `Source Serif 4`, Georgia, serif — Conveys authority, constitutional credibility, and warmth.
- **Body & Data**: `Public Sans`, system-ui, -apple-system, sans-serif — High legibility across Devanagari and Latin scripts on low-DPI displays.

### Type Scale & Hierarchy

| Level | Font Family | Size (px) | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `h1` | `Source Serif 4` | 32–40px | 700 (Bold) | 1.15 | Main page headers, hero titles |
| `h2` | `Source Serif 4` | 24–28px | 700 (Bold) | 1.25 | Section headers, card titles |
| `h3` | `Source Serif 4` | 20–22px | 600 (Semi) | 1.3 | Sub-sections, modal headers |
| `body-lg` | `Public Sans` | 18px | 400 | 1.6 | Hero leads, important callouts |
| `body` | `Public Sans` | 16px | 400 | 1.6 | Standard paragraph body text |
| `body-sm` | `Public Sans` | 14px | 500 | 1.5 | Form labels, card descriptions |
| `caption` | `Public Sans` | 12px | 600 | 1.4 | Badges, tags, timestamps |

---

## 4. Geometry & Elevation

### Strict Border Radii Tokens
- **Buttons**: `rounded-[8px]` (`--radius-btn: 8px`)
- **Cards & Modals**: `rounded-[12px]` (`--radius-card: 12px`)
- **Form Inputs**: `rounded-[8px]` (`--radius-input: 8px`)
- **Badges**: `rounded-[6px]` (`--radius-badge: 6px`)

> **Strict Rule**: Pill buttons (`rounded-full` on buttons) are **forbidden**. All interactive action controls use structured squircle geometry adhering to `--radius-btn`.

### Focus States & Touch Targets
- **Focus Ring**: `0 0 0 2px #FFFDF9, 0 0 0 4px #C4562B` for keyboard navigation accessibility.
- **Minimum Touch Target**: Every interactive button, link, and input is styled with `min-h-[44px]` (and at least `38px` on extra compact 320px mobile) to ensure comfortable finger taps on inexpensive touchscreens.

---

## 5. UI Component Library

### `Button`
Available in 7 variants:
1. `primary`: Terracotta solid button with active feedback
2. `student`: Marigold accent for student actions
3. `parent`: Forest leaf accent for parent decisions
4. `secondary`: Warm parchment neutral button
5. `outline`: Clean 2px bordered button
6. `ghost`: Subtle hover-only background button
7. `danger`: Earthen red for destructive confirmations

### `Card` & `Modal`
- Clean parchment surface with 1px border (`#E8DDD2`) and soft elevation shadow (`--shadow-sm`).
- Fully accessible dialogs with background overlay, keyboard ESC dismissal, and focus trapping.

### `ConfidenceBadge`
Displays NCVET data source verification:
- `High` (Local District Tracer Data): Leaf green border and background
- `Medium` (Division / Neighboring District Data): Amber border and background
- `Low` (State-level Estimates): Terracotta border and background
- `Fallback` (Verified Regional National Catalog): Neutral sand border

### `NetworkStatusBar`
- **Online (4G/Wi-Fi)**: Hidden to avoid visual clutter.
- **Lite Mode (2G/3G)**: Amber banner notifying user that images and decorative effects are disabled to conserve data.
- **Offline**: Terracotta banner with live indicator showing number of queued mutations in IndexedDB.

---

## 6. Rural Accessibility & Bilingual UX

### Dual-Language Vertical Rhythm
Hindi Devanagari characters require slightly higher vertical line clearance than Latin characters. All text containers use `leading-relaxed` (`line-height: 1.6`) to prevent ascender/descender clipping on Devanagari conjuncts (e.g., `क्षत्रिय`, `प्रशिक्षण`).

### Lite Mode Transformations
When the device connects via 2G or low-bandwidth links:
1. All CSS transitions and animations are disabled (`transition: none !important; animation: none !important`).
2. Decorative SVGs and heavy illustrations are replaced with lightweight text badges.
3. Heavy background gradients revert to solid flat fills (`var(--color-bg)`).
4. WebRTC consult prompts offer immediate 1-click downgrade to 16 kbps Opus audio stream.
