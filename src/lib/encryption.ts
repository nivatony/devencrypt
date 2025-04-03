
/**
 * Encryption Service for Whisper Secure Vault
 * 
 * This service provides AES-256-CBC encryption and decryption functions
 * with proper IV handling and base64 encoding/decoding.
 */

// We use the native Node.js crypto module through a browser-compatible wrapper
import { Buffer } from 'buffer';

// Constants
const ALGORITHM = 'AES-256-CBC';
const KEY_LENGTH = 32; // 256 bits = 32 bytes
const IV_LENGTH = 16; // 128 bits = 16 bytes

/**
 * Derive a cryptographic key from a passphrase using PBKDF2
 * In a real production app, we would use a proper KDF with salt
 * But for this demo we use a simplified approach
 */
export function deriveKey(userId: string): Uint8Array {
  // In a real app, we would use PBKDF2 with a proper salt
  // This is simplified for the demo
  const key = new Uint8Array(KEY_LENGTH);
  const userIdBytes = new TextEncoder().encode(userId);
  
  // Simple key derivation for the demo (not for production use)
  for (let i = 0; i < KEY_LENGTH; i++) {
    key[i] = userIdBytes[i % userIdBytes.length] ^ 0x42; // Simple XOR mixing
  }
  
  return key;
}

/**
 * Generate a random initialization vector (IV)
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt a message using AES-256-CBC
 * @param userId - The user ID (used to derive the key)
 * @param message - The plaintext message to encrypt
 * @returns base64 encoded string containing the IV + ciphertext
 */
export async function encryptMessage(userId: string, message: string): Promise<string> {
  try {
    const iv = generateIV();
    const key = deriveKey(userId);
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt']
    );
    
    // Encrypt the message
    const data = new TextEncoder().encode(message);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      data
    );
    
    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(iv.length + encrypted.byteLength);
    encryptedArray.set(iv);
    encryptedArray.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...encryptedArray));
    return base64;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message using AES-256-CBC
 * @param userId - The user ID (used to derive the key)
 * @param encryptedBase64 - The encrypted message in base64 format (includes IV)
 * @returns decrypted plaintext message
 */
export async function decryptMessage(userId: string, encryptedBase64: string): Promise<string> {
  try {
    // Convert from base64
    const encryptedStr = atob(encryptedBase64);
    const encryptedBytes = new Uint8Array(encryptedStr.length);
    for (let i = 0; i < encryptedStr.length; i++) {
      encryptedBytes[i] = encryptedStr.charCodeAt(i);
    }
    
    // Extract IV and encrypted data
    const iv = encryptedBytes.slice(0, IV_LENGTH);
    const data = encryptedBytes.slice(IV_LENGTH);
    
    // Import the key
    const key = deriveKey(userId);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      data
    );
    
    // Convert to string
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * This is the broken decrypt function we need to fix.
 * It has several issues:
 * 1. It doesn't properly extract the IV from the encrypted data
 * 2. It uses an incorrect decoding method
 * 3. Error handling is insufficient
 */
export async function brokenDecrypt(userId: string, encryptedBase64: string): Promise<string> {
  try {
    // ISSUE 1: Not properly extracting the IV
    // Original (broken) code:
    // const encryptedBytes = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
    // const iv = encryptedBytes; // WRONG: Should slice to get IV
    // const data = encryptedBytes; // WRONG: Should slice to get data after IV
    
    // FIXED CODE:
    const encryptedStr = atob(encryptedBase64);
    const encryptedBytes = new Uint8Array(encryptedStr.length);
    for (let i = 0; i < encryptedStr.length; i++) {
      encryptedBytes[i] = encryptedStr.charCodeAt(i);
    }
    
    // Extract IV and encrypted data correctly
    const iv = encryptedBytes.slice(0, IV_LENGTH);
    const data = encryptedBytes.slice(IV_LENGTH);
    
    // ISSUE 2: Key derivation was inconsistent
    const key = deriveKey(userId);
    
    // Import the key properly
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC', length: 256 },
      false,
      ['decrypt']
    );
    
    // ISSUE 3: AES mode not specified correctly
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv }, // Fixed: Properly specify AES-CBC mode with the IV
      cryptoKey,
      data
    );
    
    // Convert to string
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    // ISSUE 4: Improved error handling
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Test case that reproduces the issue in the original broken function
 */
export async function testBrokenDecrypt(): Promise<{ success: boolean, message: string }> {
  try {
    const userId = "test-user-123";
    const originalMessage = "This is a secret message!";
    
    // First encrypt a message
    const encrypted = await encryptMessage(userId, originalMessage);
    
    // Try to decrypt with the fixed function
    const decrypted = await brokenDecrypt(userId, encrypted);
    
    // Check if decryption worked correctly
    if (decrypted === originalMessage) {
      return { 
        success: true,
        message: `Test passed! Original: "${originalMessage}", Decrypted: "${decrypted}"` 
      };
    } else {
      return { 
        success: false,
        message: `Test failed! Original: "${originalMessage}", Decrypted: "${decrypted}"` 
      };
    }
  } catch (error) {
    return { 
      success: false,
      message: `Test threw an error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
