import React, { useState, useCallback } from 'react';
import clankerButton from '../assets/clanker_button.png';
import clankerCoin from '../assets/clanker_coin.png';
import { playSound } from '../lib/audio';

interface MainStageProps {
    onTap: () => boolean;
    tapValue: number;
    comboMultiplier?: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    value: number;
}

interface Ripple {
    id: number;
    x: number;
    y: number;
}

interface CoinParticle {
    id: number;
    x: number;
    y: number;
    angle: number;
    distance: number;
    rotation: number;
    scale: number;
}

export const MainStage: React.FC<MainStageProps> = ({ onTap, tapValue, comboMultiplier = 1 }) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [coins, setCoins] = useState<CoinParticle[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [tapCount, setTapCount] = useState(0);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (onTap()) {
            playSound('slap');

            // Shake
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 200);

            // Get tap position
            const rect = e.currentTarget.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            const now = Date.now();

            // Floating score particle
            const newParticle: Particle = { id: now, x, y, value: tapValue };
            setParticles(prev => [...prev, newParticle]);
            setTimeout(() => setParticles(prev => prev.filter(p => p.id !== now)), 1200);

            // Ripple effect
            const ripple: Ripple = { id: now + 1, x, y };
            setRipples(prev => [...prev, ripple]);
            setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 600);

            // Clanker coin burst (4-6 coins, more at higher combo)
            const coinCount = 4 + Math.floor(Math.random() * 3) + (comboMultiplier >= 5 ? 3 : 0);
            const newCoins: CoinParticle[] = Array.from({ length: coinCount }, (_, i) => ({
                id: now + 100 + i,
                x,
                y,
                angle: (360 / coinCount) * i + Math.random() * 30 - 15,
                distance: 50 + Math.random() * 60 + (comboMultiplier >= 10 ? 30 : 0),
                rotation: Math.random() * 360,
                scale: 0.6 + Math.random() * 0.5,
            }));
            setCoins(prev => [...prev, ...newCoins]);
            setTimeout(() => setCoins(prev => prev.filter(c => !newCoins.find(nc => nc.id === c.id))), 800);

            // Scale animation
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 100);

            // Track taps for combo visual
            setTapCount(prev => prev + 1);
        }
    }, [onTap, tapValue, comboMultiplier]);

    // Dynamic glow intensity based on rapid tapping
    const glowIntensity = Math.min(tapCount * 0.05, 1);

    // Fire ring colors based on combo
    const isOnFire = comboMultiplier >= 5;
    const isInferno = comboMultiplier >= 10;

    return (
        <div
            className="relative w-72 h-72 mx-auto cursor-pointer select-none touch-manipulation"
            onClick={handleClick}
        >
            {/* Ambient glow behind button */}
            <div
                className="absolute inset-0 rounded-full blur-3xl transition-all duration-500"
                style={{
                    background: isInferno
                        ? `radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(251,146,60,0.2) 40%, transparent 70%)`
                        : isOnFire
                            ? `radial-gradient(circle, rgba(251,146,60,0.3) 0%, rgba(124,58,237,0.15) 50%, transparent 70%)`
                            : `radial-gradient(circle, rgba(124,58,237,${0.2 + glowIntensity * 0.3}) 0%, transparent 70%)`,
                }}
            />

            {/* Fire ring — combo x5+ */}
            {isOnFire && (
                <>
                    <div className={`absolute -inset-4 rounded-full pointer-events-none transition-all duration-300 ${isInferno ? 'animate-pulse' : ''}`}
                        style={{
                            background: isInferno
                                ? 'conic-gradient(from 0deg, rgba(239,68,68,0.6), rgba(251,146,60,0.5), rgba(234,179,8,0.4), rgba(239,68,68,0.6))'
                                : 'conic-gradient(from 0deg, rgba(251,146,60,0.4), rgba(234,179,8,0.3), rgba(251,146,60,0.2), rgba(251,146,60,0.4))',
                            mask: 'radial-gradient(circle, transparent 58%, black 60%, black 70%, transparent 72%)',
                            WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%, black 70%, transparent 72%)',
                            animation: isInferno ? 'spin 2s linear infinite' : 'spin 4s linear infinite',
                        }}
                    />
                    {/* Inner fire glow */}
                    <div className="absolute -inset-1 rounded-full pointer-events-none"
                        style={{
                            boxShadow: isInferno
                                ? '0 0 30px rgba(239,68,68,0.4), 0 0 60px rgba(251,146,60,0.2), inset 0 0 20px rgba(239,68,68,0.15)'
                                : '0 0 20px rgba(251,146,60,0.3), 0 0 40px rgba(234,179,8,0.1), inset 0 0 15px rgba(251,146,60,0.1)',
                        }}
                    />
                </>
            )}

            {/* Outer rotating ring */}
            <div className={`absolute -inset-6 border border-dashed rounded-full spin-slow pointer-events-none transition-colors duration-500 ${isInferno ? 'border-red-500/40' : isOnFire ? 'border-orange-500/30' : 'border-purple-500/20'
                }`} />

            {/* Middle pulsing ring */}
            <div className={`absolute -inset-3 border-2 rounded-full animate-glow-pulse pointer-events-none transition-colors duration-500 ${isInferno ? 'border-red-500/20' : isOnFire ? 'border-orange-500/15' : 'border-purple-500/10'
                }`} />

            {/* Character Button */}
            <div
                className={`w-full h-full flex items-center justify-center transition-transform duration-100
                    ${isAnimating ? 'scale-90' : 'scale-100'}
                    ${isShaking ? 'animate-shake' : ''}`}
            >
                <img
                    src={clankerButton}
                    alt="Clanker Button"
                    className="w-full h-full object-cover rounded-full"
                    style={{
                        filter: isInferno
                            ? `drop-shadow(0 0 30px rgba(239,68,68,0.7)) drop-shadow(0 0 60px rgba(251,146,60,0.4))`
                            : isOnFire
                                ? `drop-shadow(0 0 25px rgba(251,146,60,0.5)) drop-shadow(0 0 40px rgba(234,179,8,0.3))`
                                : `drop-shadow(0 0 ${20 + glowIntensity * 20}px rgba(124,58,237,${0.6 + glowIntensity * 0.4}))`,
                    }}
                    draggable="false"
                />

                {/* Inner pulse ring */}
                <div className={`absolute inset-1 border-2 rounded-full animate-pulse-fast pointer-events-none transition-colors duration-500 ${isInferno ? 'border-red-400/30' : isOnFire ? 'border-orange-400/25' : 'border-purple-400/20'
                    }`} />
            </div>

            {/* Ripple Effects */}
            {ripples.map(ripple => (
                <div
                    key={ripple.id}
                    className={`absolute w-20 h-20 border-2 rounded-full animate-ripple pointer-events-none ${isInferno ? 'border-red-400/60' : isOnFire ? 'border-orange-400/60' : 'border-purple-400/60'
                        }`}
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                    }}
                />
            ))}

            {/* Clanker Coin Burst */}
            {coins.map(coin => {
                const rad = (coin.angle * Math.PI) / 180;
                const tx = Math.cos(rad) * coin.distance;
                const ty = Math.sin(rad) * coin.distance;

                return (
                    <img
                        key={coin.id}
                        src={clankerCoin}
                        alt=""
                        className="absolute w-7 h-7 pointer-events-none rounded-full"
                        style={{
                            left: coin.x - 14,
                            top: coin.y - 14,
                            animation: 'coinBurst 0.8s ease-out forwards',
                            transform: `translate(${tx}px, ${ty}px) rotate(${coin.rotation}deg) scale(${coin.scale})`,
                            opacity: 0,
                            filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.6))',
                        }}
                    />
                );
            })}

            {/* Floating Score Particles */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute pointer-events-none animate-float-up"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="flex items-center gap-1">
                        <img src={clankerCoin} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]">
                            +{particle.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
