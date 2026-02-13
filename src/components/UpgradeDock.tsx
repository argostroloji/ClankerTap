
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

export const UpgradeDock: React.FC<UpgradeDockProps> = ({ snips, upgrades, onPurchase, isOpen, onClose }) => {
    if (!isOpen) return null;

    const getCost = (type: UpgradeType, level: number) => {
        const base = UPGRADE_DEFINITIONS[type].baseCost;
        return Math.floor(base * Math.pow(1.5, level)); // Cost increases with level
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md h-[70vh] rounded-t-3xl p-6 border-t border-primary-green shadow-[0_-5px_30px_rgba(0,255,65,0.2)] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-green to-transparent opacity-50"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-white to-emerald-400 drop-shadow-md" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                        UPGRADES
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">✕</button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar relative z-10 pb-6">
                    {(Object.keys(UPGRADE_DEFINITIONS) as UpgradeType[]).map((type) => {
                        const def = UPGRADE_DEFINITIONS[type];
                        const level = getUpgradeLevel(type, upgrades);
                        const cost = getCost(type, level);
                        const canAfford = snips >= cost;

                        return (
                            <div key={type} className="group bg-gray-900/60 p-4 rounded-2xl border border-gray-800 hover:border-primary-green/50 hover:bg-gray-800/80 transition-all duration-300 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                                        {def.emoji}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                                            {def.name}
                                            <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono">Lvl {level}</span>
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">{def.description}</p>
                                    </div>
                                </div>
                                <button
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all transform active:scale-95 flex items-center gap-1 shadow-lg
                                        ${canAfford
                                            ? 'bg-gradient-to-r from-primary-green to-emerald-600 text-black hover:brightness-110 hover:shadow-primary-green/20'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}
                                    disabled={!canAfford}
                                    onClick={() => onPurchase(type)}
                                >
                                    {cost.toLocaleString()} <span className="text-[10px]">💰</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
