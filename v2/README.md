# Pit Wall · Portfolio v2

Kaushil Nagrale's portfolio, rebuilt as a race engineer's pit wall. Next.js 16 (App Router, Cache Components),
TypeScript, Tailwind CSS 4, exported as a static site for GitHub Pages. This folder is Phase 1 of `Portfolio_v2_Changes.md`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

## Editing content

Everything the site shows lives in `content/`. Components only render it.

| File | What it holds |
|---|---|
| `profile.json` | Name, hero copy, current role, availability line, email, links, contact intro, photos |
| `projects.json` | Featured projects (`"tier": "bay"`) and More projects (`"tier": "grid"`) |
| `experience.json` | Circuit corners T1 to T9 |
| `awards.json` | Podium and standings |
| `lenses.json` | Hero line, telemetry readouts, resume PDF and Setup Sheet emphasis per lens |
| `skills.json` | Setup Sheet rows. A skill links to every project whose `skills` array contains its `id` |

### Adding a live demo to a featured project

In `content/projects.json`, find the project and fill its links, then set `status`:

```json
"status": "live",
"links": {
  "live": "https://clinishield.example.com",
  "embed": "https://clinishield.example.com",
  "health": "https://clinishield.example.com/actuator/health",
  "repo": "https://github.com/kaushilnagrale/clinishield",
  "video": null,
  "caseStudy": null
}
```

- `live`: opens in a new tab. Required for a live demo.
- `embed`: the URL to load inside the project card after **Launch demo**. Leave `null` if the host refuses framing; the button then opens a new tab.
- `health`: checked in the background once the card scrolls into view; Launch demo stays available. If the host is slow (a free host waking up) the card shows **Waking the server**; if it never answers, it offers a new tab or the video.
- `video`: a recording. With `"status": "video"` the card plays it instead of a live demo.

Status values: `live`, `waking` (a host known to cold-start), `video`, `planned` (shows "Demo soon"), `none` (More projects only).
The footer's demo count counts featured projects with `"status": "live"`.

A planned project with a `video` shows **Watch demo video**, so a demo recording can go up before the live demo does.

### Adding a telemetry dashboard (Grafana and others)

Each project's `telemetry` points at a live dashboard for its backend. The **Metrics** tab appears once `embed` or `url` is set:

```json
"telemetry": {
  "provider": "Grafana",
  "embed": "https://grafana.example.com/public-dashboards/<token>?kiosk",
  "url": "https://grafana.example.com/public-dashboards/<token>"
}
```

- `embed` loads inside the card after **Load dashboard** (never on page load). For Grafana, use a public dashboard or snapshot
  link and set `allow_embedding = true` in `grafana.ini`, otherwise the browser refuses the frame; fill only `url` in that case.
- `url` opens the dashboard in a new tab.
- `provider` is the label shown (Grafana, Prometheus, MLflow, Kibana…).

More projects take the same `links.live` (for example LAN Duel once it is deployed).

Screenshots: put a 1600 × 1000 poster at `public/projects/<slug>/poster.avif` and set `media.poster`; `media.xrayUi` is the app
side of the Architecture tab. Until then the card draws a blueprint poster. The architecture diagram is drawn from `architecture` (nodes and edges).

### Video thumbnail and demo video

- `media.loop`: a short muted screen recording that plays in the Live viewport as a moving thumbnail, e.g.
  `/projects/clinishield/loop.mp4`. It loads only when the card scrolls into view, has a Pause preview button, and is
  skipped under reduced motion or Save-Data (the poster shows instead). Aim for 8 to 15 seconds, no audio, 16:10
  (1440 × 900), MP4 (H.264), under 2 MB, looping cleanly. Compress with HandBrake, or:
  `ffmpeg -i in.mov -t 12 -vf "scale=1440:-2,fps=24" -an -c:v libx264 -crf 28 -preset slow -movflags +faststart loop.mp4`
- `media.poster`: a still frame from the same recording, shown until the clip starts.
- `links.video`: the full demo walkthrough behind **Play the run**. A YouTube or Vimeo link plays in their player
  (YouTube in privacy-enhanced mode); any other URL or `/public` path plays as a video file.

### Photos

`profile.json` → `photos` feeds the Photos carousel (slides horizontally, auto-advances, pausable). Put the files in `public/photos/`
and give each `src`, `alt` (what the photo shows), and optionally `place`, `year` and `caption`. In `npm run dev` the empty
slots show where the next photos go; production hides the Photos section until there is at least one photo.

### Tailored resumes (R-06)

Add `public/resume/kaushil_nagrale_data.pdf`, `..._ml.pdf` and `..._swe.pdf`. Until a file exists, that lens serves the general
`kaushil_nagrale.pdf`.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. The Pages workflow sets `https://kaushilnagrale.github.io`. |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Optional web3forms.com key. Without it, the Contact form opens a ready-to-send Gmail or email-app draft; with it, **Send** delivers directly. |

## How it is built

- **Lenses:** each lens is a prebuilt page at `/lens/<lens>/`; `/?lens=` links redirect there from the home page.
- **No iframes on load:** a demo iframe exists only after a visitor clicks Launch demo.
- **Fonts:** Archivo ships as three static Latin instances in `app/fonts` (SIL OFL, licence alongside). Only the H1 cut is preloaded.
- **Payload:** posters and architecture diagrams render on the client from compact JSON, which keeps the RSC payload small.
- **No JavaScript:** navigation, lens links, projects, experience and the Contact form (it posts to Gmail's composer) work as plain HTML.

## Signature pieces

- **Road rail** (`components/nav/TimingTowerNav.tsx`, `lib/race.ts`): on wide screens the section list is a winding road and a
  car drives down it with the scroll, reaching each checkpoint as that section arrives. On phones a small car runs along a
  progress lane above the bottom bar. Reduced motion turns off the smoothing and speed lines.
- **Quality Gate** (`components/play/`): a 45-second game where rows stream in and you pass clean ones to Silver or quarantine
  broken ones (null, malformed email, negative amount, text in a number field, future date, bad country code, duplicate id).
  Keyboard (← → or A D), buttons or tap; Relaxed mode has no timers. The game code loads only when a visitor presses Start;
  the best score is kept in that visitor's browser.

## Deploying (GitHub Pages)

The site is exported as static files (`output: "export"` in `next.config.ts`) and published by
`.github/workflows/deploy-pages.yml` on every push to `main`, at https://kaushilnagrale.github.io.

- One-time setup: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- Preview the exact output locally: `npm run build`, then serve `out/` (for example `python3 -m http.server 3100` inside `out/`).
- Lenses are real pages (`/lens/data/`, `/lens/ml/`, `/lens/swe/`); old `/?lens=ml` links redirect to them.
- Share images are generated at build time as `/og/home.png` and `/og/cv.png`.
- `/resume/Kaushil_Resume.pdf` (the old site's resume link) keeps working.
