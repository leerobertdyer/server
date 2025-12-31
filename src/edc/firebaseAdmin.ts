import admin from "firebase-admin";

// Initialize Firebase Admin SDK
// You can either use a service account JSON file or environment variables

let app;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse the service account from environment variable (JSON string)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fall back to individual environment variables
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "erindawncampbell",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
} catch (error) {
  console.error(
    `There was an error setting up firebase admin in the server: ${error}`
  );
}

const db = admin.firestore();

export { db };
