import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
	server: {
		host: true,
		port: 5173
	},
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				admin: resolve(__dirname, 'admin.html')
			}
		}
	}
})
