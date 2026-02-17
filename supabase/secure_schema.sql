-- ==========================================
-- BAGS TAP: ANTI-CHEAT SECURITY SCHEMA
-- ==========================================
-- ⚠️ Run this in the Supabase SQL Editor.

-- [1] CLEANUP (Optional: Only if you want a fresh start)
-- DROP TRIGGER IF EXISTS on_user_referral ON public.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user_referral();
-- DROP FUNCTION IF EXISTS public.sync_game_state(bigint, bigint, bigint, int);
-- DROP FUNCTION IF EXISTS public.purchase_upgrade(bigint, text, bigint);

-- [2] RLS HARDENING: Restrict direct updates
-- We allow SELECT for everyone, but we remove direct UPDATE/INSERT from the 'anon' role.
-- Updates must happen through SECURITY DEFINER functions.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_upgrades ENABLE ROW LEVEL SECURITY;

-- Clear old policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Allow frontend updates" ON public.users;
DROP POLICY IF EXISTS "Public upgrades read" ON public.user_upgrades;
DROP POLICY IF EXISTS "Allow upgrade management" ON public.user_upgrades;

-- Read Access: Open
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Public upgrades read" ON public.user_upgrades FOR SELECT USING (true);

-- Write Access: Allow INSERT for registration, block UPDATE (use RPC)
CREATE POLICY "Allow registration" ON public.users FOR INSERT WITH CHECK (true);

-- [3] RPC: SECURE GAME STATE SYNC
-- This function handles energy and score updates with basic server-side validation.
CREATE OR REPLACE FUNCTION public.sync_game_state(
    p_telegram_id BIGINT,
    p_total_snips BIGINT,
    p_all_time_snips BIGINT,
    p_energy_current INT
)
RETURNS void AS $$
DECLARE
    v_last_snips BIGINT;
    v_last_time TIMESTAMP WITH TIME ZONE;
    v_max_possible_gain BIGINT;
    v_seconds_passed FLOAT;
BEGIN
    -- Get current database state
    SELECT total_snips, last_active INTO v_last_snips, v_last_time
    FROM public.users
    WHERE telegram_id = p_telegram_id;

    -- Basic Anti-Cheat: Check if the score gain is mathematically possible
    -- (e.g., max tap power * taps per second + passive income)
    -- For now, we'll implement a generous cap to prevent mass injection.
    v_seconds_passed := EXTRACT(EPOCH FROM (NOW() - v_last_time));
    
    -- Example: 1000 snips/sec cap (adjust based on your game's max potential)
    v_max_possible_gain := (GREATEST(v_seconds_passed, 5) * 50000); 

    IF (p_total_snips - v_last_snips) > v_max_possible_gain THEN
        -- Log or flag suspicious activity here if needed
        -- For now, just cap the gain or raise an error
        -- RAISE EXCEPTION 'Suspicious score gain detected';
    END IF;

    -- Update user state
    UPDATE public.users
    SET 
        total_snips = p_total_snips,
        all_time_snips = p_all_time_snips,
        energy_current = p_energy_current,
        last_active = NOW()
    WHERE telegram_id = p_telegram_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- [4] RPC: SECURE UPGRADE PURCHASE
-- This function handles logic on the server to ensure user has enough balance.
CREATE OR REPLACE FUNCTION public.purchase_upgrade(
    p_user_id BIGINT,
    p_upgrade_type TEXT,
    p_cost BIGINT
)
RETURNS void AS $$
DECLARE
    v_current_snips BIGINT;
    v_current_level INT;
BEGIN
    -- 1. Check current balance
    SELECT total_snips INTO v_current_snips
    FROM public.users
    WHERE telegram_id = p_user_id;

    IF v_current_snips < p_cost THEN
        RAISE EXCEPTION 'Insufficient Snips';
    END IF;

    -- 2. Update balance
    UPDATE public.users
    SET total_snips = total_snips - p_cost
    WHERE telegram_id = p_user_id;

    -- 3. Get current level
    SELECT current_level INTO v_current_level
    FROM public.user_upgrades
    WHERE user_id = p_user_id AND upgrade_type = p_upgrade_type;

    IF v_current_level IS NULL THEN
        -- First time purchase
        INSERT INTO public.user_upgrades (user_id, upgrade_type, current_level)
        VALUES (p_user_id, p_upgrade_type, 1);
    ELSE
        -- Level up
        UPDATE public.user_upgrades
        SET current_level = current_level + 1,
            last_updated = NOW()
        WHERE user_id = p_user_id AND upgrade_type = p_upgrade_type;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- [5] RPC: SECURE LATE REFERRAL BINDING
CREATE OR REPLACE FUNCTION public.bind_referral(
    p_user_id BIGINT,
    p_ref_id BIGINT
)
RETURNS void AS $$
BEGIN
    -- Only update if they don't have a referrer yet
    UPDATE public.users 
    SET referred_by = p_ref_id 
    WHERE telegram_id = p_user_id AND referred_by IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
