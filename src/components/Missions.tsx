
import React, { useState, useEffect } from 'react';
import { MISSIONS } from '../constants/gameData';
import type { Mission } from '../constants/gameData';

interface MissionsProps {
    isOpen: boolean;
    onClose: () => void;
    onReward: (amount: number) => void;
}

export const Missions: React.FC<MissionsProps> = ({ isOpen, onClose, onReward }) => {
    // Track completed mission IDs
    const [completedMissions, setCompletedMissions] = useState<string[]>([]);
    const [claiming, setClaiming] = useState<string | null>(null);

    // Initial load from local storage
    useEffect(() => {
        const stored = localStorage.getItem('completedMissions');
        if (stored) {
            setCompletedMissions(JSON.parse(stored));
        }
    }, []);

    if (!isOpen) return null;

    const handleMissionClick = (mission: Mission) => {
        if (completedMissions.includes(mission.id)) return;

        // Open link
        window.open(mission.link, '_blank');

        // Simulate verification (standard clicker game pattern: click -> wait -> claim)
        setClaiming(mission.id);

        // Wait 5 seconds then award
        setTimeout(() => {
            const newCompleted = [...completedMissions, mission.id];
            setCompletedMissions(newCompleted);
            localStorage.setItem('completedMissions', JSON.stringify(newCompleted));

            onReward(mission.reward);
            setClaiming(null);

            // Play success sound/vibration here if possible via parent or generic hook
        }, 5000);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md h-[75vh] rounded-t-3xl p-6 border-t border-primary-green shadow-[0_-5px_30px_rgba(0,255,65,0.2)] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-green to-transparent opacity-50"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-green to-emerald-500 drop-shadow-lg" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                        MISSIONS
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">✕</button>
                </div>

                <div className="space-y-4 overflow-y-auto pb-8 relative z-10 custom-scrollbar">
                    {MISSIONS.map((mission) => {
                        const isCompleted = completedMissions.includes(mission.id);
                        const isClaiming = claiming === mission.id;

                        return (
                            <div key={mission.id} className={`group relative p-4 rounded-2xl border transition-all duration-300 ${isCompleted ? 'bg-gray-900/40 border-gray-800 opacity-70' : 'bg-gray-900/80 border-gray-700 hover:border-primary-green/50 hover:bg-gray-800'}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-800 ${isCompleted ? 'grayscale' : 'group-hover:scale-110 transition-transform'}`}>
                                            {mission.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg leading-tight ${isCompleted ? 'text-gray-500' : 'text-white'}`}>{mission.title}</h3>
                                            <p className="text-sm font-mono text-primary-green flex items-center gap-1">
                                                +{mission.reward.toLocaleString()} <span className="text-emerald-400">💰</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className={`px-5 py-2 rounded-xl font-bold text-sm min-w-[90px] transition-all transform active:scale-95 shadow-lg
                                            ${isCompleted
                                                ? 'bg-transparent border border-gray-700 text-gray-500 cursor-default'
                                                : isClaiming
                                                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 cursor-wait animate-pulse'
                                                    : 'bg-gradient-to-r from-primary-green to-emerald-600 text-black border border-transparent hover:brightness-110 hover:shadow-primary-green/20'}`}
                                        disabled={isCompleted || isClaiming}
                                        onClick={() => handleMissionClick(mission)}
                                    >
                                        {isCompleted ? 'DONE' : isClaiming ? 'WAIT...' : 'START'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto pt-6 text-center">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">
                        Resets Daily at 00:00 UTC
                    </p>
                </div>
            </div>
        </div>
    );
};
