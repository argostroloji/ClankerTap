
import React, { useEffect, useState } from 'react';
import clankerLogo from '../assets/clanker_button.png';

interface SplashScreenProps {
    onFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 15 + 5;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setFadeOut(true), 300);
                    setTimeout(() => onFinished(), 800);
                    return 100;
                }
                return next;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [onFinished]);

    return (
        <div className={`fixed inset-0 z-[100] bg-deep-dark flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-purple/10 blur-[120px] animate-pulse" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[80px] animate-orb-float" />
            </div>

            {/* Logo & Title */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Animated ring */}
                <div className="relative w-28 h-28">
                    <div className="absolute inset-0 rounded-full border-2 border-primary-purple/20 animate-spin-slow" />
                    <div className="absolute inset-2 rounded-full border border-purple-400/30 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
                    <div className="absolute inset-3 rounded-full overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                        <img src={clankerLogo} alt="Clanker Tap" className="w-full h-full object-cover rounded-full" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-5xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-300 leading-none pr-3" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                        CLANKER TAP
                    </h1>
                    <p className="text-xs text-purple-400/60 font-bold tracking-[0.3em] uppercase mt-2">
                        Tap • Earn • Upgrade
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-56 mt-4">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-purple to-purple-400 rounded-full transition-all duration-300 ease-out relative"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-gray-600 font-mono tracking-widest mt-2">
                        {progress >= 100 ? 'READY' : 'LOADING...'}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-center">
                <p className="text-[9px] text-gray-700 tracking-widest uppercase">
                    Built on Base
                </p>
            </div>
        </div>
    );
};
