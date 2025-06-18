module.exports = {
  content: ["./public/**/*.html",
            "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['Share Tech Mono', 'monospace'],
        'akiraexpanded': ['Akira Expanded', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
