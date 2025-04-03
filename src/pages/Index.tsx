
import { useState, useEffect } from 'react';
import UserSelector from '@/components/UserSelector';
import MessageForm from '@/components/MessageForm';
import MessageList from '@/components/MessageList';
import DebugDecrypt from '@/components/DebugDecrypt';
import SecureHeader from '@/components/SecureHeader';
import ReadMe from '@/pages/ReadMe';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare, Lock, Wrench } from 'lucide-react';

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('messages');

  // Check for saved user ID in localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('secure-vault-user-id');
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  const handleUserSelect = (id: string) => {
    setUserId(id);
    localStorage.setItem('secure-vault-user-id', id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('secure-vault-user-id');
  };

  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background bg-security-pattern">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-vault-gradient bg-clip-text text-transparent">
            Whisper Secure Vault
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            End-to-end encrypted messaging with AES-256
          </p>
        </div>
        <UserSelector onUserSelect={handleUserSelect} currentUser={userId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background bg-security-pattern">
      <div className="container max-w-5xl mx-auto px-4 py-6 flex-grow">
        <SecureHeader userId={userId} onLogout={handleLogout} />
        
        <Tabs 
          defaultValue="messages" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Debug
            </TabsTrigger>
            <TabsTrigger value="readme" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Design Notes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MessageForm userId={userId} onMessageSent={handleMessageSent} />
              <MessageList userId={userId} refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>
          
          <TabsContent value="debug">
            <DebugDecrypt userId={userId} />
          </TabsContent>
          
          <TabsContent value="readme">
            <ReadMe />
          </TabsContent>
        </Tabs>
      </div>
      
      <footer className="border-t border-border py-4 mt-auto">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Whisper Secure Vault</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Client-side AES-256 encryption
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
