import { type LucideIcon } from "lucide-react";
import { type Timestamp } from "firebase/firestore";

export interface StudyLog {
  id: string;
  userId: string;
  subject: string;
  duration: number;
  notes: string;
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
  icon: LucideIcon;
  color: string;
}

export interface UserAchievement {
  id: string;
  achievedAt: Timestamp;
}
