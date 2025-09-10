
'use server';

import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

const INITIAL_KEY = 'secret-admin-key-54321';

async function getSettingsRef() {
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    return db.collection('settings').doc('admin');
}

// Function to get or create the admin key
export async function getAdminKey(): Promise<string> {
  const settingsRef = await getSettingsRef();
  const docSnap = await settingsRef.get();
  const docData = docSnap.data();

  if (docSnap.exists && docData && docData.key) {
    return docData.key;
  }
  // If no key exists, create a new secure random one.
  const newKey = `sk-${randomBytes(16).toString('hex')}`;
  await settingsRef.set({ key: newKey });
  return newKey;
}

// Function to verify the admin key
export async function verifyAdminKey(key: string): Promise<boolean> {
  try {
    // For the very first login, allow the initial hardcoded key.
    // After this, the user is expected to regenerate it.
    const settingsRef = await getSettingsRef();
    const docSnap = await settingsRef.get();
    if (!docSnap.exists && key === INITIAL_KEY) {
        // If no key is in the DB and the user provides the initial key,
        // set it in the DB and allow login.
        await settingsRef.set({ key: INITIAL_KEY });
        return true;
    }
    
    const adminKey = await getAdminKey();
    return key === adminKey;
  } catch (error) {
    console.error("Error verifying admin key:", error);
    return false;
  }
}

// Function to regenerate the admin key
export async function regenerateAdminKey(): Promise<string> {
    const settingsRef = await getSettingsRef();
    const newKey = `sk-${randomBytes(16).toString('hex')}`;
    await settingsRef.set({ key: newKey });
    return newKey;
}
