# movetochinanow.com — Content Expansion Plan (Phase 1)

> Intent: hand this file to a fresh Claude Code session in this directory and say "execute plan.md". The plan assumes the executor has browser-automation access (Claude in Chrome MCP) and local code access to this repo.

---

## 1. Context (why we're doing this)

This site is a **lead-gen funnel** for Seres Immigration (the only consultancy focused 100% on Westerners relocating to China). The site is currently a **single long-form guide** at `/` with 10 anchored sections. Secondary pages (`/consultation`, `/thank-you`) are forms and are excluded from the sitemap.

GSC data (2026-03-16 → 2026-04-20, 36 days since site went live):

- **Impressions**: 5,866
- **Clicks**: 13
- **CTR**: 0.22%
- **Avg position**: 5.5
- **Indexed pages with impressions**: exactly 1 (the homepage `/`)
- **Position distribution** (150 named queries): **69 on pos 1-3, 55 on pos 4-10** → 124/150 queries rank page 1
- **Velocity**: week 1 ~91 imp/day → week 5 ~256 imp/day (still accelerating)
- **Geo CTR anomaly**: US 0.11% (2822 imp), China 3.12% (192 imp) → title/snippet is failing US users
- **Device CTR**: Mobile 0.42%, Desktop 0.18% → desktop users stop and read the snippet, don't click

**Root cause of low CTR**: one URL is forced to serve 150 different user intents. Google ranks the homepage page-1 for all of them, but the generic title/snippet matches no specific intent well. Solution: create dedicated pages matching the top query clusters.

## 2. Goal

Split the current single-page guide into a **hub + N dedicated topic pages** where each topic page is written against a specific GSC query cluster. Expected effect: CTR on targeted clusters rises from 0.22% → 2-3% (position-5 industry median), producing ~5-8× the click volume at the same impressions.

**Explicitly not a goal**: acquiring new keywords outside the current GSC-confirmed clusters. Phase 1 is about converting existing impressions, not chasing new ones.

## 3. Hard constraints

- **Stack**: Astro 5.17 + Tailwind 4 + `@astrojs/sitemap`. Do not swap frameworks.
- **Brand**: "Seres Immigration" in header/footer; `movetochinanow.com` is the domain only.
- **CTA**: every new page must embed at least one `<a href="/consultation" class="btn btn-primary">` call-to-action (this is the revenue event).
- **Layout**: every new page uses `src/layouts/Layout.astro` — do not create a second layout.
- **FAQ schema**: Phase 1 pages each embed their own page-specific FAQPage JSON-LD schema. Remove the matching Q&A entries from the homepage's FAQ schema to avoid duplicate structured data.
- **Do not touch**: `/consultation`, `/thank-you`, `src/layouts/Layout.astro`, `astro.config.mjs`, `src/styles/global.css`. Only add new pages under `src/pages/` and edit `src/pages/index.astro` per Section 7.
- **URL style**: **exact-match long-form, trailing slash, lowercase, hyphenated, no stopword removal.** Example: `/china-permanent-residency-requirements-for-foreigners-2026/`. This is the user's explicit preference.
- **Language**: English only for page content (site is English-first). Non-English queries in GSC are collateral; don't build non-English pages in Phase 1.
- **Build green**: `npm run build` must succeed with no errors before the plan is considered done.

## 4. Phase 1 pages (3 pages, selected from GSC query clusters)

Phase 1 covers ~55-60% of current GSC impressions with 3 pages, each targeting a **distinct user intent** (general PR requirements, spouse route, citizenship). Rationale: smaller batch = faster signal from GSC after launch. Phase 2/3 triggered only after Phase 1 shows measurable CTR uplift (see Section 9).

**Critical anti-pattern avoided**: "permanent residency" and "green card" queries both refer to the same legal status (the Chinese Permanent Residence Permit / Five-Star Card). Making them two separate pages would cause keyword cannibalization — Google wouldn't know which to rank, and both would rank worse. Page A uses both terms interchangeably in content; the slug uses `permanent-residency` because that's the higher-volume formal term.

The three pages below represent **three truly distinct user intents**:

- Page A = "what are the requirements" (covers both "permanent residency" and "green card" terminology — they mean the same thing in China context; DO NOT split into two pages, that causes keyword cannibalization)
- Page B = "I am married to a Chinese citizen" (distinct life situation, highest-LTV audience)
- Page C = "how do I become a Chinese citizen" (**citizenship ≠ permanent residence**; users frequently confuse the two, so a dedicated page both disambiguates and captures the citizenship-specific GSC cluster)

