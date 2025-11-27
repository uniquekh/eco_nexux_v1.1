import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - supports three roles: company, customer, admin
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  password: text("password"), // Only for company and admin
  role: text("role").notNull(), // 'company', 'customer', 'admin'
  name: text("name").notNull(),
  adminId: text("admin_id").unique(), // Only for admin users
  companyName: text("company_name"), // Only for company users
  registrationNumber: text("registration_number"), // Only for company users
  verified: boolean("verified").default(false), // For company verification by admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// OTP table for customer authentication
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOtpSchema = createInsertSchema(otps).omit({
  id: true,
  createdAt: true,
});
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Otp = typeof otps.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productCode: text("product_code").notNull().unique(), // RFID/NFC/QR/Barcode
  name: text("name").notNull(),
  category: text("category").notNull(),
  material: text("material").notNull(),
  size: text("size"),
  batchNo: text("batch_no"),
  companyId: integer("company_id").notNull(), // References users table
  currentStatus: text("current_status").notNull(), // Current lifecycle status
  manufactureDate: timestamp("manufacture_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Transactions table - blockchain-like immutable chain
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  txId: text("tx_id").notNull().unique(),
  productId: integer("product_id").notNull(), // References products table
  previousTxId: text("previous_tx_id"), // Creates the chain
  status: text("status").notNull(), // Manufactured, Sold, Used, Returned, Collected, etc.
  actorRole: text("actor_role").notNull(), // 'company', 'customer', 'admin'
  actorId: integer("actor_id").notNull(), // References users table
  location: text("location"),
  hash: text("hash").notNull(), // SHA256 hash for verification
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Pickup Requests table
export const pickupRequests = pgTable("pickup_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  customerId: integer("customer_id").notNull(), // References users table
  productIds: text("product_ids").array().notNull(), // Array of product IDs for pickup
  location: text("location").notNull(),
  preferredDate: text("preferred_date"),
  status: text("status").notNull().default("Pending"), // Pending, Assigned, Completed
  assignedAgentId: integer("assigned_agent_id"), // References users table (admin)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertPickupRequestSchema = createInsertSchema(pickupRequests).omit({
  id: true,
  createdAt: true,
});
export type InsertPickupRequest = z.infer<typeof insertPickupRequestSchema>;
export type PickupRequest = typeof pickupRequests.$inferSelect;

// Recycling Batches table
export const recyclingBatches = pgTable("recycling_batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  productIds: text("product_ids").array().notNull(),
  material: text("material").notNull(),
  weight: text("weight"),
  createdById: integer("created_by_id").notNull(), // Admin who created batch
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

export const insertRecyclingBatchSchema = createInsertSchema(recyclingBatches).omit({
  id: true,
  createdAt: true,
});
export type InsertRecyclingBatch = z.infer<typeof insertRecyclingBatchSchema>;
export type RecyclingBatch = typeof recyclingBatches.$inferSelect;
