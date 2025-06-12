
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // Assuming you have a Switch component
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings | Vishnu Finance Tracker',
};

export default function SettingsPage() {
  // In a real app, these would come from context/state management or API
  const userSettings = {
    name: 'Demo User',
    email: 'user@example.com',
    currency: 'INR',
    notifications: {
      email: true,
      sms: false,
    },
    darkMode: false, // Or detect from system/user preference
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Account Information</CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={userSettings.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={userSettings.email} readOnly className="bg-muted/50 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle size={14} /> Email cannot be changed here.
              </p>
            </div>
          </div>
          <Button className="mt-2">
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
            <Input id="currency" defaultValue={userSettings.currency} readOnly className="bg-muted/50 cursor-not-allowed" />
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
              <Switch
                id="dark-mode"
                checked={userSettings.darkMode}
                // onCheckedChange={(checked) => { /* Handle theme change */ }}
                aria-label="Toggle dark mode"
              />
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
                <Switch
                  id="email-notifications"
                  checked={userSettings.notifications.email}
                  // onCheckedChange={(checked) => { /* Handle email notification change */ }}
                  aria-label="Toggle email notifications"
                />
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
                  // onCheckedChange={(checked) => { /* Handle SMS notification change */ }}
                  aria-label="Toggle SMS notifications"
                  disabled // Example: SMS might be a premium feature or not configured
                />
              </div>
            </div>
          </div>
           <Button className="mt-2">
            <Save size={18} className="mr-2" /> Save Preferences
          </Button>
        </CardContent>
      </Card>
       <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
