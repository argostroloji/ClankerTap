
import React from 'react';
import type { Upgrade, UpgradeType } from '../types';
import { UPGRADE_DEFINITIONS } from '../constants/gameData';

interface UpgradeDockProps {
    isOpen: boolean;
    onClose: () => void;
    snips: number;
    upgrades: Upgrade[];
    onPurchase: (type: UpgradeType) => void;
}

const getUpgradeLevel = (type: UpgradeType, upgrades: Upgrade[]) => {
    return upgrades.find(u => u.upgrade_type === type)?.current_level || 0;
};

// SVG Icons for each upgrade type
const UpgradeIcons: Record<UpgradeType, React.ReactNode> = {
    tap_power: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 00-2-2a2 2 0 00-2 2" />
            <path d="M14 10V4a2 2 0 00-2-2a2 2 0 00-2 2v2" />
            <path d="M10 10.5V6a2 2 0 00-2-2a2 2 0 00-2 2v8" />
            <path d="M18 8a2 2 0 012 2v7.5a5.5 5.5 0 01-11 0v-2.67" />
        </svg>
    ),
    passive_income: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 100 4h4a2 2 0 010 4H8" />
            <path d="M12 18V6" />
        </svg>
    ),
    energy_max: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
            <path d="M23 13v-2" />
            <path d="M11 6v12" />
            <path d="M7 12h0" />
        </svg>
    ),
    energy_regen: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
};

export const UpgradeDock: React.FC<UpgradeDockProps> = ({ snips, upgrades, onPurchase, isOpen, onClose }) => {
    if (!isOpen) return null;

    const getCost = (type: UpgradeType, level: number) => {
        const base = UPGRADE_DEFINITIONS[type].baseCost;
        return Math.floor(base * Math.pow(1.5, level));
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md h-[70vh] rounded-t-3xl p-6 border-t border-primary-purple shadow-[0_-5px_30px_rgba(124,58,237,0.2)] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Decorative top glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-purple to-transparent opacity-50" />
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary-purple/5 to-transparent pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-white to-purple-400 drop-shadow-md" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                        UPGRADES
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">✕</button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar relative z-10 pb-6">
                    {(Object.keys(UPGRADE_DEFINITIONS) as UpgradeType[]).map((type) => {
                        const def = UPGRADE_DEFINITIONS[type];
                        const level = getUpgradeLevel(type, upgrades);
                        const cost = getCost(type, level);
                        const canAfford = snips >= cost;

                        return (
                            <div
                                key={type}
                                className="group relative rounded-2xl border border-gray-700/50 bg-gray-900/80 hover:border-primary-purple/40 transition-all duration-300 overflow-hidden"
                            >
                                {/* Hover gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3.5">
                                        {/* Premium icon container */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:border-purple-500/40 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.15)] transition-all">
                                            {UpgradeIcons[type]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-[15px] leading-tight flex items-center gap-2">
                                                {def.name}
                                                <span className="text-[9px] bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded font-mono border border-purple-500/20">
                                                    Lvl {level}
                                                </span>
                                            </h3>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5">{def.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all transform active:scale-95 flex items-center gap-1.5 min-w-[85px] justify-center
                                            ${canAfford
                                                ? 'bg-gradient-to-r from-primary-purple to-purple-600 text-white border border-purple-500/30 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                                                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/30'}`}
                                        disabled={!canAfford}
                                        onClick={() => onPurchase(type)}
                                    >
                                        {cost.toLocaleString()} 💰
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
