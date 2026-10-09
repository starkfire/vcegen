import path from "node:path"
import process from "node:process"
import { defineConfig, loadEnv } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"

const host = process.env.TAURI_DEV_HOST

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())

    return {
        define: {
            __APP_ENV__: JSON.stringify(env.APP_ENV),
        },
        plugins: [
            react(),
            babel({ presets: [reactCompilerPreset()] }),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                "@": path.resolve(import.meta.dirname, "./src"),
            },
        },
        build: {
            outDir: "dist",
            emptyOutDir: true,
            chunkSizeWarningLimit: 1000,
        },
        // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
        // 1. prevent vite from obscuring rust errors
        clearScreen: false,
        // 2. tauri expects a fixed port, fail if that port is not available
        server: {
            port: 1420,
            strictPort: true,
            host: host || false,
            hmr: host
                ? {
                    protocol: "ws",
                    host,
                    port: 1421,
                }
                : undefined,
            watch: {
                // 3. tell vite to ignore watching `src-tauri`
                ignored: ["**/src-tauri/**"],
            },
        },
        // env variables prefixed with TAURI_ENV_* are exposed alongside VITE_*
        envPrefix: ["VITE_", "TAURI_ENV_"],
    }
})
