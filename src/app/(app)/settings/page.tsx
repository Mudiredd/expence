
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [fullName, setFullName] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);


  // Placeholder for other user settings - can be made dynamic later
  const userSettings = {
    email: 'user@example.com', // This will be read from localStorage in AppHeader
    currency: 'INR',
    notifications: {
      sms: false,
    },
  };

  useEffect(() => {
    setIsMounted(true);
    // Dark Mode Initialization
    let initialDarkMode = false;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      initialDarkMode = storedTheme === 'dark';
    } else if (typeof window !== 'undefined') {
      initialDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setDarkMode(initialDarkMode);
    // Apply theme immediately based on initialDarkMode
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Email Notifications Initialization
    const storedEmailNotifications = localStorage.getItem('emailNotificationsEnabled');
    if (storedEmailNotifications !== null) {
      setEmailNotificationsEnabled(JSON.parse(storedEmailNotifications));
    } else {
      setEmailNotificationsEnabled(true); // Default to true
    }

    // Full Name Initialization
    const storedName = localStorage.getItem('financeUserName');
    if (storedName) {
      setFullName(storedName);
    } else {
      const emailName = localStorage.getItem('financeUserEmail')?.split('@')[0];
      setFullName(emailName || 'Demo User'); // Default if not found
    }

  }, []);

  // Effect for Dark Mode and Email Notifications Persistence
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

  const handleAccountInfoSave = () => {
    localStorage.setItem('financeUserName', fullName);
    window.dispatchEvent(new CustomEvent('financeProfileUpdated')); // Dispatch event
    toast({
      title: "Account Updated",
      description: "Your account details have been successfully updated.",
    });
  };

  const handlePreferencesSave = () => {
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been updated (if applicable).",
    });
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    setIsPasswordChanging(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      setIsPasswordChanging(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      setIsPasswordChanging(false);
      return;
    }

    // Prototype: Check against the hardcoded password for 'user@example.com'
    const DEMO_CURRENT_PASSWORD = "password123";
    const storedUserPassword = localStorage.getItem('financeUserPassword');
    const actualCurrentPassword = storedUserPassword || DEMO_CURRENT_PASSWORD;


    if (currentPassword !== actualCurrentPassword) {
      toast({
        title: "Error",
        description: "Incorrect current password.",
        variant: "destructive",
      });
      setIsPasswordChanging(false);
      return;
    }
    
    // Prototype: "Store" the new password. In a real app, this would be a secure backend call.
    localStorage.setItem('financeUserPassword', newPassword);

    toast({
      title: "Password Changed",
      description: "Your password has been successfully updated.",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsPasswordChanging(false);
  };
  
  const userDisplayEmail = isMounted ? localStorage.getItem('financeUserEmail') || userSettings.email : userSettings.email;


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
          <Button className="mt-2" onClick={handleAccountInfoSave}>
            <Save size={18} className="mr-2" /> Save Changes
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
            <Input id="currency" value={userSettings.currency} readOnly className="bg-muted/50 cursor-not-allowed" />
             <p className="text-xs text-muted-foreground">Currency setting is managed globally.</p>
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
                  checked={userSettings.notifications.sms}
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
          <CardDescription>Update your account password.
            <br/>
            <span className="text-xs text-muted-foreground">(For demo user: current password is 'password123')</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span className="sr-only">{showCurrentPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
               <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span className="sr-only">{showNewPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                >
                  {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span className="sr-only">{showConfirmNewPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="mt-2" disabled={isPasswordChanging}>
              <KeyRound size={18} className="mr-2" /> 
              {isPasswordChanging ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
    
