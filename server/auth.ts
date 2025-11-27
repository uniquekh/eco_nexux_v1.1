import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// OTP utilities
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(email: string): Promise<string> {
  const code = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

  await storage.createOtp({
    email,
    code,
    expiresAt,
  });

  // In production, send this via email/SMS
  console.log(`OTP for ${email}: ${code}`);
  return code;
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const otp = await storage.getValidOtp(email, code);
  return !!otp;
}

// Transaction hash generation
export function generateTransactionHash(
  txId: string,
  previousTxId: string | null,
  productId: number,
  status: string,
  actorId: number,
  timestamp: Date
): string {
  const data = `${txId}${previousTxId || ""}${productId}${status}${actorId}${timestamp.toISOString()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Unique ID generators
export function generateProductCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `RFID-2024-${timestamp}${random}`.toUpperCase();
}

export function generateTransactionId(productId: number, sequence: number): string {
  const timestamp = Date.now().toString(36);
  return `tx_${productId}_${sequence}_${timestamp}`;
}

export function generatePickupRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `PR-2024-${random}${timestamp}`.toUpperCase();
}

export function generateBatchId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `BATCH-2024-${random}${timestamp}`.toUpperCase();
}
