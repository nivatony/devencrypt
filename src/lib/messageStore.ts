
/**
 * Message Store Service for Whisper Secure Vault
 * 
 * This service provides functionality to store and retrieve encrypted messages
 * with proper user isolation.
 */

import { encryptMessage, decryptMessage } from './encryption';
import { toast } from '@/components/ui/use-toast';

// Interface for our message object
export interface Message {
  id: string;
  userId: string;
  encryptedContent: string;
  timestamp: number;
  expiresAt?: number; // Optional expiry timestamp
}

// In-memory storage for messages (in a real app, this would be a database)
let messages: Message[] = [];

// Generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Store a message for a user
 * @param userId - The user ID
 * @param content - The plaintext message
 * @param expiryMinutes - Optional, minutes until the message expires
 * @returns The stored message object
 */
export async function storeMessage(
  userId: string, 
  content: string, 
  expiryMinutes?: number
): Promise<Message> {
  try {
    // Encrypt the message content
    const encryptedContent = await encryptMessage(userId, content);
    
    // Calculate expiry time if needed
    const expiresAt = expiryMinutes 
      ? Date.now() + expiryMinutes * 60 * 1000 
      : undefined;
    
    // Create the message object
    const message: Message = {
      id: generateId(),
      userId,
      encryptedContent,
      timestamp: Date.now(),
      expiresAt
    };
    
    // Store the message
    messages.push(message);
    
    // Set up auto-deletion if expiry is set
    if (expiresAt) {
      const timeout = expiresAt - Date.now();
      setTimeout(() => {
        messages = messages.filter(m => m.id !== message.id);
      }, timeout);
    }
    
    return message;
  } catch (error) {
    console.error('Error storing message:', error);
    toast({
      title: "Error storing message",
      description: error instanceof Error ? error.message : String(error),
      variant: "destructive"
    });
    throw error;
  }
}

/**
 * Retrieve all messages for a user
 * @param userId - The user ID
 * @returns Array of decrypted messages
 */
export async function retrieveMessages(userId: string): Promise<{ id: string; content: string; timestamp: number }[]> {
  try {
    // Filter messages by userId and remove expired ones
    const now = Date.now();
    const userMessages = messages.filter(
      msg => msg.userId === userId && (!msg.expiresAt || msg.expiresAt > now)
    );
    
    // Decrypt all messages
    const decryptedMessages = await Promise.all(
      userMessages.map(async (msg) => {
        try {
          const content = await decryptMessage(userId, msg.encryptedContent);
          return {
            id: msg.id,
            content,
            timestamp: msg.timestamp
          };
        } catch (error) {
          console.error(`Error decrypting message ${msg.id}:`, error);
          return {
            id: msg.id,
            content: "[Decryption failed]",
            timestamp: msg.timestamp
          };
        }
      })
    );
    
    // Return the decrypted messages, sorted by timestamp (newest first)
    return decryptedMessages.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    toast({
      title: "Error retrieving messages",
      description: error instanceof Error ? error.message : String(error),
      variant: "destructive"
    });
    throw error;
  }
}

/**
 * Clear all messages for a user
 * @param userId - The user ID
 */
export function clearMessages(userId: string): void {
  const initialCount = messages.length;
  messages = messages.filter(msg => msg.userId !== userId);
  const removed = initialCount - messages.length;
  
  toast({
    title: "Messages cleared",
    description: `Removed ${removed} message${removed === 1 ? '' : 's'}`
  });
}
