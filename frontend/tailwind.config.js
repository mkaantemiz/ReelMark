/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0a0a0f',
                    800: '#111118',
                    700: '#1a1a2e',
                    600: '#16213e',
                    500: '#1f2651',
                },
                accent: {
                    primary: '#e50914',
                    secondary: '#f5a623',
                    purple: '#7c3aed',
                    blue: '#0ea5e9',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
