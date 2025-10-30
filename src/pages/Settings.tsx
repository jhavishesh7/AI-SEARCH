import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access settings</p>
          <Button onClick={() => navigate('/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-light">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Account Settings */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Account Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your account security and preferences
            </p>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => navigate('/profile')}
            >
              Edit Profile
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-2 text-red-900 dark:text-red-100">
              Danger Zone
            </h2>
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              These actions cannot be undone. Please proceed with caution.
            </p>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
