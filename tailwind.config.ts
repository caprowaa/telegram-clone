import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Убедись, что эта строка именно такая!
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          primary: '#3390ec',
          sidebar: '#ffffff',
          chat: '#7ca668', // Сделал чуть потемнее, чтобы ты точно увидел зелёный
          bubbleOut: '#eeffde',
          bubbleIn: '#ffffff',
          text: '#000000',
          textSecondary: '#707579',
          border: '#dfe1e5',
        },
      },
    },
  },
  plugins: [],
};
export default config;