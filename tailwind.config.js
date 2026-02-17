/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-purple': '#7C3AED',
                'secondary-purple': '#5B21B6',
                'neon-purple': '#A78BFA',
                'accent-cyan': '#22D3EE',
                'accent-pink': '#F472B6',
                'deep-dark': '#050510',
                'panel-bg': '#11061F',
                'glass-bg': 'rgba(17, 6, 31, 0.6)',
            },
            fontFamily: {
                sans: ['"Rajdhani"', 'sans-serif'],
                mono: ['"Courier New"', 'Courier', 'monospace'],
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s ease-in-out infinite',
                'orb-float': 'orbFloat 8s ease-in-out infinite',
                'spin-slow': 'spinSlow 20s linear infinite',
            },
            keyframes: {
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.1)' },
                    '50%': { boxShadow: '0 0 30px rgba(124,58,237,0.5), 0 0 60px rgba(124,58,237,0.2)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(400%)' },
                },
                orbFloat: {
                    '0%, 100%': { transform: 'translateY(0px) scale(1)', opacity: '0.15' },
                    '50%': { transform: 'translateY(-30px) scale(1.1)', opacity: '0.25' },
                },
                spinSlow: {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
            },
        },
    },
    plugins: [],
}
