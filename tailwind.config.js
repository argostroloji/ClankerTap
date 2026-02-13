
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-green': '#00ff41',
                'secondary-green': '#008F11',
                'neon-green': '#2ecc71',
                'deep-dark': '#050a05',
                'panel-bg': '#0a140a',
            },
            fontFamily: {
                sans: ['"Rajdhani"', 'sans-serif'],
                mono: ['"Courier New"', 'Courier', 'monospace'],
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glitch': 'glitch 1s linear infinite',
            },
            keyframes: {
                glitch: {
                    '0%, 100%': { transform: 'translate(0)' },
                    '20%': { transform: 'translate(-2px, 2px)' },
                    '40%': { transform: 'translate(-2px, -2px)' },
                    '60%': { transform: 'translate(2px, 2px)' },
                    '80%': { transform: 'translate(2px, -2px)' },
                },
            },
        },
    },
    plugins: [],
}
