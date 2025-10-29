module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',  // Extra small devices
      },
      colors: {
        ink: "#090e1a",
        brand: "#f59e0b",
        brandLight: "#FFCB45", // Color secundario del degradado naranja Enerbook
        cardBg: "#fcfcfc",
        cardBorder: "#e5e7eb"  // gray-200 - Borde estándar para todas las cards
      },
      fontSize: {
        // Tamaños estandarizados del sistema
        'xs': '11px',      // Labels pequeños, badges
        'sm': '14px',      // TAMAÑO BASE - Texto principal del sistema
        'base': '17px',    // Títulos de cards, valores destacados
        'lg': '18px',      // Títulos de sección
        'xl': '20px',      // Títulos de página
        '2xl': '24px',     // Títulos principales
      },
      borderRadius: {
        'card': '1rem',      // 16px - rounded-2xl
        'card-sm': '0.5rem'  // 8px - rounded-lg
      },
      borderColor: {
        'card': '#e5e7eb',     // gray-200 - Borde principal (usar border-card)
        'card-light': '#f3f4f6' // gray-100 - Deprecado, migrar a border-card
      },
      backgroundColor: {
        'card': '#fcfcfc',
        'card-alt': '#f9fafb'  // gray-50
      },
      container: {
        center: true,
        padding: "1rem"
      }
    }
  },
  plugins: [],
};
