
import type { UpgradeType } from '../types';

export const UPGRADE_DEFINITIONS: Record<UpgradeType, { name: string; description: string; baseCost: number; baseEffect: number; emoji: string }> = {
    'tap_power': {
        name: 'Money Grabber',
        description: '+1 Snip per tap',
        baseCost: 50, // Lowered from 100 for better early game 
        baseEffect: 1,
        emoji: '🤏'
    },
    'passive_income': {
        name: 'Auto-Bagger',
        description: '+1 Snip per sec',
        baseCost: 200, // Lowered from 500
        baseEffect: 1,
        emoji: '🎒'
    },
    'energy_max': {
        name: 'Vault Expansion',
        description: '+500 Max Energy',
        baseCost: 150,
        baseEffect: 500,
        emoji: '🏦'
    },
    'energy_regen': {
        name: 'Passive Income Stream',
        description: '+1 Energy per sec',
        baseCost: 300,
        baseEffect: 1,
        emoji: '📈'
    }
};

export interface Mission {
    id: string;
    title: string;
    reward: number;
    link: string;
    icon: string;
}

export const MISSIONS: Mission[] = [
    {
        id: 'twitter_follow_bagsapp',
        title: 'Follow Bagsapp on X',
        reward: 50000,
        link: 'https://x.com/bagsapp',
        icon: '🐦'
    },
    {
        id: 'twitter_follow_finnbags',
        title: 'Follow Finnbags on X',
        reward: 50000,
        link: 'https://x.com/finnbags',
        icon: '🐦'
    },
    {
        id: 'twitter_follow_bnnbags',
        title: 'Follow BNNBags on X',
        reward: 50000,
        link: 'https://x.com/BNNBags',
        icon: '🐦'
    }
];
