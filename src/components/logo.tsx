import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrainCircuit className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold text-foreground">StudyPulse</h1>
    </div>
  );
}
