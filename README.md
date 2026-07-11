# 🧱 Build Guides

A step-by-step decision-making PWA, visualised as building with lego bricks.
First guide: **Building a House** (21 branching decisions, from an existing
structure/knockdown decision through to budget).

Live idea: each guide walks you through one real-world design process one
decision at a time. Every choice shows its pros and trade-offs before you
commit, and a brick drops into a "build tray" as you go — so by the end you
have both a finished decision (a build sheet) and a visual record of how you
got there.

## What's new: visual walkthroughs, a live house graphic, and quick preview

- **Animated stage intros** — some steps (existing structure/knockdown, the
  land, foundation, roof) open with a short auto-playing sequence of SVG
  frames with captions (e.g. lot → easement line drawing in → slope arrow)
  before you're asked to decide. Tap "Skip ▸▸" to jump ahead, "Replay ↻" to
  watch again.
- **A live house graphic** builds up above the brick tray as you answer
  steps — existing structure → cleared lot → foundation → walls → windows →
  roof → any extras (pool, sauna, tennis court, tree growing through the
  roof, doubled battery storage). It also appears (smaller) on the home
  card and (bigger) on the summary/build-sheet screen.
- **⚡ Quick preview** on the home card fills every step with a sensible
  default answer and auto-plays through the whole guide as a hands-off
  storyboard, with "Skip to build sheet" at any point. Good for seeing the
  whole shape of the guide before committing to answering it yourself.
- **Multi-select steps** — the new "Extras & lifestyle features" step lets
  you tick more than one option (pool, sauna, tennis court, etc.) and hit
  Continue when done, instead of the usual tap-one-and-advance flow.
- **Instruction-manual page layout** — each step now looks like a page from
  a physical LEGO booklet: a page-number badge, a dotted "paper" background,
  and the options shown as a numbered strip of clickable "parts." Tap a
  part to open its detail callout (pros/cons + the build/add button) below
  the strip — only one part's detail is open at a time, same as flipping
  between callouts in a real manual.
- **Tappable parts on the picture itself** — the illustration isn't just
  decorative: every drawn piece (foundation, walls, windows, roof, sun
  icon, each extra) is a hotspot. Tap one to open a detail sheet for that
  decision, with a "Change this →" shortcut straight back into that step.
  Works on both the in-progress graphic and the finished build-sheet one.
- The guide now assumes there's **already a house on the land** — the first
  step is a knockdown/demolition decision with its own animated walkthrough.

---

## The construction flip-book ("📖 See how it's built")

Separate from the decision guide, there's now a page-by-page picture book
of the physical build happening: demolition → site clearing → easement
survey → leveling → excavation → foundation pour → framing → roof framing
→ roofing → windows/doors → cladding → plumbing/electrical rough-in →
insulation → drywall → paint & fixtures → landscaping (reflects any extras
you picked) → move-in day. 17 pages, Prev/Next to turn them, dots show
progress. It's purely narrative — no choices to make, just the story of
how a house actually goes up.

This lives in `modules/house.js` as `HOUSE_MODULE.storyboard`, a separate
array from `steps`. Each page is `{ id, title, caption, svg }`, where `svg`
is either a literal SVG string or a `function(choices) => svgString` (only
the landscaping page uses this, to show your chosen extras). All the
figures reuse one shared `worker(x, y, vestColor)` helper defined at the
top of that block, so the art style stays consistent — add a new page by
calling `storyboard.push(page(id, title, caption, sceneSVG))` with a new
scene built from `worker(...)` plus whatever props/tools you add around it.

## Staged structure & the wider feature set

The 24 decisions are now grouped into 8 numbered stages, shown as a banner
above each page ("STAGE 2/8 — Architectural Design"):

1. **Understanding the Codes** — zoning, land, climate, orientation, lot setting
2. **Architectural Design** — bedroom count, storeys (1 or 2), extras
   (pool, sauna, gym, tennis court, tree-through-the-house, garage, home
   office, outdoor kitchen, guest suite, extra battery storage), a
   feature-positioning step with tips specific to whichever extras you
   picked, floor plan, and room/sunlight layout
