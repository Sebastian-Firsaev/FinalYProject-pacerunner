/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This will include all files with .js, .jsx, .ts, and .tsx extensions in the src directory and its subdirectories
    "./public/index.html", // This includes the main HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

