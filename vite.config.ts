// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import {defineConfig, loadEnv} from 'vite';

// export default defineConfig(({mode}) => {
//   const env = loadEnv(mode, '.', '');
//   return {
//     plugins: [react(), tailwindcss()],
//     define: {
//       'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
//     },
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, '.'),
//       },
//     },
//     server: {
//       // HMR is disabled in AI Studio via DISABLE_HMR env var.
//       // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
//       hmr: process.env.DISABLE_HMR !== 'true',
//     },
//   };
// });

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // ✅ 关键新增：适配 GitHub Pages 的基础路径
    // 格式必须是 /你的仓库名/，前后斜杠都不能少
    base: '/jieshuichanyeAI/',

    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // 保留你原来的 HMR 配置，不影响本地开发
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