3. **Demolition** — what's on the land today
4. **Site Clearing & Setup**
5. **Foundation & Structure**
6. **Building the Envelope** — roof, walls, windows
7. **Building the Systems** — insulation, HVAC, plumbing/electrical
8. **Final Planning** — budget

`HOUSE_MODULE.stageNames` maps stage numbers to display names; each step
carries a `stage` number. Add a new stage by adding an entry to that map
and giving new steps that stage number — the banner picks it up
automatically.

The storyboard flip-book is similarly flexible: pages can carry a
`showIf(choices)` function, so e.g. the "digging & lining the pool" page
only appears if you picked a pool, and "framing the second storey" only
appears for a two-storey build. It ranges from 17 pages (nothing extra,
one storey) up to 23 (everything selected, two storeys) — verified both
ends of that range in testing.

## The 3D LEGO look (iso.js)

Everything visual — the live house model, the home-card thumbnail, and
every flip-book page — is now drawn in isometric ("2:1") projection via
`iso.js`, a small dependency-free SVG library loaded before the module
files. It draws real LEGO-style pieces: three shaded faces per box (top
lit, left-side lit, right-side shadowed), studs on exposed top faces,
brick/wood/panel coursing lines baked into the wall texture, four roof
shapes (gable/hip/shed/flat) with tile/metal/shingle line patterns, a
minifig-style worker figure, and a manual-style drop arrow for the
flip-book's "new part arrives" moments.

- **`window.ISO.scene(originX, originY, unit)`** returns a drawing
  context bound to that origin/scale, with `.box`, `.flat`,
  `.gableRoof`/`.hipRoof`/`.shedRoof`/`.flatRoof`, `.windowLeft`/
  `.doorLeft`/`.doorRight` (face decals), `.tree`, `.arrow`, `.shadow`.
  All coordinates are grid units in a right-handed 3D system (+x
  right-ish, +y left-ish, +z up); `.pt(x,y,z)` projects to screen space
  if you need it directly.
- **`window.ISO.minifig(x, y, scale, torsoColor)`** draws a simple
  LEGO-style worker at a screen position (not grid-projected — it's
  meant to be composed after projecting an anchor point with `.pt`).
- **Materials actually change the render**: `exterior_cladding` picks
  the wall color *and* texture (brick coursing, wood planks, stucco
  smooth, fiber-cement panels); the new `roof_material` step (tiles,
  metal, shingles — Stage 6, right after roof pitch) picks the roof
  color and line pattern; `structural_system` tints exposed framing in
  the storyboard's framing pages.
- The **live house model** (`buildHouseSVG` in `index.html`) and the
  **storyboard** (`buildScene` in `modules/house.js`) are separate
  functions that both call into `iso.js` — the storyboard draws a
  *cumulative* build state per page (bare plate → slab → frame → walls
  → roof → finished) with the newest piece marked by a drop arrow, LEGO
  manual-style; the live model always reflects your current choices in
  one static "already built" view.
- Hotspots are preserved exactly as before — every drawn group is still
  tagged `data-step="..."` and tappable for its detail sheet.

If you add a new module and want the same treatment, `iso.js` is
generic (doesn't know anything about houses) — write your own
`buildScene`/`buildXSVG` function against it, the way `modules/house.js`
does.

## Zooming in, and the wall cutaway

The live model and the finished build-sheet model both support:

- **Pinch-to-zoom** (touch), **scroll-wheel zoom** (desktop), or the
  **+ / – / ⤢ reset** buttons in the top-right corner.
- **Drag to pan** once zoomed in, to inspect any part of the house up
  close — the roof texture, a specific window, an extra like the pool
  or garage, whatever you tapped in or want a closer look at.

That covers everything visible on the outside of the model. But some
choices — insulation, plumbing, electrical wiring — are never visible
from outside no matter how far you zoom, because they're inside the
wall. For those, there's a **"🔍 Wall cutaway"** button (top-left of the
graphic) that swaps in an *exploded* diagram of one wall section, pulled
apart layer by layer: interior finish → framing (studs, tinted by your
structural system) → insulation (with a visible vapor-barrier line if
you picked passive-house tier) → sheathing → exterior cladding — plus an
orange wire drilled through a stud with a junction box, and a blue pipe
running through the cavity. Every layer is its own tappable hotspot,
same detail-sheet-with-"Change this" behavior as the main model. Tap
"🏠 Full house" to swap back.

