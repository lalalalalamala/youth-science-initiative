# Youth Science Initiative

A responsive, single-page introduction to Youth Science Initiative (YSI), a youth-led science initiative serving Aurora and the Greater Toronto Area.

## Run locally

This is a static website with no build step or package dependencies. Open `index.html` in a browser, or serve the folder with any static file server. For example, with Python installed:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Site files

- `index.html` contains the page content and semantic structure.
- `css/style.css` contains the design system, responsive layouts, and motion styles.
- `js/main.js` handles the mobile navigation, current year, staggered scroll reveals, and interactive science backgrounds.
- `Untitled453_20260915174618.webp` is the supplied YSI logo, used in the header, footer, and favicon.
- The two new supplied JPG images show children experimenting and scientists in a laboratory in the hero. The three community images remain in the impact gallery. These images illustrate the mission rather than document YSI events.

The page works without JavaScript; the navigation remains visible and content is not hidden. The hero, impact, and contact sections have animated science networks that respond to pointer movement and produce ripples on a background click or tap. Drawing pauses for offscreen sections and hidden browser tabs. The floating Pause motion control stops ambient animation, and all motion respects changes to the reduced-motion preference. Fonts load from Google Fonts, with system font fallbacks.

## Updating content

Keep program ages and contact information in `index.html` aligned with current YSI details. Program cards use email links so visitors can ask about current opportunities without relying on event dates that may become stale.
