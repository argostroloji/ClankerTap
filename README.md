
# BagsTap: Bag-Snip 💰⚡

A cyberpunk-themed Telegram clicker game where you fill your bags with cash.

## Features
- **Tap to Earn**: Click the Cyber-Lobster to earn Snips.
- **Energy System**: Manage your energy to maximize earnings.
- **Upgrades**: Purchase upgrades like "Hydraulic Claw" and "Nano-Crab Swarm".
- **Leaderboard**: Compete with other players globally.
- **Referrals**: Invite friends for bonuses.
- **Cyberpunk Aesthetic**: Glitch effects, neon colors, and procedural audio.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.local.example` (if exists) or create `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   Run the SQL found in `supabase/schema.sql` in your Supabase SQL Editor.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Tech Stack
- React (Vite)
- TypeScript
- Tailwind CSS
- Supabase
- Telegram WebApp SDK