Implementation-wise: `attachZoomPan()` in `index.html` binds pointer/
wheel handlers once per graphic container and applies a CSS
`transform: translate() scale()` to the inner `<svg>`; a `moved` flag
suppresses the hotspot click that would otherwise fire at the end of a
drag or pinch. `buildCutawaySVG()` (also in `index.html`, next to
`buildHouseSVG`) draws the exploded layers using the same `iso.js`
primitives as everything else.

## Not seeing graphics / the new layout?

If you've opened this app before (even once) and updated the files since,
your browser may be serving a **stale cached copy** via the service worker
instead of the new one — that's the #1 cause of "I updated the files but
nothing changed." To confirm and fix it:

1. On the device where it looks wrong, open the site in the browser (not
   the installed home-screen icon) and do a hard refresh — on Android
   Chrome: menu → hold Reload, or Settings → Site settings → find the
   site → Clear & reset.
2. If you'd added it to your home screen as an app, remove that icon and
   re-add it after step 1, so it reinstalls from the fresh files.
3. Confirm the fix worked: open browser dev tools (or `chrome://inspect`
   from a desktop) → Application → Service Workers, and check the
   registered script shows `lego-guides-v2` (or higher) as the cache name.

If it still looks wrong after a hard refresh, the most useful things to
send back are: (a) a screenshot of the page, and (b) any red errors from
the browser's JavaScript console (Chrome: menu → More tools → Developer
tools → Console tab).

## Quick start (GitHub Pages, no local setup)

1. Create files at these exact paths in your repo (via GitHub's web UI,
   "Create new file" and just type the path — it makes folders for you):
   ```
   index.html
   manifest.json
   sw.js
   iso.js
   modules/house.js
   icons/icon.svg
   ```
2. Repo Settings → **Pages** → Deploy from branch → `main` / root.
3. Open the Pages URL. You should land on a home screen with one card:
   "Building a House."
4. Optional: on your phone, open the site in Chrome → menu → **Add to Home
   screen** to install it as an app.

No build step, no npm, no server. It's plain HTML/CSS/JS.

---

## How it's structured

| File | Role |
|---|---|
| `index.html` | Everything the app *does*: styling + the engine that renders steps, tracks progress, and shows the summary. You should rarely need to touch this when adding new guides. |
| `iso.js` | Dependency-free isometric SVG drawing library (boxes, roofs, studs, minifigs, textures) — the whole "3D LEGO" rendering layer. Generic, doesn't know anything about houses. |
| `modules/house.js` | Everything the house guide *says*: the 25 decisions, their options, watch-for checklists, intros, and each option's pros/cons — plus the storyboard, which draws cumulative isometric build scenes via `iso.js`. |
| `manifest.json` | Makes it installable as a PWA (name, colors, icon). |
| `sw.js` | Minimal offline cache so the app shell still loads without signal. |
| `icons/icon.svg` | App icon (simple brick-stack SVG, not the LEGO® logo). |

### Adding a second guide (e.g. a garden, a bike overhaul, anything)

