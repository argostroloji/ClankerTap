
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
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md rounded-t-2xl p-6 border-t border-neon-orange shadow-[0_-5px_20px_rgba(255,95,31,0.3)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white gltich" data-text="UPGRADES">UPGRADES</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {(Object.keys(UPGRADE_DEFINITIONS) as UpgradeType[]).map((type) => {
                        const def = UPGRADE_DEFINITIONS[type];
                        const level = getUpgradeLevel(type, upgrades);
                        const cost = getCost(type, level);
                        const canAfford = snips >= cost;

                        return (
                            <div key={type} className="bg-deep-dark p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{def.emoji}</span>
                                    <div>
                                        <h3 className="font-bold text-white">{def.name} <span className="text-xs text-neon-orange ml-1">Lvl {level}</span></h3>
                                        <p className="text-xs text-gray-400">{def.description}</p>
                                    </div>
                                </div>
                                <button
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all
                                        ${canAfford
                                            ? 'bg-neon-orange text-black hover:bg-orange-400 hover:scale-105'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                    disabled={!canAfford}
                                    onClick={() => onPurchase(type)}
                                >
                                    {cost.toLocaleString()} 💰
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
