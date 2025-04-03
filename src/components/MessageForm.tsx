
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, ClockIcon, SendIcon } from 'lucide-react';
import { postMessage } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface MessageFormProps {
  userId: string;
  onMessageSent: () => void;
}

const MessageForm = ({ userId, onMessageSent }: MessageFormProps) => {
  const [message, setMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [enableExpiry, setEnableExpiry] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to encrypt",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsEncrypting(true);
      
      // Call the API to encrypt and store the message
      const result = await postMessage(
        userId, 
        message, 
        enableExpiry ? 10 : undefined // 10 minute expiry if enabled
      );
      
      if (result.success) {
        toast({
          title: "Message secured",
          description: "Your message has been encrypted and stored"
        });
        setMessage('');
        onMessageSent();
      } else {
        toast({
          title: "Encryption failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <LockIcon className="h-5 w-5 text-primary" />
          Encrypt New Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your secret message here..."
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="expiry"
              checked={enableExpiry}
              onCheckedChange={setEnableExpiry}
            />
            <Label htmlFor="expiry" className="flex items-center gap-1.5 cursor-pointer">
              <ClockIcon className="h-4 w-4" />
              Auto-delete after 10 minutes
            </Label>
          </div>
          
          <Button 
            type="submit" 
            disabled={isEncrypting || !message.trim()}
            className="w-full bg-vault-gradient"
          >
            {isEncrypting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Encrypting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SendIcon className="h-4 w-4" /> 
                Encrypt & Send
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessageForm;
