import admin from "firebase-admin";

try {
  // Preferred: path to JSON file on server (e.g. Render secret file). Not in repo, not in .env.
  const keyPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    admin.initializeApp({
      credential: admin.credential.cert(keyPath),
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    throw new Error(
      "Missing Firebase credentials: set FIREBASE_SERVICE_ACCOUNT_PATH (or GOOGLE_APPLICATION_CREDENTIALS) to a JSON file path, or FIREBASE_SERVICE_ACCOUNT to the JSON string"
    );
  }
} catch (error) {
  console.error(
    `There was an error setting up firebase admin in the server: ${error}`
  );
  throw error;
}

const db = admin.firestore();

export { admin, db };
