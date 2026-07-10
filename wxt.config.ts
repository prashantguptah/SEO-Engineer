import { defineConfig } from 'wxt'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  srcDir: '.',
  outDir: 'dist',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'SEO Reverse Engineer',
    description: 'Reverse engineer why a page ranks well in search engines',
    version: '1.1.0',
    permissions: ['activeTab', 'scripting', 'storage', 'sidePanel'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'SEO Reverse Engineer',
    },
    icons: {
      16: '/icon.svg',
      48: '/icon.svg',
      128: '/icon.svg',
    },
  },
  vite: () => ({
    css: {
      postcss: './postcss.config.js',
    },
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'popup'),
      },
    },
  }),
})
