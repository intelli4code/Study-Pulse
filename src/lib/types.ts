
import { type LucideIcon } from "lucide-react";
import { type Timestamp } from "firebase/firestore";
import { z } from 'zod';

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

export const AchievementSchema = z.object({
  id: z.string().describe("A short, snake_case unique identifier for the achievement, e.g., 'physics_prodigy'."),
  title: z.string().describe("A catchy title for the achievement, e.g., 'Physics Prodigy'."),
  description: z.string().describe("A short, motivating description of what the user did to earn it."),
  icon: z.string().describe("The name of a relevant Lucide icon (e.g., 'Atom', 'Book', 'BrainCircuit')."),
  color: z.string().describe("A Tailwind CSS color class for the icon, e.g., 'text-blue-500'."),
  criteria: z.object({
      type: z.enum(['totalDuration', 'totalLogs', 'uniqueSubjects']).describe("The metric to track for this achievement."),
      value: z.number().describe("The target value for the metric (e.g., if type is 'totalDuration', value could be 12000 for 200 hours).")
  }).describe("The specific criteria to unlock this achievement.")
});

export const GenerateNewAchievementsInputSchema = z.object({
    totalDuration: z.number().describe("The user's total study duration in minutes."),
    totalLogs: z.number().describe("The total number of study sessions the user has logged."),
    uniqueSubjects: z.number().describe("The number of unique subjects the user has studied."),
    existingAchievements: z.array(z.string()).describe("A list of IDs of achievements the user has already earned."),
});

export const GenerateNewAchievementsOutputSchema = z.object({
    newAchievements: z.array(AchievementSchema).max(5).describe('A list of up to 5 new, creative, and challenging achievements for the user to unlock next.'),
});


export type Achievement = z.infer<typeof AchievementSchema> & {
    icon: LucideIcon | string; // Allow for string for custom icon names
    isCustom?: boolean; // Flag for custom achievements
}

export type GenerateNewAchievementsInput = z.infer<typeof GenerateNewAchievementsInputSchema>;
export type GenerateNewAchievementsOutput = z.infer<typeof GenerateNewAchievementsOutputSchema>;


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
