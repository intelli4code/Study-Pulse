
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Inbox } from 'lucide-react';
import type { Feedback } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


export default function ManageFeedback() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const feedbackRef = collection(db, 'feedback');
    const q = query(feedbackRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching feedback:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback message?')) {
      setDeletingId(id);
      try {
        await deleteDoc(doc(db, 'feedback', id));
        toast({ title: 'Success', description: 'Feedback message deleted.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete message.' });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>User-submitted feedback and bug reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center text-muted-foreground p-10 flex flex-col items-center gap-4">
               <Inbox className="h-12 w-12" />
               <p>Your inbox is empty. No feedback submitted yet.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {feedback.map((item) => (
                <AccordionItem value={item.id} key={item.id}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-4 w-full">
                            <Avatar>
                                <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">{item.name} <span className="font-normal text-muted-foreground">&lt;{item.email}&gt;</span></p>
                                <p className="text-sm">{item.subject}</p>
                            </div>
                            <p className="text-xs text-muted-foreground pr-4">
                                {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex items-start justify-between gap-4 p-4 rounded-md border bg-muted/50">
                            <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{item.message}</p>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}>
                                {deletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
  );
}
