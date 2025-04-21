/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF00FF',    // Vibrant pink
                secondary: '#FF0033',  // Deep red
                dark: '#000000',       // Black
                light: '#FFFFFF',      // White
            },
        },
    },
    plugins: [],
}