
import React, { useState, useEffect } from 'react';
import { MISSIONS, getDailyTweetLink } from '../constants/gameData';
import type { Mission } from '../constants/gameData';

interface MissionsProps {
    isOpen: boolean;
    onClose: () => void;
    onReward: (amount: number) => void;
    userId?: number;
}

function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

// SVG icon for X/Twitter
const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// SVG icon for daily tweet/edit
const TweetIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

// SVG icon for daily login (calendar/gift)
const LoginIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 010-5C10 3 12 8 12 8" /><path d="M16.5 8a2.5 2.5 0 000-5C14 3 12 8 12 8" />
    </svg>
);

const getMissionIcon = (mission: Mission) => {
    if (mission.id === 'daily_login') return <LoginIcon />;
    if (mission.isDaily) return <TweetIcon />;
    return <XIcon />;
};

export const Missions: React.FC<MissionsProps> = ({ isOpen, onClose, onReward, userId }) => {
    const [completedMissions, setCompletedMissions] = useState<string[]>([]);
    const [claiming, setClaiming] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('completedMissions');
        const dailyDate = localStorage.getItem('dailyMissionDate');
        const today = getTodayKey();

        let completed: string[] = stored ? JSON.parse(stored) : [];

        if (dailyDate !== today) {
            completed = completed.filter(id => {
                const mission = MISSIONS.find(m => m.id === id);
                return mission && !mission.isDaily;
            });
            localStorage.setItem('completedMissions', JSON.stringify(completed));
            localStorage.setItem('dailyMissionDate', today);
        }

        setCompletedMissions(completed);
    }, []);

    if (!isOpen) return null;

    const handleMissionClick = (mission: Mission) => {
        if (completedMissions.includes(mission.id)) return;

        // Daily login is instant — no link to open
        if (mission.id === 'daily_login') {
            const newCompleted = [...completedMissions, mission.id];
            setCompletedMissions(newCompleted);
            localStorage.setItem('completedMissions', JSON.stringify(newCompleted));
            onReward(mission.reward);
            return;
        }

        // For daily tweet mission, generate the tweet link with referral
        const link = mission.isDaily
            ? getDailyTweetLink(userId)
            : mission.link;

        window.open(link, '_blank');
        setClaiming(mission.id);

        setTimeout(() => {
            const newCompleted = [...completedMissions, mission.id];
            setCompletedMissions(newCompleted);
            localStorage.setItem('completedMissions', JSON.stringify(newCompleted));
            onReward(mission.reward);
            setClaiming(null);
        }, 5000);
    };

    // Separate daily and one-time missions
    const dailyMissions = MISSIONS.filter(m => m.isDaily);
    const otherMissions = MISSIONS.filter(m => !m.isDaily);

    const renderMission = (mission: Mission) => {
        const isCompleted = completedMissions.includes(mission.id);
        const isClaiming = claiming === mission.id;

        return (
            <div
                key={mission.id}
                className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${isCompleted
                        ? 'bg-gray-900/30 border-gray-800/50 opacity-60'
                        : 'bg-gray-900/80 border-gray-700/50 hover:border-primary-purple/40'
                    }`}
            >
                {!isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                <div className="relative p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${isCompleted
                                ? 'bg-gray-800/50 border-gray-700/30 text-gray-600'
                                : 'bg-gradient-to-br from-purple-600/20 to-purple-900/30 border-purple-500/20 text-purple-400 group-hover:border-purple-500/40 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.15)]'
                            }`}>
                            {getMissionIcon(mission)}
                        </div>
                        <div>
                            <h3 className={`font-bold text-[15px] leading-tight ${isCompleted ? 'text-gray-500' : 'text-white'}`}>
                                {mission.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs font-mono text-primary-purple flex items-center gap-1">
                                    +{mission.reward.toLocaleString()} 💰
                                </p>
                                {mission.isDaily && (
                                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-purple-500/20">Daily</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className={`px-4 py-2 rounded-xl font-bold text-xs min-w-[80px] transition-all transform active:scale-95
                            ${isCompleted
                                ? 'bg-gray-800/50 text-gray-600 cursor-default border border-gray-700/30'
                                : isClaiming
                                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 cursor-wait animate-pulse'
                                    : mission.id === 'daily_login'
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black border border-yellow-400/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                        : 'bg-gradient-to-r from-primary-purple to-purple-600 text-white border border-purple-500/30 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                            }`}
                        disabled={isCompleted || isClaiming}
                        onClick={() => handleMissionClick(mission)}
                    >
                        {isCompleted ? '✓ DONE' : isClaiming ? 'WAIT...' : mission.id === 'daily_login' ? 'CLAIM' : 'GO →'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md h-[75vh] rounded-t-3xl p-6 border-t border-primary-purple shadow-[0_-5px_30px_rgba(124,58,237,0.2)] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-purple to-transparent opacity-50" />
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary-purple/5 to-transparent pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-purple to-purple-500 drop-shadow-lg" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                        MISSIONS
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">✕</button>
                </div>

                <div className="overflow-y-auto pb-8 relative z-10 custom-scrollbar space-y-6">
                    {/* Daily Section */}
                    <div>
                        <h3 className="text-[10px] font-bold text-purple-400/60 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                            Daily Rewards
                        </h3>
                        <div className="space-y-2.5">
                            {dailyMissions.map(renderMission)}
                        </div>
                    </div>

                    {/* One-Time   Section */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-500" />
                            Social Tasks
                        </h3>
                        <div className="space-y-2.5">
                            {otherMissions.map(renderMission)}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 text-center">
                    <p className="text-gray-600 text-[9px] uppercase tracking-widest font-bold">
                        Daily missions reset at 00:00 UTC
                    </p>
                </div>
            </div>
        </div>
    );
};
