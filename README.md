# My Showcase Page

build a personal website from these, use place holders for unprovided images .
Selectable Sections:
Education 
Projects
My Book List

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6d033e75-ffaa-4178-8081-1f7895ed3783).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Interactive library
The reading section uses React with Vite. Book content stays in index.html as a native details/summary fallback; The book list uses native collapsible subject groups. React reads the same collection for the Three.js walkable reading room and saved books. Saved books stay in local browser storage. In the room, use WASD/arrows or on-screen buttons, drag to look, and click a book to inspect it. No account or backend is required.
