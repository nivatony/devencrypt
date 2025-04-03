
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, RefreshCw, Inbox, Shield } from 'lucide-react';
import { getMessages } from '@/lib/api';
import { clearMessages } from '@/lib/messageStore';
import { useToast } from '@/components/ui/use-toast';

interface MessageListProps {
  userId: string;
  refreshTrigger: number;
}

interface DecodedMessage {
  id: string;
  content: string;
  timestamp: number;
}

const MessageList = ({ userId, refreshTrigger }: MessageListProps) => {
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const result = await getMessages(userId);
      if (result.success) {
        setMessages(result.messages);
      } else {
        toast({
          title: "Error fetching messages",
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [userId, refreshTrigger]);

  const handleClear = () => {
    clearMessages(userId);
    setMessages([]);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Decrypted Messages
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMessages}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={messages.length === 0 || isLoading}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Inbox className="h-12 w-12 mb-2 opacity-20" />
            <p>No messages found</p>
            <p className="text-sm">Encrypted messages will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="p-4 rounded-lg border border-border bg-muted/30 group"
                >
                  <div className="text-sm text-muted-foreground mb-1">
                    {formatDate(message.timestamp)}
                  </div>
                  <div className="group-hover:animate-decrypt">
                    {message.content}
                  </div>
                  <div className="mt-2">
                    <span className="decryption-badge">
                      <Shield className="h-3 w-3 mr-1" />
                      Decrypted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageList;
