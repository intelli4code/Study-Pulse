'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Book, Youtube, ExternalLink } from 'lucide-react';
import NextLink from 'next/link';

const resourceCategories = [
  {
    title: 'Study Tools & Platforms',
    icon: Book,
    links: [
      { title: 'Khan Academy', url: 'https://www.khanacademy.org/', description: 'Free online courses, lessons, and practice.' },
      { title: 'Quizlet', url: 'https://quizlet.com/', description: 'Flashcards, study games, and tools.' },
      { title: 'Coursera', url: 'https://www.coursera.org/', description: 'Online courses from universities and companies.' },
    ],
  },
  {
    title: 'Recommended YouTube Channels',
    icon: Youtube,
    links: [
      { title: 'CrashCourse', url: 'https://www.youtube.com/user/crashcourse', description: 'Engaging educational videos on a variety of subjects.' },
      { title: '3Blue1Brown', url: 'https://www.youtube.com/c/3blue1brown', description: 'Driven by inquiry and visualization for math.' },
      { title: 'Kurzgesagt – In a Nutshell', url: 'https://www.youtube.com/c/inanutshell', description: 'Complex topics explained with beautiful animation.' },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Useful Resources</h1>
        <p className="text-muted-foreground">A curated list of tools and content to help you study.</p>
      </div>

      <div className="space-y-6">
        {resourceCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-primary" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {category.links.map((link) => (
                  <NextLink key={link.title} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 -mx-4 hover:bg-muted/50 rounded-lg transition-colors">
                      <ExternalLink className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                      <div className="flex-1">
                          <p className="font-semibold">{link.title}</p>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                      </div>
                  </NextLink>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
