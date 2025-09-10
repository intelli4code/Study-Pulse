
'use server';

import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

const INITIAL_KEY = 'secret-admin-key-54321';

async function getSettingsRef() {
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    // Point to the correct collection and document ID provided by the user.
    return db.collection('admin').doc('TA4Yxz8MMELpHi5vhGcO');
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
    const adminKey = await getAdminKey();
    
    // For the very first login, if the key in the DB is the initial key, allow it.
    if (adminKey === INITIAL_KEY && key === INITIAL_KEY) {
        return true;
    }
    
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
