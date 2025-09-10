'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const announcements = [
    {
      id: 1,
      title: 'Welcome to the New StudyPulse!',
      date: 'October 26, 2023',
      content: 'We are thrilled to launch the brand new version of StudyPulse, packed with new features to help you achieve your academic goals. Explore the new dashboard, set your goals, and start tracking your progress!',
    },
    {
      id: 2,
      title: 'AI Tutor is now available',
      date: 'October 25, 2023',
      content: 'Have a question? Need help with a difficult concept? Our new AI Tutor is here to help you 24/7. Find it in the sidebar!',
    },
     {
      id: 3,
      title: 'Community Leaderboard Launched!',
      date: 'October 24, 2023',
      content: 'Check out the new Community page to see how you stack up against other learners. Climb the ranks by logging your study time.',
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">Latest news and updates from the StudyPulse team.</p>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Megaphone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <CardTitle>{announcement.title}</CardTitle>
                        <CardDescription>{announcement.date}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
