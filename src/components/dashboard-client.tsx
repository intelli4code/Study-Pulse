'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { type StudyLog } from '@/lib/types';
import { SUBJECTS } from '@/lib/constants';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from 'lucide-react';
import { ChartTooltipContent } from '@/components/ui/chart';

const logSchema = z.object({
  subject: z.string({ required_error: "Please select a subject." }),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  notes: z.string().optional(),
});

export default function DashboardClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      duration: 60,
      notes: ""
    }
  });

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const logsCollectionRef = collection(db, 'users', user.uid, 'studyLogs');
    const q = query(logsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs: StudyLog[] = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as StudyLog);
      });
      setStudyLogs(logs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching study logs: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch study logs."
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const onSubmit = async (values: z.infer<typeof logSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const logsCollectionRef = collection(db, 'users', user.uid, 'studyLogs');
      await addDoc(logsCollectionRef, {
        ...values,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      toast({ title: "Success", description: "Study session logged." });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to log session." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectSummary = useMemo(() => {
    const summary = new Map<string, number>();
    studyLogs.forEach(log => {
      summary.set(log.subject, (summary.get(log.subject) || 0) + log.duration);
    });
    return Array.from(summary, ([name, totalMinutes]) => ({ name, totalMinutes }));
  }, [studyLogs]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Study Summary</CardTitle>
            <CardDescription>Total minutes studied per subject.</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectSummary.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectSummary} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                  <Bar dataKey="totalMinutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center text-center">
                 <p className="text-muted-foreground">No study data yet.</p>
                 <p className="text-sm text-muted-foreground">Log a session to see your progress.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors duration-300">
                <CardHeader>
                  <CardTitle>Log New Session</CardTitle>
                  <CardDescription>Click here to add a new study entry.</CardDescription>
                </CardHeader>
                <CardContent>
                  <PlusCircle className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log a New Study Session</DialogTitle>
              <DialogDescription>Fill in the details of your study session.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject.name} value={subject.name}>
                              <div className="flex items-center gap-2">
                                <subject.icon className={`h-4 w-4 ${subject.color}`} />
                                {subject.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What did you study? Any key takeaways?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log Session
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your most recent study logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studyLogs.length > 0 ? (
                studyLogs.slice(0, 5).map(log => {
                  const SubjectIcon = SUBJECTS.find(s => s.name === log.subject)?.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {SubjectIcon && <SubjectIcon className="h-4 w-4 text-muted-foreground" />}
                          {log.subject}
                        </div>
                      </TableCell>
                      <TableCell>{log.duration} min</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                            <span>{format(new Timestamp(log.timestamp.seconds, log.timestamp.nanoseconds).toDate(), 'PP')}</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Timestamp(log.timestamp.seconds, log.timestamp.nanoseconds).toDate(), { addSuffix: true })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell truncate max-w-xs">{log.notes || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No sessions logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
