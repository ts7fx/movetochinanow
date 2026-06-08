import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/*
 * Glossary content collection — the cjgeo landing contract.
 *
 * cjgeo emits a full styled 100KB page. The extractor (tools/cjgeo_extract.py
 * in the seo-geo repo) maps its semantic blocks onto THIS block model and drops
 * cjgeo's CSS/SVG/design. Content + structure survive; design comes from our
 * own component library (src/components/glossary/*) on the global.css tokens.
 *
 * One entry = one glossary entity page (e.g. Z visa, citizenship). Rendered by
 * src/pages/[...slug].astro. The entry id (filename) becomes the top-level slug.
 */

const proseBlock = z.object({
  type: z.literal('prose'),
  // sanitized inline HTML: <p>, <strong>, <a>, <ul>/<ol>/<li>, <em>
  html: z.string(),
});

const calloutBlock = z.object({
  type: z.literal('callout'),
  title: z.string().optional(),
  tone: z.enum(['info', 'warn', 'key']).default('info'),
  html: z.string(),
});

const compareBlock = z.object({
  type: z.literal('compare'),
  caption: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())), // cells may carry inline HTML
  highlightRow: z.number().int().optional(),
});

const checklistBlock = z.object({
  type: z.literal('checklist'),
  title: z.string().optional(),
  items: z.array(z.string()), // items may carry inline HTML
});

const faqBlock = z.object({
  type: z.literal('faq'),
  items: z.array(z.object({ q: z.string(), a: z.string() })),
});

const stepsBlock = z.object({
  type: z.literal('steps'),
  items: z.array(
    z.object({ title: z.string(), time: z.string().optional(), html: z.string() })
  ),
});

const cardsBlock = z.object({
  type: z.literal('cards'),
  items: z.array(
    z.object({ label: z.string(), value: z.string().optional(), note: z.string().optional() })
  ),
});

// Fallback: preserves cjgeo's inner HTML (design stripped) for any widget we
// don't yet have a dedicated component for. Content is never lost; upgrade to a
// real block type later. Keeps the extractor off the "variable-vocabulary" treadmill.
const rawBlock = z.object({
  type: z.literal('raw'),
  html: z.string(),
});

const block = z.discriminatedUnion('type', [
  proseBlock,
  calloutBlock,
  compareBlock,
  checklistBlock,
  faqBlock,
  stepsBlock,
  cardsBlock,
  rawBlock,
]);

const section = z.object({
  id: z.string(),                 // anchor target; must match a tocLinks href (minus '#')
  label: z.string().optional(),   // small eyebrow label above the title
  title: z.string(),
  variant: z.enum(['default', 'cream', 'navy', 'dark']).default('default'),
  blocks: z.array(block),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/glossary' }),
  schema: z.object({
    // --- SEO / head ---
    title: z.string(),                 // <title> + og:title
    description: z.string(),           // meta description + og:description
    canonical: z.string().url(),       // self-canonical (trailing slash!)
    // --- identity / schema ---
    entity: z.string(),                // breadcrumb name + DefinedTerm name
    definition: z.string(),            // the liftable "What is X?" sentence(s) -> DefinedTerm.description
    alternateNames: z.array(z.string()).default([]),
    // --- hero ---
    h1: z.string().optional(),         // hero H1 (defaults to title)
    heroBadge: z.string().optional(),
    heroSub: z.string().optional(),
    heroStats: z.array(z.object({ num: z.string(), label: z.string() })).default([]),
    heroDark: z.boolean().default(true),
    // optional photographic hero — art-directed crops (wide=desktop, tall=mobile),
    // duotone-toned + scrim applied by the Hero component. Local /img/ assets.
    heroImage: z.object({
      wide: z.string(),
      tall: z.string(),
      alt: z.string(),
    }).optional(),
    bylineDate: z.string(),            // e.g. "June 2026"
    // --- body ---
    // label = descriptive (on-page TOC + footer); nav = short one/two-word
    // header-nav label (the horizontal nav overflows with descriptive labels).
    tocLinks: z.array(z.object({
      label: z.string(),
      href: z.string(),
      nav: z.string().optional(),
    })),
    sections: z.array(section),
    // --- provenance (not rendered) ---
    cjgeoArtifact: z.string().optional(), // path to the cjgeo 10-final.html this was extracted from
    factcheck: z.enum(['pending', 'passed']).default('pending'),
  }),
});

export const collections = { glossary };
