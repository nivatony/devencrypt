import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import { Bug } from '@/components/icons/Bug';

const ReadMe = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Whisper Secure Vault</h1>
        <p className="text-muted-foreground">
          A secure messaging system with client-side encryption
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Design Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> 
              Encryption Method and Mode
            </h3>
            <p className="text-muted-foreground">
              For this application, we chose AES-256 in CBC (Cipher Block Chaining) mode. AES-256 
              is one of the most widely used and secure symmetric encryption algorithms, approved 
              for top-secret information by the NSA. We selected CBC mode because:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>It prevents patterns in the plaintext from being visible in the ciphertext</li>
              <li>It's more secure than ECB mode which doesn't use an IV</li>
              <li>It's widely supported in browser environments via Web Crypto API</li>
              <li>The 256-bit key length provides strong security against brute force attacks</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              User Access Control
            </h3>
            <p className="text-muted-foreground">
              To ensure only the original user can access their messages, we implemented:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>User-specific key derivation: Each encryption key is derived from the user ID</li>
              <li>Client-side encryption/decryption: Keys never leave the client browser</li>
              <li>
                Message storage with user ID binding: Messages are stored with their respective 
                user IDs and can only be retrieved by querying with the same ID
              </li>
              <li>
                In a production environment, we would add proper authentication and token-based 
                API authorization to prevent API abuse
              </li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              IV Storage and Extraction
            </h3>
            <p className="text-muted-foreground">
              For proper AES-CBC encryption, we need a random Initialization Vector (IV) for each message. Our approach:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Generate a cryptographically secure random IV for each message</li>
              <li>Prepend the IV to the encrypted data before base64 encoding</li>
              <li>On decryption, extract the first 16 bytes as the IV</li>
              <li>Use the remaining bytes as the encrypted data</li>
              <li>This approach keeps the IV and ciphertext together as one unit, simplifying storage and retrieval</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Prevention of User ID Spoofing
            </h3>
            <p className="text-muted-foreground">
              To prevent user ID spoofing in a production environment:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Implement proper authentication with session tokens or JWT</li>
              <li>Validate user identity on every API request</li>
              <li>Use HTTPS for all communications to prevent MITM attacks</li>
              <li>Rate limit API requests to prevent brute force attacks</li>
              <li>Implement server-side access control for all endpoints</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Decryption Debug Fix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The original broken decryption function had several issues:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Incorrect IV extraction: It was not properly separating the IV from the encrypted data</li>
            <li>Incorrect buffer handling: The encrypted data was not being properly sliced</li>
            <li>Improper decoding: The base64 decoding was implemented incorrectly</li>
            <li>Missing error handling: Errors were not properly caught and reported</li>
          </ul>
          
          <p className="text-muted-foreground mt-4">
            The fixed implementation correctly extracts the IV from the first 16 bytes of the decrypted 
            buffer, uses the remaining data as the encrypted content, and properly handles the 
            encoding/decoding processes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadMe;
