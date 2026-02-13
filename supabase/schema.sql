
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    telegram_id BIGINT PRIMARY KEY,
    username TEXT,
    total_snips BIGINT DEFAULT 0 CHECK (total_snips >= 0),
    all_time_snips BIGINT DEFAULT 0 CHECK (all_time_snips >= 0),
    energy_current INTEGER DEFAULT 1000 CHECK (energy_current >= 0),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referred_by BIGINT REFERENCES public.users(telegram_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_upgrades table
CREATE TABLE IF NOT EXISTS public.user_upgrades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(telegram_id) ON DELETE CASCADE,
    upgrade_type TEXT NOT NULL, -- 'tap_power', 'passive_income', 'energy_max'
    current_level INTEGER DEFAULT 0 CHECK (current_level >= 0),
    UNIQUE(user_id, upgrade_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_all_time_snips ON public.users(all_time_snips DESC);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_user_upgrades_user_id ON public.user_upgrades(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_upgrades ENABLE ROW LEVEL SECURITY;

-- Policies (Adjust based on auth implementation, assuming standard anon/service_role for now)
-- For development, allow full access to authenticated users or service role
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); -- Requires Supabase Auth linked to Telegram ID
-- Alternatively, for a simple TWA start without strict RLS first:
-- CREATE POLICY "Enable all access for now" ON public.users FOR ALL USING (true);

-- Set up Realtime
-- alter publication supabase_realtime add table user_upgrades; -- Uncomment if needed found

-- Referral Reward Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if it's a valid referral event:
    -- 1. INSERT with a referrer
    -- 2. UPDATE where referred_by changes from NULL to a value
    IF (TG_OP = 'INSERT' AND NEW.referred_by IS NOT NULL) OR
       (TG_OP = 'UPDATE' AND OLD.referred_by IS NULL AND NEW.referred_by IS NOT NULL) THEN
       
        -- 1. Add 50,000 Snips to the Referrer
        UPDATE public.users
        SET total_snips = total_snips + 50000,
            all_time_snips = all_time_snips + 50000
        WHERE telegram_id = NEW.referred_by;

        -- 2. Add 50,000 Snips to the Referee (The user triggering this)
        -- For UPDATE, we can just modify the NEW record directly if it's a BEFORE trigger, 
        -- but for AFTER trigger (which we need for cross-table updates usually), we update the table.
        -- To avoid recursion loop, verify logic. 
        -- Actually, for simplicity in standard SQL, running an UPDATE on the same table in an AFTER UPDATE trigger 
        -- can be tricky (recursion).
        -- BETTER APPROACH: Just update the referrer here. 
        -- AND assuming the caller (App.tsx) or a separate mechanism handles the user's own bonus?
        -- NO, we want it atomic.
        
        -- Let's use a WHERE clause to ensure we don't loop endlessly:
        -- But for the user themselves, we accept that 'handle_referral_reward' might technically re-fire 
        -- but the condition (OLD.referred_by IS NULL) won't match next time because it is now SET.
        
        UPDATE public.users
        SET total_snips = total_snips + 50000,
            all_time_snips = all_time_snips + 50000
        WHERE telegram_id = NEW.telegram_id;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON public.users;
CREATE TRIGGER on_auth_user_created_referral
AFTER INSERT OR UPDATE OF referred_by ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_referral();
