import type { Achievement } from '@/lib/types';
import { Award, Star, Zap, Target, BookOpen, Clock } from 'lucide-react';

export const achievementsList: Omit<Achievement, 'icon'> & { icon: any }[] = [
  {
    id: 'first_session',
    title: 'First Step',
    description: 'Log your very first study session.',
    icon: Star,
    color: 'text-yellow-500',
  },
  {
    id: 'one_hour',
    title: 'Hour Hero',
    description: 'Study for a total of 1 hour.',
    icon: Clock,
    color: 'text-blue-500',
  },
  {
    id: 'ten_hours',
    title: 'Study Champion',
    description: 'Accumulate 10 total hours of study time.',
    icon: Award,
    color: 'text-indigo-500',
  },
  {
    id: 'fifty_hours',
    title: 'Dedicated Learner',
    description: 'Reach 50 hours of total study time.',
    icon: Target,
    color: 'text-purple-500',
  },
  {
    id: 'hundred_hours',
    title: 'Knowledge Master',
    description: 'Achieve 100 hours of focused study.',
    icon: BookOpen,
    color: 'text-rose-500',
  },
   {
    id: 'five_subjects',
    title: 'Polymath',
    description: 'Study 5 different subjects.',
    icon: Zap,
    color: 'text-green-500',
  },
];
