'use server';

import {
  tutorChat,
  type TutorChatInput,
  type TutorChatOutput,
} from '@/ai/flows/tutor-chat-flow';

export async function getTutorResponse(
  input: TutorChatInput
): Promise<TutorChatOutput> {
  try {
    const output = await tutorChat(input);
    return output;
  } catch (error) {
    console.error('Error getting tutor response:', error);
    throw new Error('Failed to get response from AI tutor.');
  }
}
