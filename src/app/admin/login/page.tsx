
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyAdminKey, resetAdminKey } from '@/app/app/admin/actions';
import Logo from '@/components/logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const isValid = await verifyAdminKey(key);
      if (isValid) {
        sessionStorage.setItem('admin-key', key);
        router.push('/app/admin');
      } else {
        throw new Error('The provided admin key is incorrect.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'The provided key is incorrect.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetKey = async () => {
    if (window.confirm('Are you sure you want to reset the admin key to its default value? This is a last resort if you have lost your key.')) {
        setIsResetting(true);
        try {
            await resetAdminKey();
            toast({
                title: 'Key Reset Successfully',
                description: 'The admin key has been reset to the default value. You can now log in with it.',
            });
            setKey('');
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to reset the admin key.',
            });
        } finally {
            setIsResetting(false);
        }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>Enter the secret key to access the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-key">Admin Key</Label>
              <Input
                id="admin-key"
                type="password"
                placeholder="••••••••••••••••"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isResetting}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              Unlock
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Lost your key?</p>
             <Button variant="link" className="h-auto p-0 text-xs" onClick={handleResetKey} disabled={isResetting || isLoading}>
                {isResetting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting Key...</>
                ): (
                    'Reset to default'
                )}
             </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
