<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the newer portfolio content in index.html with one introduction, section-anchor navigation, and one contact footer; legacy HTML page URLs redirect to their corresponding anchors to preserve direct links without duplicating content.
- Store uploaded media as asset pointer JSON and keep all portfolio visual styling in the global semantic design system to avoid binary repository growth and inconsistent presentation.
- For the newer static pages, share grid definitions and theme tokens in assets/style.css and keep small-screen overrides together after base styles so page layouts stay consistent without duplicated rules.
- Serve and bundle the newer static website with Vite using every root HTML file as an entry point so existing page URLs and media work in preview and production without rewriting the site.
- Build expandable content with native details/summary rather than JavaScript toggles, so the static site stays interactive without any script dependency.
