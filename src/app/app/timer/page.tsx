'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, BellRing } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export default function TimerPage() {
  const [settings, setSettings] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [mode, setMode] = useState<TimerMode>('work');
  const [time, setTime] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [progress, setProgress] = useState(100);
  const [endTime, setEndTime] = useState<string | null>(null);

  const totalDuration = useMemo(() => settings[mode] * 60, [settings, mode]);

  const handleModeChange = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTime(settings[newMode] * 60);
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      setIsActive(false);
      // Play sound
      const audio = new Audio('/sounds/bell.mp3');
      audio.play().catch(e => console.error("Error playing sound:", e));
      // Switch mode automatically
      if (mode === 'work') {
        handleModeChange('shortBreak');
      } else {
        handleModeChange('work');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, handleModeChange]);
  
  useEffect(() => {
    setEndTime(new Date(Date.now() + time * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  }, [time]);

  useEffect(() => {
    setProgress((time / totalDuration) * 100);
  }, [time, totalDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(settings[mode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const handleSettingsSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSettings = {
        work: Number(formData.get('work')),
        shortBreak: Number(formData.get('shortBreak')),
        longBreak: Number(formData.get('longBreak')),
    };
    setSettings(newSettings);
    setIsSettingsOpen(false);
    setIsActive(false);
    setTime(newSettings[mode] * 60);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Study Timer</CardTitle>
          <CardDescription className="text-center">Use the Pomodoro Technique to stay focused.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Tabs value={mode} onValueChange={(value) => handleModeChange(value as TimerMode)} className="w-full max-w-xs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="work">Work</TabsTrigger>
              <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
              <TabsTrigger value="longBreak">Long Break</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative h-64 w-64">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="stroke-current text-muted"
                strokeWidth="4"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
              ></circle>
              <circle
                className="stroke-current text-primary transition-all duration-1000 ease-linear"
                strokeWidth="4"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                strokeDasharray="283"
                strokeDashoffset={283 - (progress / 100) * 283}
                transform="rotate(-90 50 50)"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono tabular-nums tracking-tighter">
                {formatTime(time)}
              </span>
              <p className='text-muted-foreground mt-2 flex items-center gap-2'>
                <BellRing className='w-4 h-4'/> <span>End Time: {endTime}</span>
              </p>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-4">
            <Button size="lg" className="w-36" onClick={toggleTimer}>
              {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button size="icon" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="outline"><Settings className="h-5 w-5" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Timer Settings</DialogTitle>
                        <DialogDescription>Customize your Pomodoro intervals.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSettingsSave} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="work">Work (minutes)</Label>
                            <Input id="work" name="work" type="number" defaultValue={settings.work} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                            <Input id="shortBreak" name="shortBreak" type="number" defaultValue={settings.shortBreak} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="longBreak">Long Break (minutes)</Label>
                            <Input id="longBreak" name="longBreak" type="number" defaultValue={settings.longBreak} />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