1. Copy `modules/house.js` into `modules/yourguide.js`.
2. Keep the shape: `window.LEGO_MODULES.push({ id, title, tagline, baseColor, steps: [...] })`.
3. Each step needs `id` (unique), `category` (must be one of `Planning`,
   `Site`, `Structure`, `Envelope`, `Systems` — or add a new one, see below),
   `title`, `prompt`, `watchFor` (array of concrete, checkable things to
   verify before deciding — e.g. "sewer main location," not "consider
   drainage"), and `options` (array of `{id, label, pros[], cons[]}`).
4. `prompt`, `watchFor`, and `options` can each also be **functions** that take the choices
   made so far and return a string / array — this is how branching works
   (e.g. foundation options change if the land is sloped).
5. Add `showIf(choices)` to a step if it should sometimes be skipped
   entirely (e.g. "roof pitch" is skipped if you picked a flat roof).
6. Add `type: 'multi'` to a step to make it a checklist (tick any number of
   options, then hit Continue) instead of tap-one-to-advance. Its stored
   choice becomes an array of option ids instead of a single id.
7. Add `intro: { title, frames: [{ caption, svg }, ...] }` to give a step
   an auto-playing animated walkthrough before the prompt. Frames are
   plain inline SVG strings + a caption; they auto-advance every 2.6s, or
   the person can tap Skip/Replay. Not every step needs one.
8. In `index.html`, add one line: `<script src="./modules/yourguide.js" defer></script>`
   right above the existing house.js `<script>` tag or after it — order
   between module files doesn't matter.
9. If you add a **new category** name, also add its color in two places in
   `index.html`: the `CATEGORY_VAR` map in the engine script, and a
   `.cat-YourCategory` CSS rule near the other `.cat-*` rules.
10. The **live house graphic** (`buildHouseSVG` in `index.html`) is written
    specifically against the house module's step/option ids, so a new
    guide won't automatically get its own picture — it'll just render the
    normal text-and-brick-tray experience. Building an equivalent graphic
    for a new guide means writing a similar function keyed to its ids and
    wiring it into the three `renderHouseGraphicInto(...)` call sites (home
    card, live step screen, playthrough, summary).

### Validation before you push changes

Anything that edits `modules/*.js` is easy to typo (duplicate step ids,
an options() function that returns nothing for some branch, a category with
no matching CSS color). Before publishing changes, it's worth re-running a
check like this locally (needs Node.js, e.g. via PowerShell):

```powershell
node --check modules/house.js
```

For a fuller check (duplicate ids, missing pros/cons, broken branch
functions, HTML/CSS references), ask Claude to re-run the same validation
script it used when this project was built — it exercises every branch
combination (site terrain × climate × orientation × roof type × lot
context) and checks every option has an id, label, pros, and cons.

---

## Cross-device sync (optional)

This is a static site with no backend, so "sync" is done through a private
GitHub Gist acting as a tiny free database:

1. Open the app → tap **⚙️** → generate a GitHub **fine-grained personal
   access token** scoped only to *Gists: Read and write*
   (github.com/settings/tokens) → paste it in.
2. Leave "Gist ID" blank the first time and hit **Sync now** — it creates a
   private gist and shows you the ID.
3. On your other device, open settings, paste the same token and Gist ID,
   and hit **Sync now**.

Notes:
- The token is stored only in that browser's `localStorage` — never sent
  anywhere but `api.github.com`. Anyone with access to the device's browser
  storage could read it, so use a token scoped to *only* Gists.
- Sync is **on-demand / on-load**, not live/real-time — if you edit the same
  guide on two devices at once before syncing, the most-recently-saved
  device wins and the other's changes to that session are lost.
- Without sync configured, everything still works — it just stays local to
  that device (`localStorage`).

---

## Known limitations / things to revisit

- Editing an early answer clears every later answer in that guide (simplest
  safe behavior, since a later branch might no longer make sense — but it
  does mean no partial re-validation).
- PWA install icon is an SVG, not a PNG. Works on most modern Android/Chrome
  installs; if a launcher ever shows a blank icon, drop in real `192x192`
  and `512x512` PNGs and add them to `manifest.json`'s `icons` array.
- Content assumes Northern Hemisphere sun logic (south = sunniest side) —
  called out inline in `modules/house.js` where it matters.
