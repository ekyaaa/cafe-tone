import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#FFFFFF',
                accent: '#E87643',
                bgPrimary: '#000000',
                bgSecondary: '#121212',
                bgThird: '#FFFFFF10',
            },
        },
    },
    plugins: [forms],
};