### Page A — `/china-permanent-residency-requirements-for-foreigners-2026/`

**Target query cluster (aggregate ~430 GSC impressions — combines "permanent residency/residence" + "green card" variants, which are synonymous):**

General "requirements" variants (~300 imp):

| Query | Imp | Pos |
|---|---|---|
| china permanent residency requirements for foreigners 2026 | 105 | 2.67 |
| china permanent residence permit requirements for foreigners 2026 | 53 | 3.94 |
| china permanent residence permit for foreigners requirements 2026 | 52 | 4.83 |
| china permanent residency requirements 2026 | 43 | 3.56 |
| china permanent residency for foreigners requirements 2026 | 39 | 3.23 |
| china permanent residence permit requirements 2026 | 20 | 6.75 |
| china permanent residence for foreigners requirements 2026 | 18 | 2.94 |
| china permanent residence green card requirements 2026 | 18 | 1.72 |
| china permanent residence requirements for foreigners 2026 | 14 | 3.79 |

"Green card" terminology variants (~130 imp, same underlying intent):

| Query | Imp | Pos |
|---|---|---|
| green card china | 33 | 9.03 |
| china green card | 25 | 17.52 |
| china chinese green card | 23 | 42.61 |
| how to get chinese green card | 13 | 6.69 |
| how to get a chinese green card | 11 | 1.55 |
| chinese green card | 11 | 15.36 |
| china green card requirements 2026 | 10 | — |
| how to get china green card | 11 | 11.09 |
| how to get green card in china | 6 | — |
| chinese greencard / china greencard / greencard china (typos) | ~10 | — |

**Page H1**: `China Permanent Residency Requirements for Foreigners (2026)`
**Title tag**: `China Permanent Residency (Green Card) Requirements 2026 | Seres`
**Meta description**: must contain "requirements", "2026", and "green card" (to capture the synonym cluster). Mention the 4 pathways (professional / spouse / investor / long-stay). ≤ 155 chars.
**Intent**: informational — user wants the *full requirements list*. Cover all 4 pathways but keep the spouse section brief and link out to Page B. Do NOT split citizenship content into this page — link out to Page C instead.
**Terminology handling**: explicitly state in the first 100 words that "China green card" = "Chinese permanent residence permit" = "Five-Star Card". Use both terms interchangeably throughout the body so the page ranks for both synonym sets without needing two pages. Slug stays `permanent-residency` (the more formal term with higher query volume) rather than `green-card`.
**Primary heading pattern**: H2 per pathway with H3 per requirement.
**"Green card" queries currently rank worse (pos 9-42) than "permanent residency" queries (pos 2-5)** — a single well-optimized page that uses both terms should close this gap; cannibalization from two pages would likely make both rank worse.

### Page B — `/china-permanent-residence-for-foreign-spouse-of-chinese-citizen-requirements-2026/`

**Target query cluster (aggregate ~60 GSC impressions, high intent):**

| Query | Imp | Pos |
|---|---|---|
| china permanent residence for foreign spouse of chinese citizen requirements 2026 | 34 | 6.85 |
| china residence permit for foreign spouse of chinese citizen requirements 2026 | 11 | 6.82 |
| china permanent residence for foreign spouse requirements 2026 | 6 | — |
| china permanent residence for foreign spouse of chinese citizen requirements 2025 or 2026 | 5 | — |
| china residence permit for spouse of chinese citizen requirements 2026 | 2 | — |
| china permanent residence permit for foreign spouse of chinese citizen requirements 2026 | 2 | — |

**Page H1**: `China Permanent Residence for Foreign Spouses of Chinese Citizens (2026)`
**Title tag**: `China Permanent Residence for Spouse of Chinese Citizen 2026 | Seres`
**Meta description**: explicitly mention 5-year marriage + 5-year residence + 200k RMB bank requirement. This trio is what the searcher is checking.
**Intent**: commercial-adjacent — users at this page are often *eligible and evaluating whether to apply*. Highest-LTV audience in Phase 1. CTA prominence matters more than on Page A.
**Page-level FAQ**: at least 6 Q&A covering processing time, renewal rules, divorce impact, child implications, proof of marriage requirements, and the permanent-residence-vs-citizenship distinction (link out to Page C on the latter).
**Scope boundary**: this page is about the PR route for spouses. Citizenship-by-marriage queries ("china citizenship by marriage requirements 2026") go on Page C, not here — but cross-link in both directions.

