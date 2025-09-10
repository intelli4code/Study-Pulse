import { type LucideIcon } from "lucide-react";
import { type Timestamp } from "firebase/firestore";

export interface StudyLog {
  id: string;
  userId: string;
  subject: string;
  duration: number;
  notes?: string;
  timestamp: Timestamp;
}

export interface Subject {
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon | string; // Allow for string for custom icon names
  color: string;
  isCustom?: boolean; // Flag for custom achievements
  criteria?: { // Criteria for custom achievements
    type: 'totalDuration' | 'totalLogs' | 'uniqueSubjects';
    value: number;
  };
}

export interface UserAchievement {
  id:string;
  achievedAt: Timestamp;
}

export interface Goal {
    id: string;
    userId: string;
    description: string;
    subject: string;
    targetMinutes: number;
    currentMinutes: number;
    completed: boolean;
    createdAt: Timestamp;
    completedAt?: Timestamp;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
}

export interface Feedback {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: Timestamp;
}
