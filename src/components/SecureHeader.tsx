
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

interface SecureHeaderProps {
  userId: string;
  onLogout: () => void;
}

const SecureHeader = ({ userId, onLogout }: SecureHeaderProps) => {
  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-vault-gradient rounded-lg shadow-md mb-8">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white/10 py-1 px-3 rounded-md">
          <User className="h-4 w-4 text-white" />
          <span className="text-white font-medium">{userId}</span>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onLogout}
        className="text-white hover:bg-white/20 hover:text-white"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Exit Vault
      </Button>
    </header>
  );
};

export default SecureHeader;
