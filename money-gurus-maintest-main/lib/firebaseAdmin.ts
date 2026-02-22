import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminDb: ReturnType<typeof getFirestore>;

try {
  const adminKeyRaw = process.env.FIREBASE_ADMIN_KEY;

  if (!adminKeyRaw) {
    throw new Error("FIREBASE_ADMIN_KEY is not set in environment variables");
  }

  const serviceAccount = JSON.parse(adminKeyRaw);

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  adminDb = getFirestore();
} catch (err) {
  console.error("Firebase Admin init error:", err);
  // Throw so API routes catch it and return proper error responses
  throw err;
}

export { adminDb };
