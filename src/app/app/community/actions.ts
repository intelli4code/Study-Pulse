'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { StudyLog } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

export interface LeaderboardUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    totalMinutes: number;
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
    try {
        const app = getFirebaseAdminApp();
        const auth = getAuth(app);

        // 1. Fetch all users
        const listUsersResult = await auth.listUsers();
        const allUsers = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            displayName: userRecord.displayName || null,
            email: userRecord.email || null,
            photoURL: userRecord.photoURL || null
        }));

        // 2. Fetch all study logs
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);

        const userMinutesMap = new Map<string, number>();

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            let totalMinutes = 0;
            const studyLogsRef = collection(db, 'users', userId, 'studyLogs');
            const logsSnapshot = await getDocs(studyLogsRef);
            logsSnapshot.forEach(logDoc => {
                const log = logDoc.data() as StudyLog;
                totalMinutes += log.duration;
            });
            userMinutesMap.set(userId, totalMinutes);
        }
        
        // 3. Combine user data with study time
        const leaderboard: LeaderboardUser[] = allUsers.map(user => ({
            ...user,
            totalMinutes: userMinutesMap.get(user.uid) || 0
        }));

        // 4. Sort by total minutes
        leaderboard.sort((a, b) => b.totalMinutes - a.totalMinutes);

        return leaderboard.slice(0, 50); // Return top 50 users

    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        throw new Error("Could not retrieve leaderboard.");
    }
}
