'use server';

/**
 * @fileOverview An AI-powered study tutor.
 *
 * - tutorChat - A function that handles the chat with the AI tutor.
 * - TutorChatInput - The input type for the tutorChat function.
 * - TutorChatOutput - The return type for the tutorChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {MessageData} from 'genkit/experimental/ai';

const TutorChatInputSchema = z.object({
  history: z.array(z.custom<MessageData>()).describe('The conversation history.'),
  message: z.string().describe("The user's message to the tutor."),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

const TutorChatOutputSchema = z.object({
  response: z.string().describe("The tutor's response."),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;

export async function tutorChat(input: TutorChatInput): Promise<TutorChatOutput> {
  return tutorChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tutorChatPrompt',
  input: {schema: TutorChatInputSchema},
  output: {schema: TutorChatOutputSchema},
  prompt: `You are an AI study tutor. Your role is to help students understand concepts, answer their questions, and provide explanations on a wide range of subjects. Be encouraging, clear, and concise in your explanations.

  Here is the conversation history:
  {{#each history}}
    {{#if (eq role 'user')}}
      User: {{{content.[0].text}}}
    {{else if (eq role 'model')}}
      Tutor: {{{content.[0].text}}}
    {{/if}}
  {{/each}}

  User's latest message:
  {{{message}}}

  Tutor's response:`,
});

const tutorChatFlow = ai.defineFlow(
  {
    name: 'tutorChatFlow',
    inputSchema: TutorChatInputSchema,
    outputSchema: TutorChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
