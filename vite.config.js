import { defineConfig } from 'vite';
import { apiApp } from './server/api.js';

export default defineConfig({
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    {
      name: 'calmpop-api-server',
      configureServer(server) {
        // Mount the real Express authentication API onto Vite's dev server Connect pipeline
        server.middlewares.use(apiApp);
        console.log('[CalmPop Vite Plugin] Real Employee Authentication API mounted on /api/*');
      }
    }
  ]
});
