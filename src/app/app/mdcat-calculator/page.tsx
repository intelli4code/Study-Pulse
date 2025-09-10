'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calculator, Sparkles } from "lucide-react";
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  fscMarks: z.coerce.number().min(0, "Marks must be positive.").max(1100, "Marks cannot exceed 1100."),
  mdcatMarks: z.coerce.number().min(0, "Marks must be positive.").max(200, "Marks cannot exceed 200."),
});

type FormValues = z.infer<typeof formSchema>;

export default function MdcatCalculatorPage() {
  const [aggregate, setAggregate] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fscMarks: 0,
      mdcatMarks: 0,
    },
  });

  function onSubmit(values: FormValues) {
    const { fscMarks, mdcatMarks } = values;
    const fscPercentage = (fscMarks / 1100) * 50;
    const mdcatPercentage = (mdcatMarks / 200) * 50;
    const totalAggregate = fscPercentage + mdcatPercentage;
    setAggregate(totalAggregate);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">MDCAT Aggregate Calculator</h1>
        <p className="text-muted-foreground">Calculate your estimated MDCAT aggregate score.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Enter Your Marks</CardTitle>
                <CardDescription>Based on the 50% F.Sc. and 50% MDCAT weightage.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="fscMarks"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>F.Sc / A-Level Equivalence Marks (out of 1100)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 1050" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="mdcatMarks"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>MDCAT Marks (out of 200)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 180" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full">
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate Aggregate
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center">
            <CardHeader className="items-center pb-2">
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Your Aggregate</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
                 {aggregate !== null ? (
                    <>
                        <p className="text-6xl font-bold text-primary tracking-tighter">
                            {aggregate.toFixed(4)}%
                        </p>
                        <p className="text-muted-foreground mt-2">Good luck with your admission!</p>
                    </>
                ) : (
                    <p className="text-muted-foreground">Your calculated aggregate will be shown here.</p>
                )}
            </CardContent>
             {aggregate !== null && (
                <CardFooter className="w-full">
                    <p className="text-xs text-muted-foreground text-center w-full">
                        This is an estimate based on the provided formula. Final merit may vary.
                    </p>
                </CardFooter>
            )}
        </Card>
      </div>
    </div>
  );
}
