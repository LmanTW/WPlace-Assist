import { visualizer } from 'rollup-plugin-visualizer'
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import fs from 'fs'

import info from './package.json'

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.tsx',
      name: 'WPlace-Assist',

      formats: ['umd'],
      fileName: () => 'WPlace-Assist-Standalone.js'
    }
  },

  esbuild: {
    legalComments: 'none'
  },
 
  plugins: [
    preact(),

    visualizer({
      filename: './dist/Bundle-Stats.html'
    }),

    {
      name: 'Tempermonkey',

      closeBundle() {
        if (fs.existsSync('./dist/WPlace-Assist-Standalone.js')) {
          const source = 'window.addEventListener(\'load\',()=>{' + fs.readFileSync('./dist/WPlace-Assist-Standalone.js', 'utf8').split('\n')[0] + '})'
          const date = new Date()

          const lines: string[] = [
            '// ==UserScript==',
            '// @name         WPlace-Assist',
            '// @description  A userscript for wplace.live that makes painting easier by selecting the color automatically for you! This script is not affiliated with wplace.live in any way, use at your own risk.',
            `// @version      ${info.version} (${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}:${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')})`,
            '// @author       LmanTW',
            '// @namespace    https://github.com/LmanTW/WPlace-Assist',
            `// @match        https://wplace.live/*`,
            '// @unwrap',
            '// ==/UserScript=='
          ] 

          fs.writeFileSync('./dist/WPlace-Assist-Tampermonkey.js', lines.join('\n') + '\n\n' + source)
        } 
      }
    }
  ]
})
