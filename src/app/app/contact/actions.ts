'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface FeedbackData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function submitFeedback(data: FeedbackData) {
    try {
        const feedbackCollectionRef = collection(db, 'feedback');
        await addDoc(feedbackCollectionRef, {
            ...data,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw new Error("Could not submit feedback.");
    }
}
