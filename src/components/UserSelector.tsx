
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

interface UserSelectorProps {
  onUserSelect: (userId: string) => void;
  currentUser: string | null;
}

const UserSelector = ({ onUserSelect, currentUser }: UserSelectorProps) => {
  const [userId, setUserId] = useState<string>(currentUser || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }
    
    setError(null);
    onUserSelect(userId.trim());
  };

  return (
    <div className="w-full max-w-md p-6 rounded-lg bg-card shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/20">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">User Authentication</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your secure user ID"
              className="w-full"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          
          <Button type="submit" className="w-full bg-vault-gradient">
            Access Secure Vault
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            This ID will be used to encrypt and decrypt your messages.
            <br />Only you can access messages encrypted with your ID.
          </p>
        </div>
      </form>
    </div>
  );
};

export default UserSelector;
