
import React from 'react';

interface EnergyBarProps {
    current: number;
    max: number;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({ current, max }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="w-full max-w-xs mx-auto mt-8">
            <div className="flex justify-between text-xs font-bold tracking-widest text-gray-300 mb-2 font-sans uppercase">
                <span>Energy</span>
                <span className="text-neon-green">{Math.floor(current)} <span className="text-gray-500">/</span> {max}</span>
            </div>

            <div className="relative h-5 bg-gray-900/80 rounded-full overflow-hidden border border-gray-700/50 backdrop-blur-sm shadow-inner">
                {/* Fill bar */}
                <div
                    className="h-full bg-gradient-to-r from-green-600 via-neon-green to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(46,204,113,0.6)] relative"
                    style={{ width: `${percentage}%` }}
                >
                    {/* Shine effect */}
                    <div className="absolute top-0 right-0 bottom-0 width-full bg-gradient-to-l from-white/20 to-transparent w-full"></div>
                </div>
            </div>
        </div>
    );
};
