import React, { useState, useCallback } from 'react';
import bagImg from '../assets/bag.jpg';

interface MainStageProps {
    onTap: () => boolean;
    tapValue: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    value: number;
}

export const MainStage: React.FC<MainStageProps> = ({ onTap, tapValue }) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        // Prevent default behavior to avoid double-firing on some touch devices
        // e.preventDefault(); 

        if (onTap()) {
            // Create particle effect
            const rect = e.currentTarget.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

            const x = clientX - rect.left;
            const y = clientY - rect.top;

            const newParticle: Particle = {
                id: Date.now(),
                x,
                y,
                value: tapValue,
            };

            setParticles((prev) => [...prev, newParticle]);

            // Remove particle after animation
            setTimeout(() => {
                setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
            }, 1000);

            // Animation trigger
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 100);
        }
    }, [onTap, tapValue]);

    return (
        <div
            className="relative w-64 h-64 mx-auto mt-10 cursor-pointer select-none touch-manipulation"
            onClick={handleClick}
        // onTouchStart={handleClick} // React handles touch/click unification well usually, but check if needed
        >
            {/* Bag Logo */}
            <div
                className={`w-full h-full flex items-center justify-center transition-transform duration-100 ${isAnimating ? 'scale-95' : 'scale-100'}`}
            >
                <img
                    src={bagImg}
                    alt="Tap Bag"
                    className="w-full h-full object-cover rounded-full filter drop-shadow-[0_0_20px_rgba(46,204,113,0.6)]"
                    draggable="false"
                />

                {/* Decorative elements */}
                <div className="absolute inset-0 border-4 border-electric-blue rounded-full opacity-30 animate-pulse-fast pointer-events-none"></div>
                <div className="absolute -inset-4 border border-dashed border-green-500 rounded-full opacity-20 spin-slow pointer-events-none"></div>
            </div>

            {/* Floating Particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute text-2xl font-bold text-white pointer-events-none animate-float-up"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    +{particle.value}
                </div>
            ))}
        </div>
    );
};
