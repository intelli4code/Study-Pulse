'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Megaphone, MailQuestion } from 'lucide-react';
import ManageAnnouncements from './_components/manage-announcements';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/app/dashboard');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router]);

    if (!isAuthorized) {
        return null; // or a loading spinner, or an unauthorized message
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    Admin Panel
                </h1>
                <p className="text-muted-foreground">Manage application settings and content.</p>
            </div>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="announcements">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Announcements
                    </TabsTrigger>
                    <TabsTrigger value="feedback" disabled>
                        <MailQuestion className="mr-2 h-4 w-4" />
                        Feedback
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="announcements">
                    <ManageAnnouncements />
                </TabsContent>
                <TabsContent value="feedback">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback</CardTitle>
                            <CardDescription>View user-submitted feedback and bug reports.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground p-10">
                           <p>This feature is coming soon!</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
