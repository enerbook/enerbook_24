module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: { colors: { ink: "#090e1a", brand: "#f59e0b" }, container: { center: true, padding: "1rem" } } },
  plugins: [],
};
