import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY || 'http://127.0.0.1:8000'

  // The browser always calls same-origin /api, and Vite forwards it to Laravel.
  // This avoids mixed-content (https page -> http api) and CORS problems when
  // the app is opened through a dev tunnel or from another device.
  const proxy = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
    },
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: { proxy },
    preview: { proxy },
  }
})
