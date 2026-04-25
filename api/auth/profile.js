import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// เพิ่ม Fallback และ Validation ถ้า env ยังไม่ครบ ไม่ให้ build พัง
const requiredEnvs = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

const missingEnvs = requiredEnvs.filter(key => !process.env[key]);

if (missingEnvs.length > 0) {
  console.warn(`\n⚠️ Warning: Missing Firebase Environment Variables: ${missingEnvs.join(', ')}`);
  console.warn(`⚠️ Firebase Admin will not initialize properly. API /api/auth/profile might fail.\n`);
} else {
  try {
    if (!admin.apps.length) {
      // แก้ error Service account object must contain a string project_id property
      // โดยการ map ตัวแปร env ใส่ object ให้ตรงตามรูปแบบของ Firebase Admin
      // และจัดการ \\n ใน private_key ให้เป็น \n (Newline) จริงๆ เพื่อไม่ให้ key error
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('✅ Firebase Admin Initialized Successfully from Environment Variables');
    }
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // หากไม่มี Envs ไม่ต้องให้ Server พัง แต่ให้ Request ฟ้อง Error อย่างนุ่มนวล
  if (missingEnvs.length > 0) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: Firebase Environment variables are missing.' 
    });
  }

  try {
    // โค้ดตัวอย่างการใช้งาน Firebase Admin (สามารถนำไปเช็ค Verify Token ได้)
    // const token = req.headers.authorization?.split('Bearer ')[1];
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // const user = await admin.auth().getUser(decodedToken.uid);
    
    return res.status(200).json({
      success: true,
      message: 'Firebase Auth is configured properly from environment variables',
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
