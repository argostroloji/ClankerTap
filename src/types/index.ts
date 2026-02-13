
export interface User {
    telegram_id: number;
    username: string;
    total_snips: number;
    all_time_snips: number;
    energy_current: number;
    last_active: string; // ISO string
    referred_by: number | null;
    created_at?: string;
}

export type UpgradeType = 'tap_power' | 'passive_income' | 'energy_max' | 'energy_regen';

export interface Upgrade {
    id: string;
    user_id: number;
    upgrade_type: UpgradeType;
    current_level: number;
}

export interface GameState {
    user: User | null;
    upgrades: Record<UpgradeType, number>; // type -> level
    isLoading: boolean;
    error: string | null;
}
