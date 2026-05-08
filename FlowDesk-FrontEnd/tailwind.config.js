/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        space: {
          DEFAULT: "#050816",
          secondary: "#0b1023",
          tertiary: "#12182d",
        },

        neon: {
          red: "#ff4d6d",
          orange: "#ff8a3d",
          yellow: "#ffd166",
          green: "#06d6a0",
          cyan: "#4cc9f0",
        },

        glass: {
          light: "rgba(255,255,255,0.08)",
          medium: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.12)",
          border: "rgba(255,255,255,0.14)",
        },

        ticket: {
          high: "#ff4d6d",
          medium: "#ffd166",
          low: "#06d6a0",
        },
      },

      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.45)",

        neonRed: `
          0 0 10px rgba(255,77,109,0.45),
          0 0 20px rgba(255,77,109,0.35),
          0 0 40px rgba(255,77,109,0.25)
        `,

        neonOrange: `
          0 0 10px rgba(255,138,61,0.45),
          0 0 20px rgba(255,138,61,0.35),
          0 0 40px rgba(255,138,61,0.25)
        `,

        neonYellow: `
          0 0 10px rgba(255,209,102,0.45),
          0 0 20px rgba(255,209,102,0.35),
          0 0 40px rgba(255,209,102,0.25)
        `,

        neonGreen: `
          0 0 10px rgba(6,214,160,0.45),
          0 0 20px rgba(6,214,160,0.35),
          0 0 40px rgba(6,214,160,0.25)
        `,
      },

      backdropBlur: {
        xs: "2px",
      },

      borderRadius: {
        "4xl": "2rem",
      },

      backgroundImage: {
        stars: `
          radial-gradient(circle at top left,
          rgba(255,77,109,0.18),
          transparent 25%),

          radial-gradient(circle at top right,
          rgba(255,209,102,0.12),
          transparent 30%),

          radial-gradient(circle at bottom left,
          rgba(6,214,160,0.10),
          transparent 28%),

          radial-gradient(circle at bottom right,
          rgba(255,138,61,0.14),
          transparent 28%)
        `,

        glass: `
          linear-gradient(
            135deg,
            rgba(255,255,255,0.10),
            rgba(255,255,255,0.03)
          )
        `,
      },

      keyframes: {
        fadeIn: {
          from: {
            opacity: 0,
            transform: "translateY(12px)",
          },

          to: {
            opacity: 1,
            transform: "translateY(0px)",
          },
        },

        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },

          "50%": {
            transform: "translateY(-8px)",
          },
        },

        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(255,138,61,0.20)",
          },

          "50%": {
            boxShadow: "0 0 24px rgba(255,138,61,0.45)",
          },
        },

        borderFlow: {
          "0%": {
            borderColor: "rgba(255,77,109,0.3)",
          },

          "50%": {
            borderColor: "rgba(255,138,61,0.7)",
          },

          "100%": {
            borderColor: "rgba(6,214,160,0.3)",
          },
        },
      },

      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.5s infinite",
        borderFlow: "borderFlow 4s linear infinite",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [],
};