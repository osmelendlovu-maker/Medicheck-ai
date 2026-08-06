# MediCheck AI

A symptom-checker app with a freemium paywall, built to deploy for free on Vercel.

## What's inside

- `src/` — the React app (frontend)
- `api/analyze.js` — a serverless function that calls the AI. This is what keeps your API key secret; it never runs in the browser.
- Free tier: 3 checks/day, tracked in the browser (localStorage)
- Upgrade card: points to your Lemon Squeezy checkout link

## 1. Get a free Groq API key (this powers the AI, at $0 cost)

1. Go to console.groq.com and sign up (no credit card needed)
2. Create an API key
3. Copy it — you'll need it in step 3 below

## 2. Push this project to GitHub

1. Create a new repo on github.com (e.g. `medicheck-ai`)
2. In this folder, run:
   ```
   git init
   git add .
   git commit -m "MediCheck AI first version"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/medicheck-ai.git
   git push -u origin main
   ```

## 3. Deploy on Vercel (free)

1. Go to vercel.com, sign up with your GitHub account
2. Click "Add New Project", pick your `medicheck-ai` repo
3. Before clicking Deploy, add an Environment Variable:
   - Name: `GROQ_API_KEY`
   - Value: (the key you copied in step 1)
4. Click Deploy

In a couple of minutes you'll get a live link like `medicheck-ai-yourname.vercel.app` — that's your real, shareable URL. Anyone can open it from their own phone.

## 4. Before sharing it with anyone

- Open `src/App.jsx`, find `LEMONSQUEEZY_CHECKOUT_URL` near the top, and swap in your real Lemon Squeezy checkout link
- Test the full flow on your own phone using the live link, not just locally

## Notes on cost as you grow

- Groq's free tier is generous but rate-limited. If MediCheck AI gets real daily users, you may hit the ceiling — that's a good problem, and the fix is either upgrading Groq or switching this same code to a paid Anthropic key later.
- localStorage means each person's free-check count is per-device, per-browser. If you later want real accounts that follow a person across devices, that needs a small database (e.g. Supabase's free tier) — happy to add that when you're ready.
