require('dotenv').config();
const admin = require('firebase-admin');

console.log("Raw from env:", process.env.FIREBASE_PRIVATE_KEY);
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();
}
console.log("Processed:", privateKey);

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
  console.log("✅ Firebase Initialized");
} catch (e) {
  console.log("Error:", e.message);
}
