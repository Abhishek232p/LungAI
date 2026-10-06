
# LungAI: Intelligent Lung Cancer Stage Analyzer

AI-driven platform that analyzes chest X-ray images to detect and classify lung
cancer stages, with explainable visualizations and patient-friendly reports.

Built with React 19 + TypeScript + Vite + Tailwind (CDN) + Recharts + Gemini.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your key from
   https://aistudio.google.com/apikey:
   `VITE_GEMINI_API_KEY=...` (`GEMINI_API_KEY=...` also works)
3. Run the app:
   `npm run dev`  → http://localhost:3000
4. Production build / preview:
   `npm run build` then `npm run preview`

## Deploy on Vercel

This repo is configured for Vercel via `vercel.json` (framework: Vite).

1. Import the repository into Vercel (or run `vercel` in this folder).
2. In **Project Settings → Environment Variables**, add:
   - `VITE_GEMINI_API_KEY` = your Gemini API key (Production + Preview)
3. Redeploy so the key is baked into the client bundle at build time.

Note: the API key ships inside the public client bundle (this is a pure
frontend app). For production-grade protection, proxy the Gemini call through a
serverless function instead.

## Notes / fixes applied

- `index.html` had `charset="UTF-M"` and was missing the `<script type="module"
  src="/index.tsx">` entry point, so the app never mounted (blank page).
- The Gemini service threw at module load when the API key was missing, which
  white-screened the deployed app; it now fails gracefully with an actionable
  message and the app is wrapped in an Error Boundary.
- `process.env.API_KEY` replaced with Vite-native `import.meta.env.VITE_*`.
- Added `@types/react`, `@types/react-dom`, proper `tsconfig.json` includes,
  strict typing, and a valid npm package name.