### Page C — `/china-citizenship-requirements-for-foreigners-2026/`

**Target query cluster (aggregate ~50 GSC impressions — covers the citizenship/naturalization intent, which is DISTINCT from permanent residence):**

| Query | Imp | Pos |
|---|---|---|
| china citizenship requirements for foreigners 2026 | 24 | 2.75 |
| china naturalization requirements for foreigners 2026 | 7 | — |
| china citizenship by marriage requirements 2026 | 7 | — |
| chinese citizenship requirements for foreigners 2026 | 6 | — |
| china citizenship naturalization requirements for foreigners 2026 | 6 | — |
| chinese citizenship | 1 | — |
| is it hard to get chinese citizenship | 1 | — |

**Page H1**: `China Citizenship Requirements for Foreigners (2026): Naturalization Explained`
**Title tag**: `China Citizenship Requirements for Foreigners 2026 | Seres`
**Meta description**: lead with the key distinction — *"Permanent residence is not citizenship. Here's what naturalization actually requires and why almost no one gets it."* ≤ 155 chars.
**Intent**: informational + disambiguation. Many users searching "china citizenship" actually want PR; this page clarifies the difference AND answers the citizenship question honestly.
**Critical content point**: China rarely grants citizenship to foreigners (fewer than ~10,000 naturalized foreigners total historically). Be honest about this. The page's value is not "here's how" but "here's what the law says and what it means for you in practice" — then redirect the user to the realistic path (PR via Page A, or spouse PR via Page B).
**Scope boundary**: this page covers *citizenship specifically*. Permanent residence content belongs on Page A. The pages must cross-link: Page A has a "Are you looking for citizenship instead?" callout linking to Page C; Page C has a "Most foreigners pursue permanent residence instead" callout linking to Page A.
**Page-level FAQ**: at least 6 Q&A covering the citizenship law basis, dual citizenship rules (China does not recognize it), citizenship-by-marriage reality, required renunciation of original citizenship, processing timeline, and difference from PR.

## 5. Content sourcing workflow (CJGEO via Claude in Chrome)

CJGEO has **no public API**. The executor must drive it via Claude in Chrome MCP (`mcp__claude-in-chrome__*`). The user has already logged in at `https://cjgeoai.com/content-magic` on their local Chrome and the Claude extension is connected.

### 5.1. CJGEO configuration (verify, don't recreate)

- **ICP** (under `/icps`): use the existing "Western Expats & Retirees Seeking China Relocation". Do NOT create a new ICP.
- **Offer** (under `/offers`): use the existing "Free Relocation Consultation". Do NOT create a new Offer.

Executor: before creating a new article, navigate to `/icps` and `/offers` and confirm both exist. If missing, stop and ask the user.

### 5.2. Per-page generation procedure

For each of Page A, Page B, Page C — repeat this procedure:

1. `mcp__claude-in-chrome__navigate` to `https://cjgeoai.com/content-magic`
2. Click **"Full Agentic Creation"** button (this was visible as ref_13 on the main content-magic page).
3. In the creation dialog, input:
   - **Article title**: use the Page H1 from Section 4 above.
   - **Main keyword**: use the top-impression query from that cluster (e.g. for Page A: `china permanent residency requirements for foreigners 2026`).
   - **ICP**: "Western Expats & Retirees Seeking China Relocation".
   - **Offer**: "Free Relocation Consultation".
   - **Example page layout** (optional): for Phase 1, **skip** — let CJGEO propose its own layout. We'll refine via the Research+Optimize loop.
