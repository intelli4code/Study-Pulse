'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Megaphone, MailQuestion, KeyRound, RefreshCw, Copy, CirclePlus } from 'lucide-react';
import ManageAnnouncements from './_components/manage-announcements';
import { regenerateAdminKey, verifyAdminKey, createAndSaveAdminKey } from './actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const [keyExistsInDb, setKeyExistsInDb] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user || user.email !== ADMIN_EMAIL) {
            router.replace('/app/dashboard');
            return;
        }

        const checkAuthorization = async () => {
            const sessionKey = sessionStorage.getItem('admin-key');
            if (!sessionKey) {
                router.replace('/admin/login');
                return;
            }

            const isValid = await verifyAdminKey(sessionKey);
            if (isValid) {
                setAdminKey(sessionKey);
                setIsAuthorized(true);
                // Simple check: if the key is not the initial one, it must be from DB.
                if (sessionKey !== 'secret-admin-key-54321') {
                    setKeyExistsInDb(true);
                }
            } else {
                sessionStorage.removeItem('admin-key');
                router.replace('/admin/login');
            }
        };

        checkAuthorization();
    }, [user, loading, router]);
    
    const handleCreateKey = async () => {
        if (window.confirm('Are you sure you want to create a new secure key in the database? The initial hardcoded key will no longer work after this.')) {
            try {
                const newKey = await createAndSaveAdminKey();
                setAdminKey(newKey);
                sessionStorage.setItem('admin-key', newKey);
                setKeyExistsInDb(true);
                navigator.clipboard.writeText(newKey);
                toast({ title: 'Secure Key Created', description: 'Your new key has been saved to the database and copied to your clipboard. Please save it securely.' });
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Failed to create the secure key.' });
            }
        }
    };
    
    const handleRegenerateKey = async () => {
        if (window.confirm('Are you sure you want to regenerate the admin key? This will invalidate your current key.')) {
            try {
                const newKey = await regenerateAdminKey();
                setAdminKey(newKey);
                sessionStorage.setItem('admin-key', newKey);
                navigator.clipboard.writeText(newKey);
                toast({ title: 'Key Regenerated', description: 'Your new admin key has been generated and copied to your clipboard. Please save it securely.' });
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Failed to regenerate key.' });
            }
        }
    };
    
    const copyToClipboard = () => {
        if(adminKey) {
            navigator.clipboard.writeText(adminKey);
            toast({ title: 'Copied!', description: 'Admin key copied to clipboard.' });
        }
    };

    if (!isAuthorized) {
        return null; // Or a loading spinner
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
                        <CardContent className="space-y-6">
                            {!keyExistsInDb ? (
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-3">
                                    <h3 className="font-semibold">Create Your Secure Key</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You are currently using the initial hardcoded key. For better security, create a permanent key that will be stored in your database.
                                    </p>
                                    <Button onClick={handleCreateKey}>
                                        <CirclePlus className="mr-2 h-4 w-4" />
                                        Create Secure Key
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Current Admin Key</label>
                                        <div className="flex gap-2">
                                            <Input type="password" readOnly value={adminKey} />
                                            <Button variant="outline" size="icon" onClick={copyToClipboard}><Copy className="h-4 w-4" /></Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">This key is stored in your database and is used to access the admin panel. Keep it safe.</p>
                                    </div>
                                    <Button variant="destructive" onClick={handleRegenerateKey}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Regenerate Key
                                    </Button>
                                </>
                            )}
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
