
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Megaphone, MailQuestion, Rocket, Users, BarChart, Settings } from 'lucide-react';
import ManageAnnouncements from './_components/manage-announcements';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ManageFeedback from './_components/manage-feedback';


export default function AdminPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    // This local state is no longer needed, we can rely on the userProfile from the hook.

    useEffect(() => {
        // Wait until loading is complete before doing anything
        if (loading) return;

        // If loading is done and there's no user, or the user is not an admin, redirect.
        if (!user || userProfile?.role !== 'admin') {
            router.replace('/app/dashboard');
        }
    }, [user, userProfile, loading, router]);


    // While loading or if the user is not an authorized admin, render nothing to prevent flicker.
    if (loading || !user || userProfile?.role !== 'admin') {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        Admin Panel
                    </h1>
                    <p className="text-muted-foreground">Manage application settings and content.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Rocket className="mr-2 h-4 w-4" />
                            View Feature Roadmap
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Admin Panel Feature Roadmap</DialogTitle>
                            <DialogDescription>
                                Here is a summary of the powerful features planned for the admin dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 grid gap-6 text-sm">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-primary" />User Management</h3>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    <li>View a full user directory with search functionality by email or ID.</li>
                                    <li>Suspend or ban users who violate terms of service.</li>
                                    <li>View a specific user's study logs and goals to provide technical support.</li>
                                    <li>Manually delete a user's account and all associated data.</li>
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><BarChart className="h-5 w-5 text-primary" />Analytics and Reporting</h3>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    <li>Track key metrics: active users (daily, weekly, monthly), most studied subjects, and average session length.</li>
                                    <li>Monitor overall growth trends for new user sign-ups and study logs created.</li>
                                    <li>Visualize data with interactive charts and graphs.</li>
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Settings className="h-5 w-5 text-primary" />Content and System Control</h3>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    <li>Manage the default list of subjects available to new users.</li>
                                    <li>Send push notifications or in-app messages to all users.</li>
                                    <li>Review and moderate shared content (for future collaborative features).</li>
                                    <li>Monitor system health, logs, and database activity to debug issues.</li>
                                </ul>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="announcements">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Announcements
                    </TabsTrigger>
                    <TabsTrigger value="feedback">
                        <MailQuestion className="mr-2 h-4 w-4" />
                        Feedback
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="announcements">
                    <ManageAnnouncements />
                </TabsContent>
                <TabsContent value="feedback">
                    <ManageFeedback />
                </TabsContent>
            </Tabs>
        </div>
    );
}
