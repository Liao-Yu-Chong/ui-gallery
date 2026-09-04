export default {
    plugins: {
        // Tailwind v4 起 PostCSS plugin 拆成獨立套件；
        // v4 內建 vendor prefix，不再需要 autoprefixer。
        '@tailwindcss/postcss': {},
    },
};
