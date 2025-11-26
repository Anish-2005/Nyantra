// Node script to hard-delete a Firestore document using the Admin SDK.
// Usage (PowerShell):
// 1) Download a service account JSON from Firebase Console and save it as ./serviceAccountKey.json OR set env var SERVICE_ACCOUNT_PATH to its path.
// 2) Run: node scripts/delete-application.js APP1764163031866
// The script deletes document at path `applications/<ID>`.

const admin = require('firebase-admin');
const path = require('path');

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/delete-application.js <APPLICATION_ID>');
    process.exit(1);
  }

  const svcPath = process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json');

  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(svcPath))
    });
  } catch (err) {
    console.error('Failed to initialize Firebase Admin. Make sure service account JSON exists at:', svcPath);
    console.error(err.message || err);
    process.exit(1);
  }

  const db = admin.firestore();
  const docRef = db.doc(`applications/${id}`);

  try {
    await docRef.delete();
    console.log(`Successfully deleted applications/${id}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to delete document:', err.message || err);
    process.exit(2);
  }
}

main();
