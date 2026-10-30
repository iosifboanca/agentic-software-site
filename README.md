# Agentic Software

AI strategy and hands-on delivery for private equity, venture capital and
portfolio companies.

Live: https://agentic-software.co.uk/

## Development

```sh
npm ci
npm run build
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Three.js is bundled locally with esbuild; the site
loads no external fonts, scripts or analytics.

## Interaction

Real-time 3D sculptures respond to pointer movement and scroll. Motion can be
paused and follows the system reduced-motion preference. Rendering pauses when
the artwork is offscreen or the tab is hidden, with lower detail on mobile.
Audience tabs support arrow keys, Home and End.

## Hosting

GitHub Pages serves the committed static files from main, / (root). Keep CNAME
and .nojekyll. The custom domain is agentic-software.co.uk; HTTPS is enforced.
Run npm run build before publishing source changes.

## Credits

Three.js is MIT licensed; see assets/three-LICENSE.txt. The fallback architecture
image is AI-generated editorial artwork, not a company office. Original website
content and design: all rights reserved by Agentic Software Ltd.
