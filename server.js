import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Default to 10000 which Render uses, or the port Render assigns
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Load API routes
// The Vercel functions take (req, res), which is identical to Express signature
import tuyaHandler from './api/tuya.js';
import shellyHandler from './api/shelly.js';
import thaillmHandler from './api/thaillm.js';
import authProfileHandler from './api/auth/profile.js';

app.all('/api/tuya', tuyaHandler);
app.all('/api/shelly', shellyHandler);
app.all('/api/thaillm', thaillmHandler);
app.all('/api/auth/profile', authProfileHandler);

// Serve static frontend in production (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all other routes to React Router (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Production Express Server running on port ${PORT}`);
});
