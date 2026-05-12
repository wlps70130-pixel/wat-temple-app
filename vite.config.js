import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Inject into process.env so the API handlers can see them
  process.env.TUYA_CLIENT_ID = env.TUYA_CLIENT_ID;
  process.env.TUYA_CLIENT_SECRET = env.TUYA_CLIENT_SECRET;
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.CCTV_TARGET_URL) process.env.CCTV_TARGET_URL = env.CCTV_TARGET_URL;
  else delete process.env.CCTV_TARGET_URL;
  if (env.CCTV_USERNAME) process.env.CCTV_USERNAME = env.CCTV_USERNAME;
  else delete process.env.CCTV_USERNAME;
  if (env.CCTV_PASSWORD) process.env.CCTV_PASSWORD = env.CCTV_PASSWORD;
  else delete process.env.CCTV_PASSWORD;
  if (env.NVR_EVENT_LOG_DIR) process.env.NVR_EVENT_LOG_DIR = env.NVR_EVENT_LOG_DIR;
  else delete process.env.NVR_EVENT_LOG_DIR;
  if (env.NVR_EVENT_SECRET) process.env.NVR_EVENT_SECRET = env.NVR_EVENT_SECRET;
  else delete process.env.NVR_EVENT_SECRET;
  if (env.NVR_EVENT_TIME_ZONE) process.env.NVR_EVENT_TIME_ZONE = env.NVR_EVENT_TIME_ZONE;
  else delete process.env.NVR_EVENT_TIME_ZONE;

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
                const functionName = url.pathname.replace(/^\/api\//, '');
                const modulePath = pathToFileURL(path.resolve(process.cwd(), 'api', `${functionName}.js`)).href;
                
                // Load the serverless function
                const { default: handler } = await import(modulePath);
                const body = await new Promise((resolve, reject) => {
                  if (req.method === 'GET' || req.method === 'HEAD') {
                    resolve(undefined);
                    return;
                  }

                  let raw = '';
                  req.on('data', chunk => {
                    raw += chunk.toString();
                  });
                  req.on('end', () => {
                    if (!raw) {
                      resolve(undefined);
                      return;
                    }

                    const contentType = req.headers['content-type'] || '';
                    if (!contentType.includes('application/json')) {
                      resolve(raw);
                      return;
                    }

                    try {
                      resolve(JSON.parse(raw));
                    } catch {
                      resolve(raw);
                    }
                  });
                  req.on('error', reject);
                });
                
                // Mock Vercel req/res
                const mockReq = {
                  query: Object.fromEntries(url.searchParams.entries()),
                  method: req.method,
                  body,
                  headers: req.headers,
                  ip: req.socket?.remoteAddress
                };
                
                const mockRes = {
                  get statusCode() {
                    return res.statusCode;
                  },
                  set statusCode(code) {
                    res.statusCode = code;
                  },
                  get headersSent() {
                    return res.headersSent;
                  },
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
                  write: (data) => {
                    res.write(data);
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
