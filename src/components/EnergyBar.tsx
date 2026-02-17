
import React from 'react';

interface EnergyBarProps {
    current: number;
    max: number;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({ current, max }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    const isLow = percentage < 20;
    const isCritical = percentage < 10;

    return (
        <div className="w-full max-w-xs mx-auto mt-6">
            {/* Labels */}
            <div className="flex justify-between text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">
                <span className="flex items-center gap-1.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : isLow ? 'bg-yellow-500' : 'bg-neon-purple'}`} />
                    Energy
                </span>
                <span className={`font-mono ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-neon-purple'} transition-colors duration-300`}>
                    {Math.floor(current)} <span className="text-gray-600">/</span> {max}
                </span>
            </div>

            {/* Bar Container */}
            <div className="relative h-6 bg-gray-900/80 rounded-full overflow-hidden border border-gray-700/50 backdrop-blur-sm shadow-inner">
                {/* Segment Lines */}
                <div className="absolute inset-0 flex pointer-events-none z-10">
                    {[20, 40, 60, 80].map(pos => (
                        <div
                            key={pos}
                            className="absolute top-0 bottom-0 w-px bg-gray-700/30"
                            style={{ left: `${pos}%` }}
                        />
                    ))}
                </div>

                {/* Fill Bar */}
                <div
                    className={`h-full transition-all duration-300 ease-out relative rounded-full ${isCritical
                            ? 'bg-gradient-to-r from-red-700 via-red-500 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                            : isLow
                                ? 'bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)]'
                                : 'bg-gradient-to-r from-secondary-purple via-primary-purple to-neon-purple shadow-[0_0_15px_rgba(167,139,250,0.6)]'
                        }`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Shimmer Sweep */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                        <div className="animate-shimmer absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>

                    {/* Leading edge glow */}
                    <div
                        className="absolute top-0 right-0 bottom-0 w-3 rounded-full"
                        style={{
                            background: `radial-gradient(circle at right, ${isCritical ? 'rgba(239,68,68,0.8)' : isLow ? 'rgba(234,179,8,0.8)' : 'rgba(167,139,250,0.8)'}, transparent)`,
                        }}
                    />
                </div>

                {/* Ambient glow overlay */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
                    style={{
                        boxShadow: isCritical
                            ? 'inset 0 0 15px rgba(239,68,68,0.2)'
                            : isLow
                                ? 'inset 0 0 15px rgba(234,179,8,0.15)'
                                : 'inset 0 0 15px rgba(124,58,237,0.15)',
                    }}
                />
            </div>
        </div>
    );
};
