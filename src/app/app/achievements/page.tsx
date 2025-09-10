'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import type { StudyLog, UserAchievement } from '@/lib/types';
import { achievementsList } from '@/lib/achievements';
import { checkAndAwardAchievements } from './actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const achievementsRef = collection(db, 'users', user.uid, 'achievements');
    const logsRef = collection(db, 'users', user.uid, 'studyLogs');

    const unsubAchievements = onSnapshot(achievementsRef, (snapshot) => {
      const uas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAchievement));
      setUserAchievements(uas);
    });

    const unsubLogs = onSnapshot(query(logsRef), (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyLog));
        setStudyLogs(logs);
        checkAndAwardAchievements(); // Check for new achievements when logs change
    });
    
    setLoading(false);

    return () => {
      unsubAchievements();
      unsubLogs();
    };
  }, [user]);

  const earnedAchievements = useMemo(() => {
    return new Set(userAchievements.map(ua => ua.id));
  }, [userAchievements]);
  
  if (loading) {
    return <AchievementsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Achievements</h1>
        <p className="text-muted-foreground">Celebrate your study milestones with these badges.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievementsList.map((achievement) => {
          const isEarned = earnedAchievements.has(achievement.id);
          const userAchievement = userAchievements.find(ua => ua.id === achievement.id);

          return (
            <TooltipProvider key={achievement.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className={cn("flex flex-col items-center justify-center p-6 text-center transition-all", isEarned ? 'border-primary/50 bg-primary/5' : 'bg-muted/50')}>
                    <div className={cn("mb-4 rounded-full p-4", isEarned ? 'bg-primary/10' : 'bg-muted')}>
                      {isEarned ? (
                        <achievement.icon className={cn("h-10 w-10", achievement.color)} />
                      ) : (
                        <Lock className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <CardDescription className="mt-1">{achievement.description}</CardDescription>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  {isEarned && userAchievement?.achievedAt ? (
                    <p>Earned on: {format(userAchievement.achievedAt.toDate(), 'PP')}</p>
                  ) : (
                    <p>Locked</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}

function AchievementsSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="flex flex-col items-center justify-center p-6">
                        <Skeleton className="mb-4 h-20 w-20 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="mt-2 h-4 w-48" />
                    </Card>
                ))}
            </div>
        </div>
    );
}
