# Duality site architecture

## Ownership

- `content/`: public editorial pages and section indexes. Markdown is the source of truth for prose.
- `data/`: structured records rendered by Hugo, including articles, videos, products, and performance data.
- `layouts/_partials/hub/`: reusable presentation components for the public platform.
- `layouts/_partials/`: site-shell overrides such as navigation, head metadata, and homepage composition.
- `layouts/shortcodes/`: reusable interactive/data embeds such as ECharts and Tabulator.
- `assets/css/`: project styling entrypoints and component styles.
- `assets/js/`: project behavior modules. Keep browser behavior here, not inline in content.
- `static/images/`: published media assets referenced by content and data.
- `themes/hugo-coder/`: vendor dependency. Do not edit it for site features.
- `public/`: generated output. Rebuild it; do not hand-edit it.

## Extension pattern

1. Add prose to `content/`.
2. Add structured records to `data/` when a page contains repeated items.
3. Add or update a partial in `layouts/_partials/hub/` for repeated UI.
4. Add interactive behavior as a shortcode or module under `assets/js/`.
5. Add the route to `hugo.toml` only when it is a top-level public section.
6. Run `hugo --cleanDestinationDir --buildFuture --buildDrafts --minify` before publishing.

## Public product boundary

The core Duality algorithm is private research. Public pages may describe methods and findings. Derived modules can be presented as separate analytical products without exposing core implementation details.

## Deployment

GitHub Actions builds the static site and deploys `public/` to GitHub Pages. No PHP runtime, database, or server-side application is required.
