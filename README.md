# 🧱 Build Guides

A step-by-step decision-making PWA, visualised as building with lego bricks.
First guide: **Building a House** (18 branching decisions, from zoning to budget).

Live idea: each guide walks you through one real-world design process one
decision at a time. Every choice shows its pros and trade-offs before you
commit, and a brick drops into a "build tray" as you go — so by the end you
have both a finished decision (a build sheet) and a visual record of how you
got there.

---

## Quick start (GitHub Pages, no local setup)

1. Create files at these exact paths in your repo (via GitHub's web UI,
   "Create new file" and just type the path — it makes folders for you):
   ```
   index.html
   manifest.json
   sw.js
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
| `modules/house.js` | Everything the house guide *says*: the 18 decisions, their options, and each option's pros/cons. Pure data. |
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
6. In `index.html`, add one line: `<script src="./modules/yourguide.js" defer></script>`
   right above the existing house.js `<script>` tag or after it — order
   between module files doesn't matter.
7. If you add a **new category** name, also add its color in two places in
   `index.html`: the `CATEGORY_VAR` map in the engine script, and a
   `.cat-YourCategory` CSS rule near the other `.cat-*` rules.

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
