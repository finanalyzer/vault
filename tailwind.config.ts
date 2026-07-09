import conf from "@openbb/ui/tailwind.config";
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const light = {
  50: "#f7f8f9",
  100: "#f3f4f7",
  200: "#ebecf0",
  300: "#d6dce5",
  400: "#d0d5dd",
  500: "#9da5b2",
  600: "#667085",
  700: "#485468",
  750: "#3d4758",
  800: "#354055",
  850: "#1e2939",
  900: "#0f1828",
};

const grey = light;

const dark = {
  50: "#8a8a90",
  100: "#6d6e74",
  200: "#5a5961",
  300: "#505059",
  400: "#46464f",
  500: "#36363f",
  600: "#303038",
  700: "#2a2a31",
  750: "#24242a",
  800: "#212127",
  850: "#1c1b20",
  900: "#151518",
};

const lightBlue = {
  50: "#ECF7FF",
  100: "#CCEEFF",
  200: "#99DDFF",
  300: "#66CCFF",
  400: "#33BBFF",
  500: "#00AAFF",
  600: "#0088CC",
  700: "#006699",
  800: "#004466",
  900: "#002D48",
};

const darkBlue = {
  50: "#F2F7FB",
  100: "#CCDEEE",
  200: "#99BEDD",
  300: "#669DCB",
  400: "#337DBA",
  500: "#005CA9",
  600: "#004A87",
  700: "#003765",
  800: "#002544",
  900: "#000E21",
};

const purple = {
  50: "#F6F4F8",
  100: "#DAD4E5",
  200: "#B6A9CB",
  300: "#917DB0",
  400: "#6D5296",
  500: "#48277C",
  600: "#3A1F63",
  700: "#2B174A",
  800: "#1D1032",
  900: "#16082C",
};

const danger = {
  50: "#FEF2F2",
  100: "#FEE2E2",
  200: "#FECACA",
  300: "#FCA5A5",
  400: "#F87171",
  500: "#EF4444",
  600: "#DC2626",
  700: "#B91C1C",
  800: "#991B1B",
  900: "#7F1D1D",
};

const warning = {
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F97316",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12",
};

const success = {
  50: "#F0FDF4",
  100: "#DCFCE7",
  200: "#BBF7D0",
  300: "#86EFAC",
  400: "#4ADE80",
  500: "#22C55E",
  600: "#16A34A",
  700: "#15803D",
  800: "#166534",
  900: "#14532D",
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./node_modules/@openbb/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [conf],
  plugins: [typography],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        light,
        grey,
        dark,
        "light-blue": lightBlue,
        "dark-blue": darkBlue,
        purple,
        danger,
        warning,
        success,
        info: lightBlue,
        red: danger,
        green: success,
        brand: {
          main: "#0088CC",
          lighter: "#4dacdb",
          darker: "#005f8f",
        },
      },
      boxShadow: {
        "light-1": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "light-2":
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "light-3":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "light-4":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "light-5":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "light-6": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "dark-1": "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "dark-2":
          "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "dark-3":
          "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        "dark-4":
          "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
        "dark-5":
          "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
        "dark-6": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      },
    },
  },
} satisfies Config;