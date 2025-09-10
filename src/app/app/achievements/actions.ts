
'use server';

import { auth, db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { StudyLog, Achievement } from '@/lib/types';
import { achievementsList as standardAchievements } from '@/lib/achievements';
import { generateNewAchievements } from '@/ai/flows/generate-new-achievements';

async function getStudyLogs(userId: string): Promise<StudyLog[]> {
  const logsSnapshot = await getDocs(collection(db, 'users', userId, 'studyLogs'));
  return logsSnapshot.docs.map(doc => doc.data() as StudyLog);
}

async function getUserAchievements(userId: string): Promise<Set<string>> {
  const achievementsSnapshot = await getDocs(collection(db, 'users', userId, 'achievements'));
  return new Set(achievementsSnapshot.docs.map(doc => doc.id));
}

async function getCustomAchievements(userId: string): Promise<Achievement[]> {
    const customAchievementsSnapshot = await getDocs(collection(db, 'users', userId, 'customAchievements'));
    return customAchievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
}

async function awardAchievement(userId: string, achievementId: string) {
  const achievementRef = doc(db, 'users', userId, 'achievements', achievementId);
  await setDoc(achievementRef, {
    id: achievementId,
    achievedAt: serverTimestamp(),
  });
}

export async function checkAndAwardAchievements() {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  const userId = user.uid;
  const [studyLogs, userAchievements, customAchievements] = await Promise.all([
    getStudyLogs(userId),
    getUserAchievements(userId),
    getCustomAchievements(userId),
  ]);
  
  const allAchievements = [...standardAchievements, ...customAchievements];

  const totalDuration = studyLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalLogs = studyLogs.length;
  const uniqueSubjects = new Set(studyLogs.map(log => log.subject)).size;

  let allAchievementsEarned = true;
  for (const achievement of allAchievements) {
    if (userAchievements.has(achievement.id)) {
      continue; // Skip already earned achievements
    }
    allAchievementsEarned = false; // Found an unearned achievement

    let shouldAward = false;
    if (achievement.isCustom && achievement.criteria) {
        // Custom achievement logic
        const { type, value } = achievement.criteria;
        if (type === 'totalDuration' && totalDuration >= value) shouldAward = true;
        if (type === 'totalLogs' && totalLogs >= value) shouldAward = true;
        if (type === 'uniqueSubjects' && uniqueSubjects >= value) shouldAward = true;
    } else {
        // Standard achievement logic
        switch (achievement.id) {
          case 'first_session':
            if (totalLogs >= 1) shouldAward = true;
            break;
          case 'one_hour':
            if (totalDuration >= 60) shouldAward = true;
            break;
          case 'ten_hours':
            if (totalDuration >= 600) shouldAward = true;
            break;
          case 'fifty_hours':
            if (totalDuration >= 3000) shouldAward = true;
            break;
          case 'hundred_hours':
            if (totalDuration >= 6000) shouldAward = true;
            break;
          case 'five_subjects':
            if (uniqueSubjects >= 5) shouldAward = true;
            break;
        }
    }

    if (shouldAward) {
      await awardAchievement(userId, achievement.id);
      userAchievements.add(achievement.id); // Add to set to avoid re-awarding in same run
    }
  }

  // If all achievements are earned, generate new ones
  if (allAchievementsEarned) {
    const result = await generateNewAchievements({
        totalDuration,
        totalLogs,
        uniqueSubjects,
        existingAchievements: Array.from(userAchievements),
    });

    if (result.newAchievements && result.newAchievements.length > 0) {
        const batch = writeBatch(db);
        result.newAchievements.forEach(ach => {
            const docRef = doc(db, 'users', user.uid, 'customAchievements', ach.id);
            batch.set(docRef, { ...ach, isCustom: true });
        });
        await batch.commit();
    }
  }
}
