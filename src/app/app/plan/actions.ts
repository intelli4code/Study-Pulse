'use server';

import {
  generatePersonalizedStudyPlan,
  type GeneratePersonalizedStudyPlanInput,
  type GeneratePersonalizedStudyPlanOutput,
} from '@/ai/flows/generate-personalized-study-plan';

export async function generateStudyPlan(
  input: GeneratePersonalizedStudyPlanInput
): Promise<GeneratePersonalizedStudyPlanOutput> {
  try {
    const output = await generatePersonalizedStudyPlan(input);
    return output;
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw new Error('Failed to generate study plan.');
  }
}
