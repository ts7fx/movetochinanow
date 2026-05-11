# movetochinanow.com — repo guide for Claude

Astro 5 + Tailwind 4 static site, hosted on Cloudflare Pages (auto-deploys on
push to `main`). Sister to `seresimmigration.com` (the business site). This
repo is the SEO content arm: long-form guides built to rank for high-intent
queries and funnel to `/consultation`.

## Pages

| Path | File | Purpose |
|---|---|---|
| `/` | `src/pages/index.astro` | China Green Card / PR overview — main SEO surface |
| `/china-residence-permit-guide/` | `src/pages/china-residence-permit-guide.astro` | TR vs PR long-form (Brief 3 in `gsc/cjgeo-briefs.md`) |
| `/consultation/` | `src/pages/consultation.astro` | Lead-capture form (excluded from sitemap) |
| `/thank-you/` | `src/pages/thank-you.astro` | Post-submit confirmation (excluded from sitemap) |

Sitemap auto-built via `@astrojs/sitemap` — only homepage + content guides are
indexed.

## Layout API (`src/layouts/Layout.astro`)

Every page renders through `<Layout>`. Props:

```ts
interface Props {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  ogType?: string;
  navLinks?: { label: string; href: string }[];      // Header nav anchor list
  footerSections?: { label: string; href: string }[]; // Footer "On This Page" column
  footerSectionsTitle?: string;                       // Override "On This Page" heading
}
```

- `navLinks` is rendered as the header nav. On home it defaults to the
  homepage's 6-anchor set; on non-home pages, omitting it hides the nav
  middle links entirely (only brand + CTA show).
- `footerSections` is rendered as the footer's left column ("On This Page" by
  default). Falls back to `navLinks`, then to the homepage default.
- The footer's "Other Guides" column is auto-generated from the `sitePages`
  array inside `Layout.astro`. **When adding a new content page, register it
  in that array** so cross-page links appear everywhere automatically.

## CSS architecture

Shared building blocks live in `src/styles/global.css`. Page-specific styles
go in the page's own `<style>` block.

**In global.css** (use these from any page):

