/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                neon: {
                    cyan: "#00f3ff",
                    pink: "#ff00ff",
                    purple: "#bc13fe",
                    green: "#0aff0a",
                    black: "#0a0a0a",
                    dark: "#111111",
                },
                surface: {
                    100: "rgba(255, 255, 255, 0.05)",
                    200: "rgba(255, 255, 255, 0.1)",
                    glass: "rgba(20, 20, 20, 0.6)",
                },
            },
            fontFamily: {
                orbitron: ['"Orbitron"', "sans-serif"],
                inter: ['"Inter"', "sans-serif"],
            },
            animation: {
                "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                scan: "scan 3s linear infinite",
            },
            keyframes: {
                scan: {
                    "0%": { top: "0%" },
                    "100%": { top: "100%" },
                },
            },
        },
    },
    plugins: [],
};
