'use server';

/**
 * @fileOverview AI-powered study plan generator.
 *
 * - generatePersonalizedStudyPlan - A function that generates a personalized study plan.
 * - GeneratePersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - GeneratePersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  studyGoals: z.string().describe('Your study goals, e.g., pass the exam, learn the basics.'),
  availableTime: z.string().describe('The time you have available for studying, e.g., 2 hours per day, 10 hours per week.'),
  subjects: z.string().describe('The subjects you want to study, e.g., Math, Physics, History.'),
});
export type GeneratePersonalizedStudyPlanInput = z.infer<
  typeof GeneratePersonalizedStudyPlanInputSchema
>;

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('A personalized study plan based on the input.'),
});
export type GeneratePersonalizedStudyPlanOutput = z.infer<
  typeof GeneratePersonalizedStudyPlanOutputSchema
>;

export async function generatePersonalizedStudyPlan(
  input: GeneratePersonalizedStudyPlanInput
): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: {schema: GeneratePersonalizedStudyPlanInputSchema},
  output: {schema: GeneratePersonalizedStudyPlanOutputSchema},
  prompt: `You are an AI study assistant that generates personalized study plans for students.

  Based on the student's goals, available time, and subjects, create a study plan that is tailored to their needs.

  Study Goals: {{{studyGoals}}}
  Available Time: {{{availableTime}}}
  Subjects: {{{subjects}}}

  Study Plan:`,
});

const generatePersonalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedStudyPlanFlow',
    inputSchema: GeneratePersonalizedStudyPlanInputSchema,
    outputSchema: GeneratePersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
