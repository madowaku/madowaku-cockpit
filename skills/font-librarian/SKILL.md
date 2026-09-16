---
name: font-librarian
description: Select, reuse, integrate, and review UI fonts and typography assets with local-system, licensing, loading, fallback, and legibility constraints. Use when adding, replacing, auditing, or troubleshooting product typography.
metadata:
  short-description: Reuse-first font and typography integration
---

# Font Librarian

Treat typography as a system dependency, not a decorative swap. Reuse the product's existing type assets and tokens before introducing another family, weight set, variable font, or external font service.

## Establish the local type system first

Inspect the target project for:

- installed or bundled font files and packages;
- CSS `font-family` stacks and framework theme configuration;
- typography tokens for family, size, weight, line height, tracking, and optical sizing;
- variable-font usage and configured axes;
- nearby heading, body, label, code, and numeric styles;
- fallback fonts and language/glyph requirements;
- font loading, preload, caching, and `font-display` behavior where relevant;
- licensing or redistribution notes already present in the project.

Local conventions outrank generic font preferences.

## Selection loop

1. **Name the typographic job.** Identify whether the need is body readability, compact UI labeling, display hierarchy, code, numeric data, multilingual coverage, branding, or another concrete role.
2. **Reuse existing families first.** Prefer an existing family, weight, width, or variable axis before adding another typeface.
3. **Check glyph and language coverage.** A visually attractive font is unsuitable if required scripts, punctuation, symbols, or numerals are incomplete.
4. **Check metrics and fallback behavior.** Avoid swaps that cause avoidable layout shift, clipping, broken controls, or inconsistent line boxes.
5. **Minimize delivery cost.** Prefer the smallest necessary files, weights, styles, subsets, or variable-font configuration that satisfies the job.
6. **Check licensing.** Confirm that web embedding, app bundling, redistribution, or commercial use matches the project's intended distribution.
7. **Integrate through tokens.** Add or change typography through the project's existing theme or token layer when available instead of scattering ad hoc declarations.
8. **Verify in context.** Review real interface copy at supported sizes, weights, themes, languages, and responsive widths relevant to the change.

## Dependency and loading discipline

Do not add a font package or external font host merely for a small stylistic difference. Before adding one, determine whether:

- the current family has an unused weight or axis that solves the problem;
- system fallbacks are acceptable for the role;
- a local bundled file is already available;
- the additional files materially increase page/app startup cost;
- preload or subset changes are required;
- the font source and license fit the deployment model.

Do not assume an external CDN or hosted font service is acceptable in privacy-sensitive, offline, local-first, or packaged applications.

## Accessibility and readability

Preserve readable line height, text scaling, zoom behavior, contrast, and clear differentiation of interactive or status text. Avoid using very light weights, condensed faces, all-caps, or tight tracking where they reduce legibility at actual UI sizes. Do not encode critical distinctions through typography alone when another semantic cue is needed.

## Output expectations

When implementing or reviewing typography work, report compactly:

- typographic job;
- existing families/tokens discovered;
- family/weight/axis reused or added;
- glyph/language considerations;
- loading or bundle impact;
- licensing consideration when a new asset is introduced;
- rendered verification performed.

Do not claim improved readability or layout stability without checking representative rendered text or equivalent supplied evidence.