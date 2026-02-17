
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
    isDaily?: boolean;
}

export const MISSIONS: Mission[] = [
    {
        id: 'twitter_follow_clankertap',
        title: 'Follow @ClankerTap on X',
        reward: 50000,
        link: 'https://x.com/ClankerTap',
        icon: '🐦'
    },
    {
        id: 'twitter_follow_clanker_world',
        title: 'Follow @clanker_world on X',
        reward: 50000,
        link: 'https://x.com/clanker_world',
        icon: '🐦'
    },
    {
        id: 'twitter_follow_base',
        title: 'Follow @base on X',
        reward: 50000,
        link: 'https://x.com/base',
        icon: '🔵'
    },
    {
        id: 'twitter_follow_neynarxyz',
        title: 'Follow @neynarxyz on X',
        reward: 50000,
        link: 'https://x.com/neynarxyz',
        icon: '🐦'
    },
    {
        id: 'twitter_follow_jessepollak',
        title: 'Follow @jessepollak on X',
        reward: 50000,
        link: 'https://x.com/jessepollak',
        icon: '🐦'
    },
    {
        id: 'twitter_follow_baseposting',
        title: 'Follow @baseposting on X',
        reward: 50000,
        link: 'https://x.com/baseposting',
        icon: '🐦'
    },
    {
        id: 'daily_login',
        title: 'Daily Login Bonus',
        reward: 10000,
        link: '',
        icon: '📅',
        isDaily: true
    },
    {
        id: 'daily_tweet_clanker',
        title: 'Tweet about Clanker Tap',
        reward: 25000,
        link: '',
        icon: '✍️',
        isDaily: true
    }
];

export const GAME_URL = 'https://t.me/ClankerTapBot/game';

export function getDailyTweetLink(referralUserId?: number): string {
    const refLink = referralUserId
        ? `${GAME_URL}?startapp=ref_${referralUserId}`
        : GAME_URL;
    const tweetText = `🎮 I just started playing @ClankerTap! Tap, earn & upgrade. Join me now 👇\n\n${refLink}\n\n$CLTAP`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
}

export function getProfileShareLink(username: string, rank: number, allTimeSnips: number, userId?: number): string {
    const refLink = userId
        ? `${GAME_URL}?startapp=ref_${userId}`
        : GAME_URL;
    const tweetText = `🏆 My @ClankerTap Stats\n\n👤 ${username}\n🎖️ Rank #${rank}\n💰 ${allTimeSnips.toLocaleString()} Total Snips\n\nJoin me! 👇\n${refLink}\n\n$CLTAP`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
}
