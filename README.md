# Emerson Liu | Portfolio

Personal portfolio site for Emerson Liu: machine learning and computer vision projects, experience, education and favorite readings.

Plain HTML and CSS. No build step, no dependencies.

## Pages

| File | Contents |
| --- | --- |
| `index.html` | Home page with the intro and the list of articles |
| `work.html` | Selected projects: CoT-Seg, FRUS database searcher, SQL database tester, HKUST RoboMaster, competitions |
| `experience.html` | Internships and team roles |
| `education.html` | Degrees, exchange semester and skills |
| `readings.html` | Favorite readings |
| `assets/style.css` | Styles shared by every page |
| `assets/` | Images: portrait, hero background, project figures, book covers |

## Run locally

You need [Node.js](https://nodejs.org) (LTS) for the first option.

```
npx serve
```

Then open the address it prints, usually `http://localhost:3000`.

Without Node, use Python instead:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. You can also open `index.html` directly in a browser.

## Edit

- **Text:** edit the matching `.html` file. Each page holds its own content.
- **Look and feel:** colors and fonts are set at the top of `assets/style.css`, in the `:root` block.
- **Portrait:** replace `assets/portrait.jpg`. A portrait photo works best, roughly 2:3 or 4:5.
- **Hero background:** replace `assets/hero-bg.jpg`. A larger image, 2000 px or wider, looks sharper.
- **Links and email:** search for `hliudj@uw.edu` and the LinkedIn address to change them on every page.

Keep filenames and folder structure as they are, or update the paths in the HTML and CSS.

## Publish with GitHub Pages

1. Push these files to a **public** repository. Name it `USERNAME.github.io` to get `https://USERNAME.github.io`.
2. Go to **Settings**, then **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch `main` and folder `/ (root)`, then click **Save**.
5. Wait one to three minutes. The live link appears on the same settings page.

Filenames on GitHub are case-sensitive, and `index.html` must sit at the top level of the repo.

## Credits

- Fonts: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) and [Newsreader](https://fonts.google.com/specimen/Newsreader), loaded from Google Fonts.
- CoT-Seg paper: [arXiv 2601.17420](https://arxiv.org/abs/2601.17420). Code: [DanielSHKao/CoT-Seg](https://github.com/DanielSHKao/CoT-Seg).
- Book covers belong to their respective publishers and are shown for illustration.

&copy; 2026 Emerson Liu