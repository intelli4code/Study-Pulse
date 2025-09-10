
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { randomBytes } from 'crypto';

const settingsRef = doc(db, 'settings', 'admin');

// Function to get or create the admin key
export async function getAdminKey(): Promise<string> {
  const docSnap = await getDoc(settingsRef);
  if (docSnap.exists() && docSnap.data().key) {
    return docSnap.data().key;
  }
  // If no key, create an initial one
  return regenerateAdminKey('secret-admin-key-54321');
}

// Function to verify the admin key
export async function verifyAdminKey(key: string): Promise<boolean> {
  const adminKey = await getAdminKey();
  return key === adminKey;
}

// Function to regenerate the admin key
export async function regenerateAdminKey(initialKey?: string): Promise<string> {
  const newKey = initialKey || `sk-${randomBytes(16).toString('hex')}`;
  await setDoc(settingsRef, { key: newKey });
  return newKey;
}

