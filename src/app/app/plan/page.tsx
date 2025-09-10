'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, Loader2, Wand2 } from 'lucide-react';
import { generateStudyPlan } from './actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const planSchema = z.object({
  studyGoals: z.string().min(10, 'Please describe your goals in a bit more detail.'),
  availableTime: z.string().min(3, 'Please specify your available time (e.g., "2 hours daily").'),
  subjects: z.string().min(3, 'Please list at least one subject.'),
});

type PlanFormValues = z.infer<typeof planSchema>;

export default function PlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      studyGoals: '',
      availableTime: '',
      subjects: '',
    },
  });

  const onSubmit = async (data: PlanFormValues) => {
    setIsLoading(true);
    setStudyPlan(null);
    try {
      const result = await generateStudyPlan(data);
      if (result.studyPlan) {
        setStudyPlan(result.studyPlan);
        toast({ title: 'Success!', description: 'Your personalized study plan has been generated.' });
      } else {
        throw new Error('The generated plan was empty.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Something went wrong while generating your plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <CardTitle>AI-Powered Study Plan</CardTitle>
          </div>
          <CardDescription>
            Tell us your goals, and our AI will create a personalized study plan for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studyGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are your study goals?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Ace my final exams in Math and Physics, learn the basics of React for a new project." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How much time can you commit?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 hours per day, 10 hours on weekends." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What subjects are you focusing on?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Calculus, European History, Web Development." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Generate Plan</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle>Your Personalized Plan</CardTitle>
          </div>
          <CardDescription>
            Here is the study schedule crafted just for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Generating your plan...</p>
              </div>
            </div>
          )}
          {!isLoading && studyPlan && (
             <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
                {studyPlan}
            </div>
          )}
          {!isLoading && !studyPlan && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Your generated plan will appear here.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
