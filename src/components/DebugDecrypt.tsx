
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bug, Play, Code, AlertTriangle, Shield } from 'lucide-react';
import { debugDecrypt, encryptTestMessage } from '@/lib/api';
import { testBrokenDecrypt } from '@/lib/encryption';
import { useToast } from '@/components/ui/use-toast';

interface DebugDecryptProps {
  userId: string;
}

const DebugDecrypt = ({ userId }: DebugDecryptProps) => {
  const [encryptedText, setEncryptedText] = useState('');
  const [testMessage, setTestMessage] = useState('Test this decryption fix!');
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDecrypt = async () => {
    if (!encryptedText) {
      toast({
        title: "Empty input",
        description: "Please enter encrypted text to decrypt",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await debugDecrypt(userId, encryptedText);
      if (result.success) {
        setDecryptedResult(result.decrypted);
      } else {
        setDecryptedResult(`Error: ${result.error}`);
      }
    } catch (error) {
      setDecryptedResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTest = async () => {
    if (!testMessage) {
      toast({
        title: "Empty message",
        description: "Please enter a test message to encrypt",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await encryptTestMessage(userId, testMessage);
      if (result.success) {
        setEncryptedText(result.encrypted);
        toast({
          title: "Test message encrypted",
          description: "Now you can try the debug decrypt function"
        });
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
      setIsLoading(false);
    }
  };

  const runDecryptTest = async () => {
    setIsLoading(true);
    try {
      const result = await testBrokenDecrypt();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test threw an error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-accent" />
          Debug Decryption Function
        </CardTitle>
        <CardDescription>
          Test the fixed decryption function that had issues with IV handling and incorrect decoding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testMessage">Test Message</Label>
          <div className="flex gap-2">
            <Input
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a message to encrypt for testing"
              className="flex-1"
            />
            <Button onClick={handleGenerateTest} disabled={isLoading}>
              Encrypt
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="encryptedText">Encrypted Text (Base64)</Label>
          <Textarea
            id="encryptedText"
            value={encryptedText}
            onChange={(e) => setEncryptedText(e.target.value)}
            placeholder="Paste encrypted text here"
            className="min-h-[80px]"
          />
        </div>

        <div className="flex justify-between gap-4">
          <Button 
            onClick={handleDecrypt} 
            disabled={isLoading || !encryptedText}
            variant="default"
            className="flex-1"
          >
            <Code className="h-4 w-4 mr-2" />
            Run Debug Decrypt
          </Button>
          
          <Button 
            onClick={runDecryptTest} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Test Fix
          </Button>
        </div>

        {decryptedResult && (
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="text-sm text-muted-foreground mb-1">Decryption Result:</div>
            <div className="font-mono text-sm">{decryptedResult}</div>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-lg border ${testResult.success ? 'border-green-500/30 bg-green-500/10' : 'border-destructive/30 bg-destructive/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <div className="text-green-500 font-semibold flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Test Passed!
                </div>
              ) : (
                <div className="text-destructive font-semibold flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Test Failed
                </div>
              )}
            </div>
            <div className="text-sm">{testResult.message}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugDecrypt;
