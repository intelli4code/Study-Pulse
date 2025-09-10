'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getLeaderboard } from './actions';
import type { LeaderboardUser } from './actions';
import { Crown, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };
  
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 0: return "text-yellow-500";
      case 1: return "text-gray-400";
      case 2: return "text-yellow-700";
      default: return "text-muted-foreground";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Community Leaderboard</h1>
        <p className="text-muted-foreground">See who's putting in the most study time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Learners</CardTitle>
          <CardDescription>Ranked by total minutes studied.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y">
              {leaderboard.map((user, index) => (
                <li key={user.uid} className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-6 font-bold text-lg">
                    {index < 3 ? <Crown className={cn("h-6 w-6", getMedalColor(index))} /> : <span>{index + 1}</span>}
                  </div>
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{user.displayName || 'Anonymous User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-primary">{user.totalMinutes}</p>
                    <p className="text-sm text-muted-foreground">minutes</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && leaderboard.length === 0 && (
             <div className="text-center text-muted-foreground py-10">
                <p>No user data available yet. Start logging time to appear on the leaderboard!</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
