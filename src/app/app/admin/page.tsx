'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Megaphone, MailQuestion, KeyRound, RefreshCw, Copy } from 'lucide-react';
import ManageAnnouncements from './_components/manage-announcements';
import { getAdminKey, regenerateAdminKey } from './actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminKey, setAdminKey] = useState('');

    useEffect(() => {
        if (!loading) {
            const sessionKey = sessionStorage.getItem('admin-key');
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/app/dashboard');
                return;
            }
            // Simple session check
            getAdminKey().then(key => {
                if (sessionKey !== key) {
                    router.replace('/admin/login');
                } else {
                    setAdminKey(key);
                    setIsAuthorized(true);
                }
            });
        }
    }, [user, loading, router]);
    
    const handleRegenerateKey = async () => {
        if (window.confirm('Are you sure you want to regenerate the admin key? You will be logged out.')) {
            try {
                const newKey = await regenerateAdminKey();
                setAdminKey(newKey);
                sessionStorage.removeItem('admin-key');
                toast({ title: 'Key Regenerated', description: 'Your new admin key has been generated. You will be redirected to log in again.' });
                router.replace('/admin/login');
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Failed to regenerate key.' });
            }
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(adminKey);
        toast({ title: 'Copied!', description: 'Admin key copied to clipboard.' });
    };

    if (!isAuthorized) {
        return null;
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
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="announcements">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Announcements
                    </TabsTrigger>
                     <TabsTrigger value="security">
                        <KeyRound className="mr-2 h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="feedback" disabled>
                        <MailQuestion className="mr-2 h-4 w-4" />
                        Feedback
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="announcements">
                    <ManageAnnouncements />
                </TabsContent>
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Security</CardTitle>
                            <CardDescription>Manage your administrator access key.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Admin Key</label>
                                <div className="flex gap-2">
                                    <Input type="password" readOnly value={adminKey} />
                                    <Button variant="outline" size="icon" onClick={copyToClipboard}><Copy className="h-4 w-4" /></Button>
                                </div>
                                <p className="text-xs text-muted-foreground">This key is used to access the admin panel. Keep it safe.</p>
                            </div>
                            <Button variant="destructive" onClick={handleRegenerateKey}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerate Key
                            </Button>
                        </CardContent>
                    </Card>
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
