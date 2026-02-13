
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
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md h-[70vh] rounded-t-2xl p-6 border-t border-neon-orange shadow-[0_-5px_20px_rgba(255,95,31,0.3)] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white gltich" data-text="MISSIONS">MISSIONS</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                <div className="space-y-4 overflow-y-auto">
                    {MISSIONS.map((mission) => {
                        const isCompleted = completedMissions.includes(mission.id);
                        const isClaiming = claiming === mission.id;

                        return (
                            <div key={mission.id} className="bg-deep-dark p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{mission.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-white">{mission.title}</h3>
                                        <p className="text-xs text-electric-blue">+{mission.reward.toLocaleString()} 💰</p>
                                    </div>
                                </div>
                                <button
                                    className={`px-4 py-2 rounded-lg font-bold text-sm min-w-[80px] transition-all
                                        ${isCompleted
                                            ? 'bg-green-900/50 text-green-400 cursor-default'
                                            : isClaiming
                                                ? 'bg-yellow-600/50 text-yellow-200 cursor-wait'
                                                : 'bg-neon-orange text-black hover:bg-orange-400'}`}
                                    disabled={isCompleted || isClaiming}
                                    onClick={() => handleMissionClick(mission)}
                                >
                                    {isCompleted ? 'DONE' : isClaiming ? 'Wait 5s...' : 'GO'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    New missions appear daily at 00:00 UTC.
                </p>
            </div>
        </div>
    );
};
