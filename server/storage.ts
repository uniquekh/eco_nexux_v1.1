import { 
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type Transaction,
  type InsertTransaction,
  type PickupRequest,
  type InsertPickupRequest,
  type RecyclingBatch,
  type InsertRecyclingBatch,
  type Otp,
  type InsertOtp
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAdminId(adminId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllCompanies(): Promise<User[]>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<Otp>;
  getValidOtp(email: string, code: string): Promise<Otp | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  getProductsByCompany(companyId: number): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  bulkCreateProducts(products: InsertProduct[]): Promise<Product[]>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByProduct(productId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getLatestTransaction(productId: number): Promise<Transaction | undefined>;
  
  // Pickup Request operations
  getPickupRequest(id: number): Promise<PickupRequest | undefined>;
  getPickupRequestsByCustomer(customerId: number): Promise<PickupRequest[]>;
  getAllPickupRequests(): Promise<PickupRequest[]>;
  createPickupRequest(request: InsertPickupRequest): Promise<PickupRequest>;
  updatePickupRequest(id: number, updates: Partial<PickupRequest>): Promise<PickupRequest | undefined>;
  
  // Recycling Batch operations
  getRecyclingBatch(id: number): Promise<RecyclingBatch | undefined>;
  getAllRecyclingBatches(): Promise<RecyclingBatch[]>;
  createRecyclingBatch(batch: InsertRecyclingBatch): Promise<RecyclingBatch>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private transactions: Map<number, Transaction>;
  private pickupRequests: Map<number, PickupRequest>;
  private recyclingBatches: Map<number, RecyclingBatch>;
  private otps: Map<number, Otp>;
  private nextUserId: number;
  private nextProductId: number;
  private nextTransactionId: number;
  private nextPickupId: number;
  private nextBatchId: number;
  private nextOtpId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.transactions = new Map();
    this.pickupRequests = new Map();
    this.recyclingBatches = new Map();
    this.otps = new Map();
    this.nextUserId = 1;
    this.nextProductId = 1;
    this.nextTransactionId = 1;
    this.nextPickupId = 1;
    this.nextBatchId = 1;
    this.nextOtpId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByAdminId(adminId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.adminId === adminId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      email: null,
      password: null,
      adminId: null,
      companyName: null,
      registrationNumber: null,
      verified: null,
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getAllCompanies(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === 'company');
  }

  // OTP operations
  async createOtp(insertOtp: InsertOtp): Promise<Otp> {
    const id = this.nextOtpId++;
    const otp: Otp = {
      ...insertOtp,
      id,
      createdAt: new Date()
    };
    this.otps.set(id, otp);
    return otp;
  }

  async getValidOtp(email: string, code: string): Promise<Otp | undefined> {
    const now = new Date();
    return Array.from(this.otps.values()).find(
      otp => otp.email === email && otp.code === code && otp.expiresAt > now
    );
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.productCode === code);
  }

  async getProductsByCompany(companyId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.companyId === companyId);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const product: Product = {
      size: null,
      batchNo: null,
      ...insertProduct,
      id,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async bulkCreateProducts(insertProducts: InsertProduct[]): Promise<Product[]> {
    const products: Product[] = [];
    for (const insertProduct of insertProducts) {
      const product = await this.createProduct(insertProduct);
      products.push(product);
    }
    return products;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByProduct(productId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.productId === productId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextTransactionId++;
    const transaction: Transaction = {
      previousTxId: null,
      location: null,
      ...insertTransaction,
      id,
      timestamp: insertTransaction.timestamp || new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getLatestTransaction(productId: number): Promise<Transaction | undefined> {
    const transactions = await this.getTransactionsByProduct(productId);
    return transactions[transactions.length - 1];
  }

  // Pickup Request operations
  async getPickupRequest(id: number): Promise<PickupRequest | undefined> {
    return this.pickupRequests.get(id);
  }

  async getPickupRequestsByCustomer(customerId: number): Promise<PickupRequest[]> {
    return Array.from(this.pickupRequests.values()).filter(r => r.customerId === customerId);
  }

  async getAllPickupRequests(): Promise<PickupRequest[]> {
    return Array.from(this.pickupRequests.values());
  }

  async createPickupRequest(insertRequest: InsertPickupRequest): Promise<PickupRequest> {
    const id = this.nextPickupId++;
    const request: PickupRequest = {
      status: "Pending",
      preferredDate: null,
      assignedAgentId: null,
      completedAt: null,
      ...insertRequest,
      id,
      createdAt: new Date()
    };
    this.pickupRequests.set(id, request);
    return request;
  }

  async updatePickupRequest(id: number, updates: Partial<PickupRequest>): Promise<PickupRequest | undefined> {
    const request = this.pickupRequests.get(id);
    if (!request) return undefined;
    const updated = { ...request, ...updates };
    this.pickupRequests.set(id, updated);
    return updated;
  }

  // Recycling Batch operations
  async getRecyclingBatch(id: number): Promise<RecyclingBatch | undefined> {
    return this.recyclingBatches.get(id);
  }

  async getAllRecyclingBatches(): Promise<RecyclingBatch[]> {
    return Array.from(this.recyclingBatches.values());
  }

  async createRecyclingBatch(insertBatch: InsertRecyclingBatch): Promise<RecyclingBatch> {
    const id = this.nextBatchId++;
    const batch: RecyclingBatch = {
      weight: null,
      sentAt: null,
      ...insertBatch,
      id,
      createdAt: new Date()
    };
    this.recyclingBatches.set(id, batch);
    return batch;
  }
}

export const storage = new MemStorage();
