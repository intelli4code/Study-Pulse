'use server';

import { auth, db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import type { StudyLog } from '@/lib/types';
import { achievementsList } from '@/lib/achievements';

async function getStudyLogs(userId: string): Promise<StudyLog[]> {
  const logsSnapshot = await getDocs(collection(db, 'users', userId, 'studyLogs'));
  return logsSnapshot.docs.map(doc => doc.data() as StudyLog);
}

async function getUserAchievements(userId: string): Promise<Set<string>> {
  const achievementsSnapshot = await getDocs(collection(db, 'users', userId, 'achievements'));
  return new Set(achievementsSnapshot.docs.map(doc => doc.id));
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
  const [studyLogs, userAchievements] = await Promise.all([
    getStudyLogs(userId),
    getUserAchievements(userId),
  ]);

  const totalDuration = studyLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalLogs = studyLogs.length;
  const uniqueSubjects = new Set(studyLogs.map(log => log.subject)).size;

  for (const achievement of achievementsList) {
    if (userAchievements.has(achievement.id)) {
      continue; // Skip already earned achievements
    }

    let shouldAward = false;
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

    if (shouldAward) {
      await awardAchievement(userId, achievement.id);
    }
  }
}
