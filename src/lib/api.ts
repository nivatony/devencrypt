
/**
 * API Service for Whisper Secure Vault
 * 
 * This service simulates REST API endpoints using our message store
 */

import { storeMessage, retrieveMessages } from './messageStore';
import { brokenDecrypt, encryptMessage } from './encryption';
import { toast } from '@/components/ui/use-toast';

// POST /messages
export async function postMessage(userId: string, message: string, expiryMinutes?: number) {
  try {
    const result = await storeMessage(userId, message, expiryMinutes);
    return {
      success: true,
      messageId: result.id,
      timestamp: result.timestamp
    };
  } catch (error) {
    console.error('API - Error posting message:', error);
    toast({
      title: "API Error",
      description: "Failed to store message",
      variant: "destructive"
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// GET /messages/:userId
export async function getMessages(userId: string) {
  try {
    const messages = await retrieveMessages(userId);
    return {
      success: true,
      messages
    };
  } catch (error) {
    console.error('API - Error getting messages:', error);
    toast({
      title: "API Error",
      description: "Failed to retrieve messages",
      variant: "destructive"
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// POST /debug/decrypt
export async function debugDecrypt(userId: string, encryptedText: string) {
  try {
    // Attempt to decrypt with the fixed function
    const decrypted = await brokenDecrypt(userId, encryptedText);
    return {
      success: true,
      decrypted
    };
  } catch (error) {
    console.error('API - Error in debug decrypt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to encrypt a test message for debugging
export async function encryptTestMessage(userId: string, message: string) {
  try {
    const encrypted = await encryptMessage(userId, message);
    return {
      success: true,
      encrypted
    };
  } catch (error) {
    console.error('API - Error encrypting test message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
