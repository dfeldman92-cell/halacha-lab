# Halacha Lab

Interactive halacha learning games, hosted on GitHub Pages.

## Stable URLs

- `/` — Halacha Lab launcher
- `/tumah/` — Tumah Transmission Lab
- `/kashrus/` — reserved for Kashrus Lab
- `/shabbos/` — reserved for Shabbos Lab

The folder names are permanent. Updating the files inside a folder updates the same URL, so an iPhone Home Screen app does not need to be reinstalled after each version.

## Automatic publishing

`.github/workflows/pages.yml` publishes this repository to GitHub Pages whenever `main` changes.

## iPhone

Open the live Halacha Lab URL in Safari, tap Share → Add to Home Screen, enable Open as Web App, and Add.

The service workers prefer the newest HTML while online and use the last cached copy as an offline fallback.
