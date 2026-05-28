# 🏠 Property Scout — AI-Powered Daily WhatsApp Property Alerts

A production web app that monitors Zameen.com and Pakistani property portals daily and sends matching listings to your WhatsApp. **100% free to run.**

---

## 🏗️ Architecture (All Free)

| Component | Service | Cost |
|-----------|---------|------|
| Frontend + API | Vercel (Hobby) | Free |
| Database | Supabase (Free tier) | Free |
| Daily Scheduler | cron-job.org | Free |
| WhatsApp Delivery | CallMeBot API | Free |
| AI Brain | Claude API (your key) | Pay-per-use |

---

## 🚀 Deployment Guide

### Step 1: Set up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name (e.g. "property-agent")
3. Go to **SQL Editor** → **New Query**
4. Paste the contents of `supabase-schema.sql` and click **Run**
5. Go to **Project Settings → API** and copy:
   - **Project URL** → your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ Supabase free tier pauses after 7 days of inactivity. The daily cron will keep it alive automatically.

---

### Step 2: Deploy to Vercel (Frontend + Backend)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. In **Environment Variables**, add all values from `.env.local.example`:
   ```
   ANTHROPIC_API_KEY = sk-ant-...
   NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   CRON_SECRET = pick-any-random-string
   ```
4. Click **Deploy** — your app goes live at `https://your-app.vercel.app`

---

### Step 3: Set up Free Daily Cron (cron-job.org)

1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Click **Create cronjob**
3. Set:
   - **URL**: `https://your-app.vercel.app/api/run-daily`
   - **Schedule**: Every day at 9:00 AM (use custom cron: `0 9 * * *`)  
   - Under **Headers**, add: `x-cron-secret: your-random-string` (same as your CRON_SECRET)
4. Save — this will now call your API every morning at 9 AM, which runs the AI agent for all users and sends WhatsApp messages

---

### Step 4: Set up CallMeBot (WhatsApp — Users do this themselves)

Each user who signs up needs to activate CallMeBot once:

1. Save this number in WhatsApp contacts: **+34 694 26 48 06**
2. Send them a WhatsApp message: `I allow callmebot to send me messages`
3. They'll reply with an API key (looks like: `1234567`)
4. User enters this key during sign-up on your app

> This is completely free. CallMeBot is a hobby project that's been running since 2020.

---

## 📁 File Structure

```
property-agent/
├── pages/
│   ├── index.js              # Main onboarding UI (8-step wizard)
│   └── api/
│       ├── save-prefs.js     # Saves user preferences to Supabase
│       ├── run-daily.js      # Daily cron endpoint (called by cron-job.org)
│       └── pause-agent.js    # Pause/stop an agent
├── lib/
│   ├── supabase.js           # Supabase client
│   ├── agent.js              # Claude AI property scout logic
│   └── whatsapp.js           # CallMeBot WhatsApp sender
├── supabase-schema.sql       # Run once in Supabase SQL Editor
├── .env.local.example        # Environment variables template
└── package.json
```

---

## 🤖 How the AI Agent Works

1. Every morning at 9 AM, cron-job.org hits `/api/run-daily`
2. The API fetches all active users from Supabase
3. For each user, it calls Claude with their preferences + the `web_search` tool
4. Claude searches Zameen.com, Graana.com, and OLX Pakistan for real listings
5. Claude filters them against the user's criteria and formats a WhatsApp message
6. If matches found → sends via CallMeBot → logs to Supabase
7. If no matches → silently logs, tries again tomorrow

---

## 📱 Sample WhatsApp Message

```
🏠 Property Scout — Daily Report
📅 Monday, 27 May 2026

🏡 5 Marla House — DHA Phase 6, Lahore
💰 Price: 1.8 Crore
🛏️ 3 Beds | 🚿 2 Baths | 📐 5 Marla
✅ Gated community, parking, generator
🔗 zameen.com/property/12345

---

🏡 5 Marla House — Bahria Town, Lahore  
💰 Price: 1.6 Crore
🛏️ 3 Beds | 🚿 2 Baths | 📐 5 Marla
✅ Near school, CCTV, solar panels
🔗 zameen.com/property/67890

🔁 Next scan: Tomorrow 9 AM
💬 Reply STOP to pause alerts
```

---

## 🛠️ Local Development

```bash
npm install
cp .env.local.example .env.local
# Fill in your actual keys in .env.local
npm run dev
# Open http://localhost:3000
```

---

## ⚠️ Important Notes

- **CallMeBot is for personal use** — do not use this to spam others
- **Supabase free tier** has a 500MB DB limit and pauses after 7 days of no activity (the daily cron prevents this)
- **Vercel free tier** has a 10-second function timeout — the cron processes one user at a time with a 2-second delay between them
- For **many users** (50+), consider upgrading to Vercel Pro or switching the cron to Supabase Edge Functions

---

## 💡 Future Improvements

- Admin dashboard to view all users and logs
- User can text "STOP" to WhatsApp bot to pause themselves
- Price drop alerts (not just new listings)
- Filter by specific areas within a city
- Multi-language support (Urdu)
