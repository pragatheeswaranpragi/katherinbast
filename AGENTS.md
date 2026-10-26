# Katherin Bast portfolio — Codex guidance

Read CODEX_HANDOFF.md first. This is a buildless HTML/CSS/JavaScript website. Edit dist/ directly; no npm installation or build is needed.

## Preserve
- Identity: Katherin Bast; Chennai; email katherinbast97@gmail.com.
- Full-width orbital home banner and plum, violet, peach and cream palette.
- Responsive navigation, credential grid, focus panels, brand marquee and accessible approach tabs.
- Connect greeting dialog, then Gmail compose. Never send mail automatically.
- Original brand assets and local font licenses.
- Existing credentials, supplied facts, and SEO identity. Do not invent statistics, testimonials or experience.
- Respect prefers-reduced-motion, keyboard focus and motion pause controls.

## Files
- dist/index.html: all page content.
- dist/revamp.css: active full UI, including the orbital banner, responsive layouts and greeting.
- Earlier CSS files remain for source history but are not loaded by index.html.
- UI_REVAMP.md: current design decisions and verification notes.
- dist/script.js: navigation, approach tabs, marquee, orbit and Gmail greeting.
- vercel.json: static output dist, redirects, headers.

## Verify
Run python scripts/check-site.py (or py on Windows) and node --check dist/script.js.
Preview with python -m http.server 4173 --directory dist.
Inspect mobile/tablet/desktop when a browser is available; do not claim visual checks that did not run.

## Deploy
Existing Vercel project: katherin-bast-portfolio, prj_gC6JQgOHKJANitjSiFBsUVoa1LNm.
Live URL: https://katherin-bast-portfolio.vercel.app/
Use the connected Vercel account's DEFAULT scope. Explicit teamId returned 403 earlier, while omitting teamId accessed and deployed the same project.
Do not create another project or change domains to work around a scope error.
The included .vercel/project.json contains project identifiers only; authenticate with the user's Vercel connection or CLI session.
User authorization for an earlier deployment is historical context; follow the current task's scope.

