-- ==========================================
-- BAGS TAP: DATABASE RESET & SECURITY SCRIPT
-- ==========================================
-- ⚠️ DANGER: This script will delete ALL existing user data.
-- Run this in the Supabase SQL Editor.

-- [1] CLEANUP: Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON public.users;
DROP FUNCTION IF EXISTS public.handle_new_user_referral();
DROP TABLE IF EXISTS public.user_upgrades;
DROP TABLE IF EXISTS public.users;

-- [2] TABLES: Recreate with optimized schema
CREATE TABLE public.users (
    telegram_id BIGINT PRIMARY KEY,
    username TEXT NOT NULL,
    total_snips BIGINT DEFAULT 0 CHECK (total_snips >= 0),
    all_time_snips BIGINT DEFAULT 0 CHECK (all_time_snips >= 0),
    energy_current INTEGER DEFAULT 1000 CHECK (energy_current >= 0),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referred_by BIGINT REFERENCES public.users(telegram_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_upgrades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(telegram_id) ON DELETE CASCADE,
    upgrade_type TEXT NOT NULL,
    current_level INTEGER DEFAULT 0 CHECK (current_level >= 0),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, upgrade_type)
);

-- [3] PERFORMANCE: Indexes
CREATE INDEX idx_users_leaderboard ON public.users(all_time_snips DESC);
CREATE INDEX idx_users_referrals ON public.users(referred_by);
CREATE INDEX idx_upgrades_lookup ON public.user_upgrades(user_id, upgrade_type);

-- [4] SECURITY: Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_upgrades ENABLE ROW LEVEL SECURITY;

-- 🛡️ SECURITY NOTE: 
-- In a Telegram Web App (TWA) without a middleware server, 
-- strict security is difficult because anyone with the 'anon' key can try to spoof writes.
-- THE BEST PRACTICE: Move all sensitive logic to Edge Functions.
-- For now, we set up policies that allow the Frontend to operate:

-- Select: Anyone can see the leaderboard/profiles
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.users FOR SELECT USING (true);

-- Upsert/Update: In an ideal world, we'd use 'auth.uid()', but TWAs use Telegram IDs.
-- Simplified security: Allow ALL operations for now but limit the damage via CHECK constraints.
-- 🏛️ RECOMMENDATION: Use an API key or Edge Function to limit these writes in production.
CREATE POLICY "Allow frontend updates" 
ON public.users FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Public upgrades read" 
ON public.user_upgrades FOR SELECT USING (true);

CREATE POLICY "Allow upgrade management" 
ON public.user_upgrades FOR ALL 
USING (true) 
WITH CHECK (true);

-- [5] AUTOMATION: Referral System Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if referred_by is set and wasn't before (to avoid multiple rewards)
    IF (TG_OP = 'INSERT' AND NEW.referred_by IS NOT NULL) OR
       (TG_OP = 'UPDATE' AND OLD.referred_by IS NULL AND NEW.referred_by IS NOT NULL) THEN
        
        -- Prevent self-referral
        IF NEW.referred_by = NEW.telegram_id THEN
            RETURN NEW;
        END IF;

        -- Reward the Referrer (50,000 Snips)
        UPDATE public.users
        SET total_snips = total_snips + 50000,
            all_time_snips = all_time_snips + 50000
        WHERE telegram_id = NEW.referred_by;

        -- Reward the New User (50,000 Snips)
        -- We modify the NEW record directly since it's about to be saved
        NEW.total_snips := COALESCE(NEW.total_snips, 0) + 50000;
        NEW.all_time_snips := COALESCE(NEW.all_time_snips, 0) + 50000;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_referral
BEFORE INSERT OR UPDATE OF referred_by ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_referral();

-- [6] INITIAL DATA (Optional)
-- Insert a system user if needed for testing
-- INSERT INTO public.users (telegram_id, username, total_snips) VALUES (0, 'System', 0);
