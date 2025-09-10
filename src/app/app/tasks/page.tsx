'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, CheckCircle2, Circle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Timestamp;
  completed: boolean;
  createdAt: Timestamp;
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });
  
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch tasks."
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleDialogOpen = (task: Task | null = null) => {
    setEditingTask(task);
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toDate(),
      });
    } else {
      form.reset({ title: '', description: '', dueDate: undefined });
    }
    setIsDialogOpen(true);
  };
  
  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingTask) {
        // Update existing task
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', editingTask.id);
        await updateDoc(taskDocRef, { 
            ...values,
            dueDate: values.dueDate ? Timestamp.fromDate(values.dueDate) : null,
        });
        toast({ title: "Success", description: "Task updated." });
      } else {
        // Add new task
        const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
        await addDoc(tasksCollectionRef, {
          ...values,
          dueDate: values.dueDate ? Timestamp.fromDate(values.dueDate) : null,
          completed: false,
          createdAt: serverTimestamp(),
          userId: user.uid,
        });
        toast({ title: "Success", description: "Task added." });
      }
      form.reset();
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save task." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', task.id);
    await updateDoc(taskDocRef, { completed: !task.completed });
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
        await deleteDoc(taskDocRef);
        toast({ title: "Success", description: "Task deleted." });
    }
  };


  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your study-related tasks.</p>
        </div>
        <Button onClick={() => handleDialogOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            <ul className="divide-y">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center p-4 gap-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleComplete(task)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1 grid gap-1">
                    <label 
                        htmlFor={`task-${task.id}`}
                        className={cn(
                            "font-medium cursor-pointer",
                            task.completed && "line-through text-muted-foreground"
                        )}
                    >
                        {task.title}
                    </label>
                    {task.description && <p className={cn("text-sm text-muted-foreground", task.completed && "line-through")}>{task.description}</p>}
                    {task.dueDate && <p className={cn("text-xs text-muted-foreground", task.completed && "line-through")}>Due: {format(task.dueDate.toDate(), 'PP')}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDialogOpen(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add a New Task'}</DialogTitle>
              <DialogDescription>Fill in the details for your task.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Read Chapter 5 of History" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Focus on the causes of the war." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date(new Date().setHours(0,0,0,0))
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingTask ? 'Save Changes' : 'Add Task'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

    </div>
  )
}
