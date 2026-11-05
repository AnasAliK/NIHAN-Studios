# NIHĀN Studios — نهان

*Beyond the known.*

An immersive 3D scroll journey: the camera approaches the Hidden Gate, passes through its glowing door, and flies into a misty mountain range where AI · Apps · Games · Websites each crown their own peak. Every section and project also has its own page under `/work`.

Built with **Next.js**, **React Three Fiber**, **drei**, **@react-three/postprocessing** (bloom, tone mapping) and **Lenis** smooth scroll.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel (free)

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo — Vercel detects Next.js automatically.
3. Click **Deploy**. Every push to `main` redeploys.

## Adding portfolio work

All content lives in [`src/content/portfolio.ts`](src/content/portfolio.ts).

1. Put images in `public/assets/<section>/` (e.g. `public/assets/web/my-site-1.jpg`). JPG/WebP around 1280px wide keeps loading fast.
2. Add a project to that section's `projects` array:

```ts
{
  title: 'My Project',
  type: 'Web app · E-commerce',
  summary: 'One or two sentences about it.',
  images: ['/assets/web/my-site-1.jpg', '/assets/web/my-site-2.jpg'],
  link: 'https://example.com', // optional
}
```

Each project gets its own page at `/work/<section>/<project>` automatically. The 3D peaks pick images up too: **Apps** → phone screens (use `orientation: 'portrait'`), **Games** → the rotating screen ring, **Websites** → the layered browser windows, **AI** → cards orbiting the neural core.

Contact email and links are in `site` at the top of the same file.

## Structure

```
src/
  app/                 layout (fonts, metadata), page, global styles
  content/portfolio.ts all copy, projects and images
  components/three/    WebGL scene: Gate, Beyond (mountains/sky), Portal, CameraRig, installations/
  components/ui/       HTML overlay: journey panels, header, rail, modal, lightbox, cursor
  lib/                 layout (camera keyframes, gate positions), journey (scroll state), shapes, textures
```
