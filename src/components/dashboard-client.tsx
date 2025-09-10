'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { type StudyLog } from '@/lib/types';
import { SUBJECTS } from '@/lib/constants';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { ChartTooltipContent } from '@/components/ui/chart';

const logSchema = z.object({
  subject: z.string({ required_error: "Please select a subject." }),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  notes: z.string().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

export default function DashboardClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
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

  const handleDialogOpen = (log: StudyLog | null = null) => {
    setEditingLog(log);
    if (log) {
      form.reset({
        subject: log.subject,
        duration: log.duration,
        notes: log.notes,
      });
    } else {
      form.reset({
        subject: '',
        duration: 60,
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };
  
  const onSubmit = async (values: LogFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingLog) {
        // Update existing log
        const logDocRef = doc(db, 'users', user.uid, 'studyLogs', editingLog.id);
        await updateDoc(logDocRef, values);
        toast({ title: "Success", description: "Study session updated." });
      } else {
        // Add new log
        const logsCollectionRef = collection(db, 'users', user.uid, 'studyLogs');
        await addDoc(logsCollectionRef, {
          ...values,
          userId: user.uid,
          timestamp: serverTimestamp(),
        });
        toast({ title: "Success", description: "Study session logged." });
      }
      form.reset();
      setIsDialogOpen(false);
      setEditingLog(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save session." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLog = async (logId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this study session?")) {
        const logDocRef = doc(db, 'users', user.uid, 'studyLogs', logId);
        await deleteDoc(logDocRef);
        toast({ title: "Success", description: "Study session deleted." });
    }
  };
  
  const subjectSummary = useMemo(() => {
    const summary = new Map<string, number>();
    studyLogs.forEach(log => {
      summary.set(log.subject, (summary.get(log.subject) || 0) + log.duration);
    });
    return Array.from(summary, ([name, totalMinutes]) => ({ name, totalMinutes }));
  }, [studyLogs]);
  
  const weeklySummary = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    const data = last7Days.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const totalDuration = studyLogs
        .filter(log => format(log.timestamp.toDate(), 'yyyy-MM-dd') === dateString)
        .reduce((acc, log) => acc + log.duration, 0);
      return {
        date: format(date, 'MMM d'),
        totalMinutes: totalDuration
      };
    });
    return data;
  }, [studyLogs]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
       <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Total minutes studied in the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
             {studyLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklySummary} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="totalMinutes" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground">No study data for the last week.</p>
                </div>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subject Breakdown</CardTitle>
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
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your most recent study logs.</CardDescription>
          </div>
          <Button onClick={() => handleDialogOpen()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Log Session
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDialogOpen(log)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteLog(log.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No sessions logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingLog ? 'Edit Study Session' : 'Log a New Study Session'}</DialogTitle>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                    {editingLog ? 'Save Changes' : 'Log Session'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
