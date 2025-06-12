
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, KeyRound } from 'lucide-react';
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { updateProfile, onAuthStateChanged, type User } from 'firebase/auth';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [isSavingAccountInfo, setIsSavingAccountInfo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setFullName(user.displayName || '');
      } else {
        setFullName('');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    let initialDarkMode = false;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      initialDarkMode = storedTheme === 'dark';
    } else if (typeof window !== 'undefined') {
      initialDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const storedEmailNotifications = localStorage.getItem('emailNotificationsEnabled');
    if (storedEmailNotifications !== null) {
      setEmailNotificationsEnabled(JSON.parse(storedEmailNotifications));
    } else {
      setEmailNotificationsEnabled(true); 
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    localStorage.setItem('emailNotificationsEnabled', JSON.stringify(emailNotificationsEnabled));
  }, [darkMode, emailNotificationsEnabled, isMounted]);

  const handleAccountInfoSave = async () => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setIsSavingAccountInfo(true);
    try {
      await updateProfile(currentUser, { displayName: fullName });
      // Dispatch event so AppHeader can update if needed, though onAuthStateChanged should also cover it.
      window.dispatchEvent(new CustomEvent('financeProfileUpdated'));
      toast({
        title: "Account Updated",
        description: "Your account details have been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update account details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAccountInfo(false);
    }
  };

  const handlePreferencesSave = () => {
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been updated.",
    });
  };
  
  const userDisplayEmail = currentUser?.email || 'user@example.com';

  return (
    <div className="space-y-8 animate-fadeIn" style={{ animationDelay: '0ms' }}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Account Information</CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                disabled={!currentUser || isSavingAccountInfo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={userDisplayEmail} readOnly className="bg-muted/50 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle size={14} /> Email cannot be changed here.
              </p>
            </div>
          </div>
          <Button className="mt-2" onClick={handleAccountInfoSave} disabled={!currentUser || isSavingAccountInfo}>
            <Save size={18} className="mr-2" /> 
            {isSavingAccountInfo ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Preferences</CardTitle>
          <CardDescription>Customize your app experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Input id="currency" value="INR" readOnly className="bg-muted/50 cursor-not-allowed" />
             <p className="text-xs text-muted-foreground">Currency setting is managed globally (INR).</p>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-3">Theme</h3>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Enable or disable dark theme.
                </span>
              </Label>
              {isMounted && (
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  aria-label="Toggle dark mode"
                />
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive updates and alerts via email.
                    </span>
                </Label>
                {isMounted && (
                  <Switch
                    id="email-notifications"
                    checked={emailNotificationsEnabled}
                    onCheckedChange={setEmailNotificationsEnabled}
                    aria-label="Toggle email notifications"
                  />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md">
                 <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
                    <span>SMS Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Get important alerts via SMS (if available).
                    </span>
                </Label>
                <Switch
                  id="sms-notifications"
                  checked={false}
                  aria-label="Toggle SMS notifications"
                  disabled
                />
              </div>
            </div>
          </div>
           <Button className="mt-2" onClick={handlePreferencesSave}>
            <Save size={18} className="mr-2" /> Save Preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Change Password</CardTitle>
          <CardDescription>
            Password management is handled through Firebase. 
            If you need to change your password, please use the "Forgot Password" link on the login page, 
            or manage your account through Firebase directly if applicable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="mt-2">
            <KeyRound size={18} className="mr-2" /> Change Password (Disabled)
          </Button>
           <p className="text-xs text-muted-foreground mt-2">
            Direct password change within the app is currently not enabled with Firebase integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
