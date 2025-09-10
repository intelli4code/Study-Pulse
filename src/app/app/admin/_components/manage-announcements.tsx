
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { Announcement } from '@/lib/types';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function ManageAnnouncements() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', content: '' },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (values: AnnouncementFormValues) => {
    try {
      const announcementsRef = collection(db, 'announcements');
      await addDoc(announcementsRef, {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'Announcement published.' });
      form.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to publish announcement.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setDeletingId(id);
      try {
        await deleteDoc(doc(db, 'announcements', id));
        toast({ title: 'Success', description: 'Announcement deleted.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete announcement.' });
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>Publish a new announcement for all users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New Feature Launch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write the announcement details here..." {...field} rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Published Announcements</CardTitle>
          <CardDescription>The list of currently active announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-muted-foreground text-center">No announcements published yet.</p>
          ) : (
            <ul className="space-y-4">
              {announcements.map((ann) => (
                <li key={ann.id} className="flex items-start justify-between gap-4 p-3 rounded-md border">
                  <div className="flex-1">
                    <p className="font-semibold">{ann.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{ann.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Published {ann.createdAt ? formatDistanceToNow(ann.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleDelete(ann.id)} disabled={deletingId === ann.id}>
                    {deletingId === ann.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
