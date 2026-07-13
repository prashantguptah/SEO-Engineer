import { defineConfig } from 'wxt'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  srcDir: '.',
  outDir: 'dist',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'keywordwalks',
    description: 'Keywords, research, and on-page SEO analysis — right in your browser',
    version: '1.1.0',
    permissions: ['activeTab', 'scripting', 'storage', 'sidePanel', 'contextMenus'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'keywordwalks',
    },
    commands: {
      'analyze-page': {
        suggested_key: {
          default: 'Alt+Shift+S',
          mac: 'Alt+Shift+S',
        },
        description: 'Open keywordwalks and analyze the page',
      },
    },
    icons: {
      16: '/icon.png',
      48: '/icon.png',
      128: '/icon.png',
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
