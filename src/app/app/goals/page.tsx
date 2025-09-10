'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';

import type { Goal } from '@/lib/types';
import { SUBJECTS } from '@/lib/constants';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, Target, CheckCircle, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const goalSchema = z.object({
  description: z.string().min(1, "Description is required."),
  subject: z.string({ required_error: "Please select a subject." }),
  targetMinutes: z.coerce.number().min(1, "Target must be at least 1 minute."),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
  });
  
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const goalsCollectionRef = collection(db, 'users', user.uid, 'goals');
    const q = query(goalsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedGoals: Goal[] = [];
      querySnapshot.forEach((doc) => {
        fetchedGoals.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(fetchedGoals);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching goals: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch goals."
      });
    });

    return () => unsubscribe();
  }, [user, toast]);
  
  useEffect(() => {
    if(!user) return;
    const updateGoals = async () => {
        const batch = writeBatch(db);
        const goalsRef = collection(db, 'users', user.uid, 'goals');
        const q = query(goalsRef, where("completed", "==", false));
        const goalsSnapshot = await getDocs(q);

        for (const goalDoc of goalsSnapshot.docs) {
            const goal = goalDoc.data() as Goal;
            const logsRef = collection(db, 'users', user.uid, 'studyLogs');
            const logsQuery = query(logsRef, where("subject", "==", goal.subject), where("timestamp", ">=", goal.createdAt));
            const logsSnapshot = await getDocs(logsQuery);
            
            const totalMinutes = logsSnapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0);
            
            if (totalMinutes !== goal.currentMinutes) {
                const newCurrentMinutes = Math.min(totalMinutes, goal.targetMinutes);
                const isCompleted = newCurrentMinutes >= goal.targetMinutes;
                
                batch.update(goalDoc.ref, { 
                    currentMinutes: newCurrentMinutes,
                    completed: isCompleted,
                    ...(isCompleted && { completedAt: serverTimestamp() })
                });
            }
        }
        await batch.commit();
    };

    updateGoals();
  }, [user, goals]);


  const handleDialogOpen = (goal: Goal | null = null) => {
    setEditingGoal(goal);
    if (goal) {
      form.reset({
        description: goal.description,
        subject: goal.subject,
        targetMinutes: goal.targetMinutes,
      });
    } else {
      form.reset({ description: '', subject: '', targetMinutes: 60 });
    }
    setIsDialogOpen(true);
  };
  
  const onSubmit = async (values: GoalFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingGoal) {
        const goalDocRef = doc(db, 'users', user.uid, 'goals', editingGoal.id);
        await updateDoc(goalDocRef, values);
        toast({ title: "Success", description: "Goal updated." });
      } else {
        const goalsCollectionRef = collection(db, 'users', user.uid, 'goals');
        await addDoc(goalsCollectionRef, {
          ...values,
          currentMinutes: 0,
          completed: false,
          createdAt: serverTimestamp(),
          userId: user.uid,
        });
        toast({ title: "Success", description: "Goal added." });
      }
      form.reset();
      setIsDialogOpen(false);
      setEditingGoal(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save goal." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this goal?")) {
        const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
        await deleteDoc(goalDocRef);
        toast({ title: "Success", description: "Goal deleted." });
    }
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Goals</h1>
          <p className="text-muted-foreground">Set and track your study objectives.</p>
        </div>
        <Button onClick={() => handleDialogOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Flame className="text-primary" /> Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : activeGoals.length === 0 ? (
                    <p className="text-muted-foreground text-center">No active goals. Set one to get started!</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {activeGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onEdit={handleDialogOpen} onDelete={deleteGoal} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Completed Goals</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : completedGoals.length === 0 ? (
                    <p className="text-muted-foreground text-center">No completed goals yet.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {completedGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onEdit={handleDialogOpen} onDelete={deleteGoal} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add a New Goal'}</DialogTitle>
              <DialogDescription>Define your study objective and target.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Master calculus differentiation" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="targetMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 600 for 10 hours" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingGoal ? 'Save Changes' : 'Add Goal'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    </div>
  )
}

function GoalCard({ goal, onEdit, onDelete }: { goal: Goal; onEdit: (goal: Goal) => void; onDelete: (id: string) => void }) {
    const progress = (goal.currentMinutes / goal.targetMinutes) * 100;
    const SubjectIcon = SUBJECTS.find(s => s.name === goal.subject)?.icon || Target;
    
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
                <div>
                   <p className="text-sm font-medium flex items-center gap-2"><SubjectIcon className="h-4 w-4 text-muted-foreground" />{goal.subject}</p>
                   <CardTitle className="text-lg">{goal.description}</CardTitle>
                </div>
                 <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)} disabled={goal.completed}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(goal.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                {goal.completed ? (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <div>
                            Completed on {goal.completedAt ? format(goal.completedAt.toDate(), 'PP') : ''}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-baseline text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{goal.currentMinutes} / {goal.targetMinutes} min</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}