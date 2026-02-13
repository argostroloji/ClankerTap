
import React from 'react';

interface EnergyBarProps {
    current: number;
    max: number;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({ current, max }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="w-full max-w-xs mx-auto mt-8">
            <div className="flex justify-between text-xs text-electric-blue mb-1 font-mono">
                <span>ENERGY</span>
                <span>{Math.floor(current)} / {max}</span>
            </div>

            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                {/* Background grid pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>

                {/* Fill bar */}
                <div
                    className="h-full bg-gradient-to-r from-blue-600 via-electric-blue to-white transition-all duration-300 ease-out shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                    style={{ width: `${percentage}%` }}
                ></div>

                {/* Glitch overlay */}
                <div className="absolute top-0 right-0 w-1 h-full bg-white opacity-50"></div>
            </div>
        </div>
    );
};
