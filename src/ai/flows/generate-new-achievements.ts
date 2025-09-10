
'use server';
/**
 * @fileOverview AI-powered achievement generator.
 */

import { ai } from '@/ai/genkit';
import { 
    GenerateNewAchievementsInputSchema, 
    GenerateNewAchievementsOutputSchema,
    type GenerateNewAchievementsInput,
    type GenerateNewAchievementsOutput
} from '@/lib/types';


export async function generateNewAchievements(input: GenerateNewAchievementsInput): Promise<GenerateNewAchievementsOutput> {
  return generateNewAchievementsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateNewAchievementsPrompt',
    input: { schema: GenerateNewAchievementsInputSchema },
    output: { schema: GenerateNewAchievementsOutputSchema },
    prompt: `You are an AI that designs motivating achievements for a study application. Based on the user's study history, create a set of new, personalized, and challenging achievements.

    User's Current Stats:
    - Total study time: {{totalDuration}} minutes
    - Total study sessions: {{totalLogs}}
    - Unique subjects studied: {{uniqueSubjects}}

    Achievements already earned:
    {{#each existingAchievements}}
    - {{this}}
    {{/each}}

    Generate up to 5 new achievements that are the next logical step up in difficulty. Be creative with titles and descriptions. Ensure the 'id' is a unique snake_case string and the icon is a valid Lucide icon name. The criteria value should be significantly higher than the user's current stats for that metric.
    `,
});

const generateNewAchievementsFlow = ai.defineFlow(
    {
        name: 'generateNewAchievementsFlow',
        inputSchema: GenerateNewAchievementsInputSchema,
        outputSchema: GenerateNewAchievementsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