- Containers: `.container` (1120px wide), `.container--narrow` (780px)
- Buttons: `.btn` + `.btn-primary` / `.btn-outline` / `.btn-navy`, modifier `.btn-lg`
- Hero: `.hero` (default navy), modifier `.hero--dark` (#1A1A1A), with
  `.hero-badge`, `.hero-badge-dot`, `.hero-sub`, `.hero-actions`,
  `.hero-stats`, `.hero-stat-num`, `.hero-stat-label`, `.hero-byline`
- TOC bar: `.toc-bar`, `.toc-inner`, `.toc-label`, `.toc-link`
- Sections: `.section` (80px 0 padding), modifiers `.section--cream` /
  `.section--navy` / `.section--dark`, plus `.section-label`,
  `.section-title`, `.section-lead`

**Page-scoped** (only put here what's unique to that page):

- e.g. residence permit guide has `.rp-callout`, `.rp-compare-grid`,
  `.rp-penalty-grid`, `.rp-path-flow`, `.rp-reg-grid`, `.rp-checklist`,
  `.rp-faq`, `.rp-cta-block` and a `.rp-guide` wrapper that paints the cream
  body background and sets local design tokens.

### Astro scoping gotcha — wrapper-class typography resets

If your page wraps content in `<article class="<page-slug>">` and uses that
wrapper to set article-wide typography (`color` on `h1/h2/p/a`), Astro's CSS
scoping appends `[data-astro-cid-*]` attribute selectors that push those
rules to specificity (0,2,0) — beating `.hero h1` (0,1,1) and `.btn-primary`
(0,1,0) in `global.css`. Result: invisible H1 on dark hero, red-on-red
button text. Wrapping the wrapper in `:where(.<page-slug>)` does **not** fix
it (Astro adds the data-cid outside the `:where()`).

**Fix:** at the end of the page's `<style>` block, explicitly re-assert
hero/CTA colors:

```css
.<page-slug> .hero h1 { color: #fff; }
.<page-slug> .hero .hero-sub { color: rgba(255,255,255,.75); }
.<page-slug> .hero .btn-primary,
.<page-slug> .rp-cta-block .btn-primary { color: #fff; }
.<page-slug> .hero .btn-outline { color: #fff; }
```

Verify in the browser console:
`getComputedStyle(document.querySelector('.hero h1')).color` → `rgb(255, 255, 255)`.

## Adding a new SEO content page (checklist)

1. Pick a brief from `gsc/cjgeo-briefs.md` (only on-service topics — see
   memory `feedback_only_seres_services.md`).
2. Run CJGEO manual flow (`/content-magic/new` → Determine Keyword →
   Benchmark → Edit Draft → Adopt → Copy HTML).
3. Fact-check the generated content against `seresimmigration.com/en/services/{pr,tr}`
   before injecting — CJGEO sources from competitors and may diverge from
   Seres's positioning on numbers and process.
4. Create `src/pages/<slug>.astro`:
   - Wrap content in `<article class="<page-slug>">` for CSS scoping.
   - Use global classes for hero (`.hero hero--dark` etc.), sections
     (`<section class="section"><div class="container--narrow">`), buttons,
     and section headers.
   - Add page-scoped `<style>` only for components that don't exist globally.
   - Set a `schemaGraph` const with `@graph: [orgNode, articleNode, faqNode]`
     and inject via `<script slot="head" type="application/ld+json">`.
   - Add the visible author byline matching the homepage: "By Seres
     Immigration's advisory team — US-trained attorneys and cross-border
     specialists based in Shenzhen, Shanghai, Fuzhou & California · Updated
     [date]".
5. Pass `navLinks` (your section anchors) and `footerSections` (same or
   fuller list) to `<Layout>`.
6. **Register the page in `sitePages` inside `Layout.astro`** so the footer
   cross-links pick it up automatically.
7. (Optional) Add one or two inline links from the homepage to the new page
   in contextually-relevant spots.
8. `npm run build` → verify, then commit and push. Cloudflare Pages
   auto-deploys.

## GSC tooling

`gsc/` contains a Node toolkit for querying Google Search Console — see
`gsc/CLAUDE.md`. Use `npm run snapshot` weekly to track ranking progress on
new pages.

## Verifying what's live in production

Every page renders three meta tags from `src/lib/build-info.ts` via
`Layout.astro`:

```html
<meta name="build-commit" content="463cdfe" />
<meta name="build-branch" content="main" />
<meta name="build-time" content="2026-05-11T11:56:59.876Z" />
```

Values come from Cloudflare Pages env vars `CF_PAGES_COMMIT_SHA` and
`CF_PAGES_BRANCH` in production, with a local `git rev-parse` fallback.

```bash
curl -s https://movetochinanow.com | grep build-commit
```

…tells you in one line which commit is currently live. Use this instead of
grepping bundled CSS or comparing Astro filename hashes.

## Git workflow

**Do not commit directly to `main`.** Cloudflare Pages auto-deploys `main`
to production on push, so unverified changes go straight to users.

1. Create a branch: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
2. Push the branch — Cloudflare Pages auto-builds preview URLs:
   - `https://<short-sha>.movetochinanow.pages.dev`
   - `https://<branch-slug>.movetochinanow.pages.dev`
3. `gh pr create` — the Cloudflare bot posts the preview URL as a PR comment.
4. Verify on the preview (visual + the `curl ... | grep build-commit` check).
5. **Squash merge** to `main` (single clean commit; branch auto-deleted).
6. `git checkout main && git pull --ff-only`, then re-curl prod to confirm
   the new SHA is live.

## Conventions

- Internal links to other movetochinanow pages: always use trailing slash
  (`/china-residence-permit-guide/`) to match Astro's static output.
- External links to seresimmigration.com: **avoid visible `<a>` tags** —
  Schema metadata (`Organization.sameAs`, `author/publisher @id`) only. The
  2026-03-05 commit removed all visible cross-domain anchors deliberately.
- Commits: each ship is one PR with one squashed commit; no batching
  unrelated changes. Pacing rule: one new content page at a time (see memory
  `feedback_pacing_one_at_a_time.md`).
