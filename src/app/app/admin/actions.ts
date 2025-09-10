
'use server';

import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

const INITIAL_KEY = 'secret-admin-key-54321';

async function getAdminDocRef() {
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    return db.collection('admin').doc('TA4Yxz8MMELpHi5vhGcO');
}

// Function to get the admin key from the database.
async function getStoredAdminKey(): Promise<string | null> {
  const adminDocRef = await getAdminDocRef();
  const docSnap = await adminDocRef.get();
  
  if (docSnap.exists && docSnap.data()?.key) {
    return docSnap.data()!.key;
  }
  return null;
}

// Function to create and save a new admin key.
export async function createAndSaveAdminKey(): Promise<string> {
    const adminDocRef = await getAdminDocRef();
    const newKey = `sk-${randomBytes(16).toString('hex')}`;
    await adminDocRef.set({ key: newKey });
    return newKey;
}

// Function to verify the admin key.
export async function verifyAdminKey(key: string): Promise<boolean> {
  try {
    const storedKey = await getStoredAdminKey();
    
    if (storedKey) {
      // If a key exists in the DB, use it for verification.
      return key === storedKey;
    } else {
      // If no key is in the DB, fall back to the initial hardcoded key.
      return key === INITIAL_KEY;
    }
  } catch (error) {
    console.error("Error verifying admin key:", error);
    return false;
  }
}

// Function to regenerate the admin key (same as creating it).
export async function regenerateAdminKey(): Promise<string> {
    return createAndSaveAdminKey();
}

// Function to reset the key by deleting it from the database, forcing a fallback to the initial key.
export async function resetAdminKey(): Promise<void> {
    const adminDocRef = await getAdminDocRef();
    // Setting an empty object or deleting the doc will work.
    // Let's delete the doc to be clean.
    const docSnap = await adminDocRef.get();
    if (docSnap.exists) {
        await adminDocRef.delete();
    }
    // After deletion, the system will fall back to INITIAL_KEY
}
