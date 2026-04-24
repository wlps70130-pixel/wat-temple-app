import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Inject into process.env so the API handlers can see them
  process.env.TUYA_CLIENT_ID = env.TUYA_CLIENT_ID;
  process.env.TUYA_CLIENT_SECRET = env.TUYA_CLIENT_SECRET;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/cctv-proxy': {
          target: 'https://192.168.1.252:443',
          changeOrigin: true,
          secure: false, 
          ws: true,
          rewrite: (path) => path.replace(/^\/cctv-proxy/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          }
        },
        // Local API Dev Server for Vercel Functions
        '/api': {
          target: 'http://localhost:5173',
          bypass: async (req, res) => {
            if (req.url.startsWith('/api/')) {
              try {
                const url = new URL(req.url, 'http://localhost:5173');
                const functionName = url.pathname.replace('/api/', '').split('?')[0];
                const modulePath = `./api/${functionName}.js`;
                
                // Load the serverless function
                const { default: handler } = await import(modulePath);
                
                // Mock Vercel req/res
                const mockReq = {
                  query: Object.fromEntries(url.searchParams.entries()),
                  method: req.method,
                  body: req.body
                };
                
                const mockRes = {
                  status: (code) => {
                    res.statusCode = code;
                    return mockRes;
                  },
                  json: (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return mockRes;
                  },
                  setHeader: (name, value) => {
                    res.setHeader(name, value);
                    return mockRes;
                  },
                  end: (data) => {
                    res.end(data);
                    return mockRes;
                  }
                };
                
                await handler(mockReq, mockRes);
                return true; // Request handled
              } catch (e) {
                console.error('API Dev Proxy Error:', e);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
                return true;
              }
            }
          }
        }
      },
    },
  };
})
