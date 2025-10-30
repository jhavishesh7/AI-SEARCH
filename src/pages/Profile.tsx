import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [language, setLanguage] = useState<'auto' | 'ne' | 'en'>(
    (userProfile?.preferences?.language as 'auto' | 'ne' | 'en') || 'auto'
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
          <Button onClick={() => navigate('/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName,
        preferences: {
          ...userProfile?.preferences,
          language: language as 'auto' | 'ne' | 'en',
        },
      });
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-light">Your Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Account Info */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-background border-2 border-border/50 rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 bg-background border-2 border-border/50 hover:border-border focus:border-primary/50 rounded-lg transition-all"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Default Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'auto' | 'ne' | 'en')}
                  className="w-full px-4 py-2.5 bg-background border-2 border-border/50 hover:border-border focus:border-primary/50 rounded-lg transition-all text-foreground"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="ne">Nepali (नेपाली)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
