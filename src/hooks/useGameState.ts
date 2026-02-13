
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { User, UpgradeType, Upgrade } from '../types';
import { UPGRADE_DEFINITIONS } from '../constants/gameData';

interface UseGameStateProps {
    user: User | null;
}

export function useGameState({ user }: UseGameStateProps) {
    const [energy, setEnergy] = useState(1000);
    const [snips, setSnips] = useState(0);
    const [allTimeSnips, setAllTimeSnips] = useState(0);
    const [tapPower, setTapPower] = useState(1);
    const [maxEnergy, setMaxEnergy] = useState(1000);
    const [passiveIncome, setPassiveIncome] = useState(0);
    const [energyRegen, setEnergyRegen] = useState(1);
    const [upgrades, setUpgrades] = useState<Upgrade[]>([]);

    // Sync local state with DB user when loaded
    useEffect(() => {
        if (user) {
            setEnergy(user.energy_current);
            setSnips(user.total_snips);
            setAllTimeSnips(user.all_time_snips || user.total_snips); // Ensure we have a starting value

            if (!isSupabaseConfigured) {
                return;
            }

            supabase
                .from('user_upgrades')
                .select('*')
                .eq('user_id', user.telegram_id)
                .then(({ data }) => {
                    if (data) {
                        setUpgrades(data);
                        let newTapPower = 1;
                        let newPassiveIncome = 0;
                        let newMaxEnergy = 1000;
                        let newEnergyRegen = 1;

                        data.forEach(u => {
                            const level = u.current_level;
                            if (u.upgrade_type === 'tap_power') newTapPower += level * UPGRADE_DEFINITIONS['tap_power'].baseEffect;
                            if (u.upgrade_type === 'passive_income') newPassiveIncome += level * UPGRADE_DEFINITIONS['passive_income'].baseEffect;
                            if (u.upgrade_type === 'energy_max') newMaxEnergy += level * UPGRADE_DEFINITIONS['energy_max'].baseEffect;
                            if (u.upgrade_type === 'energy_regen') newEnergyRegen += level * UPGRADE_DEFINITIONS['energy_regen'].baseEffect;
                        });

                        setTapPower(newTapPower);
                        setPassiveIncome(newPassiveIncome);
                        setMaxEnergy(newMaxEnergy);
                        setEnergyRegen(newEnergyRegen);
                    }
                });
        }
    }, [user]);

    // Passive Income & Energy Regen Loop
    useEffect(() => {
        const timer = setInterval(() => {
            setEnergy((prev) => {
                if (prev < maxEnergy) {
                    return Math.min(prev + energyRegen, maxEnergy);
                }
                return prev;
            });

            if (passiveIncome > 0) {
                setSnips(prev => prev + passiveIncome);
                setAllTimeSnips(prev => prev + passiveIncome);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [maxEnergy, energyRegen, passiveIncome]);

    // Refs for state to access in interval without resetting it
    const stateRef = useRef({ energy, snips, allTimeSnips });

    useEffect(() => {
        stateRef.current = { energy, snips, allTimeSnips };
    }, [energy, snips, allTimeSnips]);

    // Periodic Save
    useEffect(() => {
        if (!user || !isSupabaseConfigured) return;

        const saveInterval = setInterval(async () => {
            const current = stateRef.current;
            const { error } = await supabase
                .from('users')
                .update({
                    energy_current: Math.floor(current.energy),
                    total_snips: Math.floor(current.snips),
                    all_time_snips: Math.floor(current.allTimeSnips),
                    last_active: new Date().toISOString(),
                })
                .eq('telegram_id', user.telegram_id);

            if (error) console.error('Auto-save error:', error);
        }, 10000);

        return () => clearInterval(saveInterval);
    }, [user]);

    const handleTap = useCallback(() => {
        if (energy >= 1) {
            setEnergy((prev) => prev - 1);
            setSnips((prev) => prev + tapPower);
            setAllTimeSnips((prev) => prev + tapPower);
            return true;
        }
        return false;
    }, [energy, tapPower]);

    const addSnips = useCallback((amount: number) => {
        setSnips(prev => prev + amount);
        setAllTimeSnips(prev => prev + amount);
    }, []);

    const purchaseUpgrade = async (type: UpgradeType) => {
        if (!user) return;

        const currentUpgrade = upgrades.find(u => u.upgrade_type === type);
        const currentLevel = currentUpgrade?.current_level || 0;
        const def = UPGRADE_DEFINITIONS[type];
        const cost = Math.floor(def.baseCost * Math.pow(1.5, currentLevel));

        if (snips >= cost) {
            setSnips(prev => prev - cost);
            const nextLevel = currentLevel + 1;

            if (type === 'tap_power') setTapPower(prev => prev + def.baseEffect);
            if (type === 'passive_income') setPassiveIncome(prev => prev + def.baseEffect);
            if (type === 'energy_max') setMaxEnergy(prev => prev + def.baseEffect);
            if (type === 'energy_regen') setEnergyRegen(prev => prev + def.baseEffect);

            if (!isSupabaseConfigured) {
                setUpgrades(prev => {
                    const filtered = prev.filter(u => u.upgrade_type !== type);
                    return [...filtered, {
                        id: 'demo-' + Date.now(),
                        user_id: user.telegram_id,
                        upgrade_type: type,
                        current_level: nextLevel
                    }];
                });
                return;
            }

            const { error } = await supabase
                .from('user_upgrades')
                .upsert({
                    user_id: user.telegram_id,
                    upgrade_type: type,
                    current_level: nextLevel
                }, { onConflict: 'user_id, upgrade_type' })
                .select()
                .single();

            if (error) {
                console.error('Upgrade failed:', error);
            } else {
                setUpgrades(prev => {
                    const filtered = prev.filter(u => u.upgrade_type !== type);
                    return [...filtered, {
                        id: currentUpgrade?.id || 'temp',
                        user_id: user.telegram_id,
                        upgrade_type: type,
                        current_level: nextLevel
                    }];
                });
            }
        }
    };

    return {
        energy,
        maxEnergy,
        snips,
        tapPower,
        passiveIncome,
        upgrades,
        handleTap,
        purchaseUpgrade,
        addSnips
    };
}