4. Let CJGEO run **Research and Plan** (5 steps): Main Keyword, Benchmark Competitors, Research Keywords (SEO), Research Prompts (GEO), Research Internal Links (optional — skip in Phase 1).
5. Proceed to **Edit Draft**. Wait for the draft to generate.
6. Click **Refresh SEO score** and **Refresh AI score**. Target: both ≥ 70. Iterate on Implement Topics / Implement Prompts / Implement Keywords until both scores meet target, max 3 iterations. If scores plateau below 70, save what you have and annotate in the commit message.
7. Click **Copy HTML to clipboard**.
8. Extract the copied HTML (use `mcp__claude-in-chrome__javascript_tool` to read clipboard content if the browser blocks paste-back; otherwise fetch HTML via the editor's `.content` selector).

**Fallback**: if CJGEO's Full Agentic Creation breaks mid-way (credit exhaustion, generation timeout, UI regression), the executor should:
  - Save the partial draft.
  - Post a summary in conversation: "CJGEO Page X failed at step Y; partial HTML saved to `content-drafts/page-X-partial.html`."
  - Stop. Do not silently patch around the failure.

### 5.3. Credit budget

User currently has **1,199 wallet credits**. Assume each "Full Agentic Creation" + 2-3 optimization passes consumes 30-80 credits. Phase 1 (3 pages × ~100 credits buffer) should land under 300 credits. If credit consumption in any single article exceeds 200 credits, stop and ask the user before continuing to the next page.

## 6. Code workflow (Astro page creation)

For each page, after CJGEO HTML is obtained:

### 6.1. Create the page file

Path pattern: `src/pages/<exact-match-slug>.astro` — but **use a directory with `index.astro`** to produce the trailing-slash URL without messing with Astro's build config:

```
src/pages/china-permanent-residency-requirements-for-foreigners-2026/index.astro
src/pages/china-permanent-residence-for-foreign-spouse-of-chinese-citizen-requirements-2026/index.astro
src/pages/china-citizenship-requirements-for-foreigners-2026/index.astro
```

### 6.2. Page template skeleton

```astro
---
import Layout from '../../layouts/Layout.astro';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    // Page-specific Q&As (min 4, recommended 6-8)
  ]
};
---

<Layout
  title="<title-tag-from-Section-4>"
  description="<meta-description-from-Section-4>"
  canonical="https://movetochinanow.com/<slug>/"
  ogType="article"
>
  <script slot="head" type="application/ld+json" is:inline set:html={JSON.stringify(faqSchema)}></script>

  <article class="section">
    <div class="container" style="max-width: 860px;">
      <h1 class="text-balance"><page-h1></h1>
      <!-- CJGEO HTML body pasted here, with H1 stripped (we use the explicit H1 above) -->
      <!-- CSS classes from CJGEO MUST be removed if they conflict with global.css —
           use only semantic HTML + existing utility classes from global.css. -->

      <!-- CTA band (required) -->
      <aside class="cta-band" aria-label="Book consultation">
        <h2>Not sure if you qualify? Talk to Seres.</h2>
        <p>30-minute free consultation with our Shenzhen-based team.</p>
        <a href="/consultation" class="btn btn-primary btn-lg">Book Free Consultation</a>
      </aside>
    </div>
  </article>
</Layout>
```

### 6.3. Post-creation checks per page

1. Run `npm run build`. Fix any Astro / Tailwind errors before moving on.
2. Run `npm run preview` locally. Open the new URL in a browser (or use Claude in Chrome to verify). Confirm:
   - H1 renders once only.
   - `/consultation` CTA renders and is clickable.
   - No JS console errors.
   - FAQ schema validates (paste rendered HTML into https://validator.schema.org — executor can fetch with WebFetch).
3. Verify the URL appears in `dist/sitemap-index.xml` / `dist/sitemap-0.xml` after build (the `@astrojs/sitemap` filter excludes only `/consultation` and `/thank-you`, so new pages should be auto-included).

## 7. Homepage changes (`src/pages/index.astro`)

The homepage stays as the hub, but three changes are required to avoid duplicate-content penalties:

1. **Shorten the relocated sections to ~30-40% of their current length.** Each relocated section ends with `<p class="more-link"><a href="/<slug>/">Read the full guide →</a></p>`.
   - Section `#who-qualifies` → link to Page A (general PR requirements / green card)
   - The spouse content currently nested inside `#who-qualifies` → extract as its own short teaser, link to Page B
   - Add a new brief section "China Citizenship vs. Permanent Residence" near the end of the page (before FAQ), establishing the distinction and linking to Page C
2. **Remove from homepage FAQ schema** any Q&A items that are now duplicated on Pages A/B/C. Each Q&A lives in exactly one place.
3. **Update the TOC bar** (line 103-118 of current `index.astro`): add 3 new TOC links pointing to the new pages (e.g. "Full Requirements Guide", "Spouse Route", "Citizenship vs. PR") alongside the existing anchor links, so they read as deeper resources, not duplicates.
4. **Update footer links in `src/layouts/Layout.astro`** — NO. Per constraints, don't touch Layout. Homepage `<nav>` inside the page body can link into new pages if desired, but this is optional polish, not Phase 1 scope.

## 8. Acceptance criteria (Phase 1 complete when)

- [ ] 3 new `.astro` pages exist under `src/pages/<slug>/index.astro`
- [ ] Each page uses `Layout.astro`, has a page-specific FAQ JSON-LD schema, and contains a `/consultation` CTA
- [ ] Each page's canonical URL uses the exact-match long slug and trailing slash
- [ ] Homepage (`index.astro`) has the 3 relocated sections shortened with "Read full guide →" links
- [ ] Homepage FAQ schema has no Q&A duplicated on new pages
- [ ] `npm run build` passes with zero errors and zero warnings that weren't present before
- [ ] `dist/sitemap-0.xml` contains all 3 new URLs
- [ ] All 3 new URLs return HTTP 200 and render correct `<title>` when previewed locally
- [ ] One commit per new page + one final commit for homepage edits + one commit for any schema adjustments (4-5 commits total). Commits follow the existing repo convention (look at `git log --oneline` before committing).
- [ ] Push to remote only if the user explicitly asks. Default: leave on local branch.

## 9. Post-launch validation (NOT part of Phase 1 execution)

After Phase 1 ships and is deployed (Cloudflare Pages), the **user** will run this validation — executor does not do this:

- **2 weeks post-launch**: use `tenmomo-gsc` scripts (with `GSC_SITE_URL=sc-domain:movetochinanow.com`) to pull GSC data. Check:
  - Do the 3 new URLs appear in Pages data?
  - For the 3 target query clusters, is the top-ranking URL now the new page (not the homepage)?
  - Has click volume on those clusters increased?

Phase 2 goes only if: (a) new pages are indexed, AND (b) at least one of the 3 clusters shows CTR > 1%. Otherwise diagnose CTR issue (title? snippet? content fit?) before adding more pages.

## 10. Open decisions (ask user before executing)

The executor should raise these questions in chat at the start of the run, and wait for answers before proceeding:

1. **Internal linking**: should Pages A/B/C link to each other? Recommendation: yes, contextual inline links (e.g. "If you're married to a Chinese citizen, see our [spouse route page]"). Confirm?
2. **Content-drafts staging**: save each CJGEO HTML export to `content-drafts/page-A.html` etc. before pasting into Astro? Useful for recovery. Recommendation: yes. Confirm?
3. **Commit strategy**: one commit per page, or one PR-sized commit for Phase 1? Recommendation: one commit per page for review-ability. Confirm?
4. **Deployment**: merge / push is NOT in scope for the executor. Confirm: executor finishes at local `main` branch, user pushes manually.
5. **CJGEO score plateau**: if SEO+AI scores plateau below 70 after 3 iterations, accept and ship, or stop and ask? Recommendation: accept and ship (Phase 1 is about shipping for data, not perfection). Confirm?

## 11. Out of scope (do NOT do in Phase 1)

- Building non-English pages (Spanish, German, Russian, Chinese — handle in a separate Phase after Phase 1 data validates the model).
- Creating new ICPs or Offers in CJGEO.
- Adding new features to `/consultation` form.
- Changing `Layout.astro`, `global.css`, or `astro.config.mjs`.
- Adding analytics, A/B testing, or tracking scripts beyond existing GA.
- Rewriting homepage content beyond the 3 specified shortenings.
- Creating images / custom illustrations (use CJGEO-embedded imagery if any; otherwise text-only).
- Setting up Cloudflare Pages deployment or DNS changes.
- Any optimization of `/consultation` or `/thank-you`.
- Building additional topic pages (investment route detail, documents checklist, application process walkthrough, timeline/costs deep-dive, benefits page, PR-vs-work-visa comparison, etc.) — that is Phase 2/3 scope, triggered only after Phase 1 CTR data validates the approach.

## 12. Executor kickoff checklist

Before running this plan, verify:

- [ ] `pwd` is `/home/dev/web/movetochinanow`
- [ ] `git status` is clean
- [ ] `git branch --show-current` — create a new branch `phase-1-content-expansion` before starting work
- [ ] `mcp__claude-in-chrome__tabs_context_mcp` returns a tab where `cjgeoai.com` is logged in
- [ ] `npm install` has run (check `node_modules` exists)
- [ ] `npm run build` passes on a clean checkout (baseline should be green)
- [ ] User has confirmed the 5 open decisions in Section 10

If any check fails, stop and ask the user. Do not proceed with partial preconditions.
