# Shift Score

A free hourly pay tracker that turns every shift into a game.

- Live earnings counter with hourly levels and badges
- Clock in and out; clocking back in the same day continues that day's shift
- Timesheet with weekly subtotals, spending and "left over", plus Excel export
- Spending log, bank balance tracking, payday estimates and savings
- Installable on iPhone and Android (Add to Home Screen) and works offline

## Privacy

There are no accounts and no server. Everything is stored in the browser on the
device you use (localStorage). Use **Settings → Back up my data** before switching
phones or clearing browser data, and **Restore a backup** on the new device.

## Hosting

It's a static site: no build step. Serve the folder from any static host
(GitHub Pages, Netlify, Cloudflare Pages). When you change files, bump `VERSION`
in `sw.js` so installed copies update.
