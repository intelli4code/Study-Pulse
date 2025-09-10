
import { type Subject } from '@/lib/types';
import { Atom, Calculator, Code, FlaskConical, Globe, History, Languages, Music, Palette, ScrollText, Sigma, BookOpen, Puzzle } from 'lucide-react';

export const SUBJECTS: Subject[] = [
  { name: 'Mathematics', icon: Sigma, color: 'text-blue-500' },
  { name: 'Physics', icon: Atom, color: 'text-indigo-500' },
  { name: 'Chemistry', icon: FlaskConical, color: 'text-purple-500' },
  { name: 'Biology', icon: Globe, color: 'text-green-500' },
  { name: 'History', icon: History, color: 'text-yellow-600' },
  { name: 'Literature', icon: ScrollText, color: 'text-orange-500' },
  { name: 'Programming', icon: Code, color: 'text-teal-500' },
  { name: 'Art', icon: Palette, color: 'text-rose-500' },
  { name: 'Music', icon: Music, color: 'text-pink-500' },
  { name: 'Languages', icon: Languages, color: 'text-cyan-500' },
  { name: 'English', icon: BookOpen, color: 'text-red-500' },
  { name: 'Logical Reasoning', icon: Puzzle, color: 'text-gray-500' },
];

export const ADMIN_EMAIL = 'admin@studypulse.com';
