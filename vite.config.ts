import { existsSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Resolve directory-style URLs under `public/` while running `vite dev`.
 *
 * GitHub Pages and `vite preview` both serve `/articles/` as
 * `/articles/index.html`. The dev server instead hits Vite's SPA fallback and
 * returns the app shell, so links to `/articles/` appear to do nothing. This
 * middleware rewrites the request to the directory's index.html so dev behaves
 * like production.
 */
function publicDirectoryIndex(): Plugin {
  return {
    name: 'public-directory-index',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname, search] = (req.url ?? '').split('?')

        if (pathname && pathname.length > 1 && pathname.endsWith('/')) {
          const indexFile = path.join(server.config.publicDir, pathname, 'index.html')
          if (existsSync(indexFile)) {
            req.url = `${pathname}index.html${search ? `?${search}` : ''}`
          }
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), publicDirectoryIndex()],
})
