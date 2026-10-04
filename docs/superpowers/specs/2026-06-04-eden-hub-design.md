# Eden Family Hub — Design Spec (POC)

**Date:** 2026-06-04
**Status:** Approved (design); pending implementation plan
**Type:** Static proof-of-concept website

## Summary

A single-page static "family brand hub" for one client's three businesses:

- **Storehouse Market & Eatery** — restaurant / market (flagship; 813 Main Street, Bastrop, TX)
- **Eden East Farms** — farm
- **Soil to Table** — consulting business (new)

The hub tells the parent-brand story and presents the three locations on an interactive map. Visual style is faithful to the reference site **storehousebastrop.com**: austere monochrome editorial with one warm earthy accent.

## Goals

- Show all three businesses as one cohesive family.
- Interactive map with a clickable pin per location.
- On-brand look that visually matches Storehouse.
- Trivially deployable and hand-off-able (static files, no build, no API keys).

## Non-Goals (YAGNI for POC)

- No per-business sub-pages (hub-only).
- No CMS, forms, reservations, e-commerce, or backend.
- No real/verified addresses yet — placeholder coordinates near Bastrop.
- No custom domain / DNS setup.
- No analytics.

## Key Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Site purpose | Family brand hub (parent story + 3 locations + map) |
| Map | Real interactive map — Leaflet + OpenStreetMap (no API key) |
| Soil to Table location | Placeholder pin for now (all 3 placeholders near Bastrop) |
| Hub/brand name | Generic placeholder wordmark for now |
| Theme | Direction B — monochrome + one warm accent |

## Architecture

- **Pure static site.** No framework, no build step.
- Files:
  - `index.html` — markup / page structure
  - `styles.css` — theme tokens + layout
  - `script.js` — location data array + map init + card rendering
  - `assets/` — images / favicon (placeholder photography via Unsplash for POC is acceptable)
- **One external dependency, via CDN:** Leaflet JS + CSS, with OpenStreetMap tiles.
- Deploy: drag folder to Netlify / GitHub Pages / any static host.

## Page Structure (top → bottom)

1. **Announcement bar** — thin black strip, letter-spaced uppercase (e.g. "A FARM-TO-TABLE FAMILY · BASTROP, TEXAS").
2. **Hero** — placeholder wordmark (Oswald condensed uppercase) + tagline + em-dash button that scrolls to the map.
3. **Brand story** — 2–3 short placeholder paragraphs introducing the family.
4. **Map** — full-width interactive Leaflet map centered on Bastrop; 3 pins; clicking a pin opens a popup. Pins colored by accent palette to differentiate.
5. **Location cards** — three cards (one per business): name, type label (Eatery / Farm / Consulting), one-line blurb, address line, "— Get Directions —" (Google Maps link) and "— Visit Site —" link. Hovering a card may highlight its map pin (optional enhancement).
6. **Footer** — copyright + social placeholders.

## Data Model (single source of truth)

All three locations live in **one array of objects in `script.js`**, driving BOTH the map pins and the cards so the client edits one list:

```js
{ id, name, type, blurb, lat, lng, address, website, accentColor }
```

- Placeholder `lat`/`lng` near Bastrop, TX (~30.11, -97.32) for all three.
- **This array will be authored by the user** (learning-mode contribution) — it's the domain-knowledge core of the site.

## Theme Tokens

CSS custom properties:

- `--bg: #FFFFFF`
- `--ink: #0A0A0A`
- `--muted: #5E5E5E`
- `--accent: #9C5B3B` (terracotta)
- `--accent-2: #6B7A4F` (olive)

Typography (Google Fonts):

- Display: **Oswald** — condensed, uppercase, heavy letter-spacing (close free match to Storehouse wordmark).
- Body: **Inter**.

Signature details to honor the reference:

- Em-dash–flanked button labels (`— Explore —`).
- Heavy letter-spacing on uppercase headings.
- Thin 1px outlined buttons.
- Black announcement bar.
- Warmth comes from photography, not UI color.

## Success Criteria

- Page loads as static files with no server/build.
- Map renders centered on Bastrop with 3 distinguishable, clickable pins.
- Three location cards render from the same data array as the pins.
- Look reads as a sibling of storehousebastrop.com.
- A non-technical owner can update the location list in one place.

## Open Items (deferred, not blocking)

- Real addresses/coordinates for Eden East Farms and Soil to Table.
- Final brand/parent name and wordmark/logo.
- Real photography and brand copy.
- External website URLs for each business.
