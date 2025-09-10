'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Send, Loader2, User, Sparkles } from 'lucide-react';
import type { MessageData } from 'genkit/experimental/ai';
import { getTutorResponse } from './actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type ChatFormValues = z.infer<typeof chatSchema>;

export default function TutorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<MessageData[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: '',
    },
  });
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [chatHistory]);


  const onSubmit = async (data: ChatFormValues) => {
    setIsLoading(true);
    const userMessage: MessageData = { role: 'user', content: [{ text: data.message }] };
    const newChatHistory = [...chatHistory, userMessage];
    
    setChatHistory(newChatHistory);
    form.reset();

    try {
      const result = await getTutorResponse({
        history: newChatHistory.slice(0, -1), // Send history up to the last user message
        message: data.message,
      });

      if (result.response) {
        const modelMessage: MessageData = { role: 'model', content: [{ text: result.response }] };
        setChatHistory(prev => [...prev, modelMessage]);
      } else {
        throw new Error('The AI tutor returned an empty response.');
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => prev.slice(0, -1)); // Rollback optimistic update
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Something went wrong while talking to the tutor. Please try again.',
      });
    } finally {
      setIsLoading(false);
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
    <div className="flex h-[calc(100vh-8rem)] flex-col">
       <div className="mb-4">
         <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
         <p className="text-muted-foreground">Ask questions and get help on any subject.</p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0 flex flex-col">
           <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
                {chatHistory.length === 0 && (
                    <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <MessageSquare className="h-10 w-10" />
                            <p className="font-semibold">Start the conversation</p>
                            <p className="text-sm">Ask a question to start your session, e.g., "Explain the theory of relativity."</p>
                        </div>
                    </div>
                )}
                {chatHistory.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.role === 'model' && (
                        <Avatar className="h-9 w-9 border">
                            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </Avatar>
                    )}
                    <div className={cn(
                        "max-w-xl rounded-lg p-3 prose prose-sm dark:prose-invert max-w-none", 
                        message.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground',
                        'whitespace-pre-wrap'
                    )}>
                       <p>{message.content[0].text}</p>
                    </div>
                     {message.role === 'user' && user && (
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4 justify-start">
                        <Avatar className="h-9 w-9 border">
                            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </Avatar>
                        <div className="max-w-md rounded-lg p-3 bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    </div>
                )}
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-background/95">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Explain quantum physics in simple terms..." {...field} autoComplete="off" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} size="icon">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
