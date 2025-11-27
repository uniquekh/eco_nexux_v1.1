import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  hashPassword, 
  comparePassword, 
  createOTP, 
  verifyOTP,
  generateTransactionHash,
  generateProductCode,
  generateTransactionId,
  generatePickupRequestId,
  generateBatchId
} from "./auth";
import { requireAuth, requireCompany, requireCustomer, requireAdmin } from "./middleware";
import multer from "multer";
import Papa from "papaparse";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Gemini AI with hardcoded API key
const genAI = new GoogleGenerativeAI("AIzaSyCObiw1MJMvLh8OfPeYHyFa8AjNLIw-_CQ");

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============ Authentication Routes ============
  
  // Customer registration
  app.post("/api/auth/customer/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        role: "customer",
        name,
      });

      res.json({
        message: "Registration successful. Please login.",
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error) {
      console.error("Customer registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Customer login with password
  app.post("/api/auth/customer/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "customer") {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({ 
        message: "Login successful",
        user: { id: user.id, email: user.email, role: user.role, name: user.name }
      });
    } catch (error) {
      console.error("Customer login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Company login
  app.post("/api/auth/company/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "company") {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.verified) {
        return res.status(403).json({ error: "Account not verified. Please wait for admin approval." });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        message: "Login successful",
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          name: user.name,
          companyName: user.companyName,
          verified: user.verified
        }
      });
    } catch (error) {
      console.error("Company login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Company registration
  app.post("/api/auth/company/register", async (req, res) => {
    try {
      const { email, password, companyName, registrationNumber, name } = req.body;
      
      if (!email || !password || !companyName || !registrationNumber || !name) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        role: "company",
        name,
        companyName,
        registrationNumber,
        verified: false, // Requires admin approval
      });

      res.json({
        message: "Registration successful. Please wait for admin verification.",
        user: { id: user.id, email: user.email, companyName: user.companyName }
      });
    } catch (error) {
      console.error("Company registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Admin login
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { adminId, password } = req.body;
      if (!adminId || !password) {
        return res.status(400).json({ error: "Admin ID and password are required" });
      }

      const user = await storage.getUserByAdminId(adminId);
      if (!user || user.role !== "admin") {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        message: "Login successful",
        user: { id: user.id, adminId: user.adminId, role: user.role, name: user.name }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current session
  app.get("/api/auth/session", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        adminId: user.adminId,
        companyName: user.companyName,
        verified: user.verified,
      }
    });
  });

  // ============ Product Routes ============
  
  // Get all products
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const userRole = req.session.userRole;
      const userId = req.session.userId;

      let products;
      if (userRole === "company") {
        products = await storage.getProductsByCompany(userId!);
      } else {
        products = await storage.getAllProducts();
      }

      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product by code
  app.get("/api/products/code/:code", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProductByCode(req.params.code);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create product
  app.post("/api/products", requireCompany, async (req, res) => {
    try {
      const { name, category, material, size, batchNo, manufactureDate } = req.body;
      
      if (!name || !category || !material || !manufactureDate) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const productCode = generateProductCode();
      const product = await storage.createProduct({
        productCode,
        name,
        category,
        material,
        size,
        batchNo,
        companyId: req.session.userId!,
        currentStatus: "Manufactured",
        manufactureDate: new Date(manufactureDate),
      });

      // Create initial transaction
      const txId = generateTransactionId(product.id, 1);
      const hash = generateTransactionHash(
        txId,
        null,
        product.id,
        "Manufactured",
        req.session.userId!,
        new Date()
      );

      await storage.createTransaction({
        txId,
        productId: product.id,
        previousTxId: null,
        status: "Manufactured",
        actorRole: "company",
        actorId: req.session.userId!,
        hash,
        timestamp: new Date(),
      });

      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Bulk create products
  app.post("/api/products/bulk", requireCompany, async (req, res) => {
    try {
      const { products: productData } = req.body;
      
      if (!Array.isArray(productData) || productData.length === 0) {
        return res.status(400).json({ error: "Invalid product data" });
      }

      const products = [];
      for (const data of productData) {
        const productCode = generateProductCode();
        const product = await storage.createProduct({
          productCode,
          name: data.name,
          category: data.category,
          material: data.material,
          size: data.size,
          batchNo: data.batchNo,
          companyId: req.session.userId!,
          currentStatus: "Manufactured",
          manufactureDate: new Date(data.manufactureDate || new Date()),
        });

        // Create initial transaction
        const txId = generateTransactionId(product.id, 1);
        const hash = generateTransactionHash(
          txId,
          null,
          product.id,
          "Manufactured",
          req.session.userId!,
          new Date()
        );

        await storage.createTransaction({
          txId,
          productId: product.id,
          previousTxId: null,
          status: "Manufactured",
          actorRole: "company",
          actorId: req.session.userId!,
          hash,
          timestamp: new Date(),
        });

        products.push(product);
      }

      res.json({ 
        message: `Successfully created ${products.length} products`,
        products 
      });
    } catch (error) {
      console.error("Bulk create error:", error);
      res.status(500).json({ error: "Failed to create products" });
    }
  });

  // ============ Transaction Routes ============
  
  // Get product transaction history
  app.get("/api/products/:id/transactions", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const transactions = await storage.getTransactionsByProduct(productId);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Add transaction to product (customer returns product, admin collects, etc.)
  app.post("/api/products/:id/transactions", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { status, location } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Get previous transaction
      const previousTx = await storage.getLatestTransaction(productId);
      const previousTxId = previousTx?.txId || null;

      // Calculate next sequence number
      const allTxs = await storage.getTransactionsByProduct(productId);
      const sequence = allTxs.length + 1;

      const txId = generateTransactionId(productId, sequence);
      const timestamp = new Date();
      const hash = generateTransactionHash(
        txId,
        previousTxId,
        productId,
        status,
        req.session.userId!,
        timestamp
      );

      const transaction = await storage.createTransaction({
        txId,
        productId,
        previousTxId,
        status,
        actorRole: req.session.userRole!,
        actorId: req.session.userId!,
        location,
        hash,
        timestamp,
      });

      // Update product status
      await storage.updateProduct(productId, { currentStatus: status });

      res.json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // ============ Pickup Request Routes ============
  
  // Get all pickup requests
  app.get("/api/pickups", requireAuth, async (req, res) => {
    try {
      const userRole = req.session.userRole;
      const userId = req.session.userId;

      let pickups;
      if (userRole === "customer") {
        pickups = await storage.getPickupRequestsByCustomer(userId!);
      } else {
        pickups = await storage.getAllPickupRequests();
      }

      // Enrich with customer info
      const enrichedPickups = await Promise.all(
        pickups.map(async (pickup) => {
          const customer = await storage.getUser(pickup.customerId);
          let assignedAgent = null;
          if (pickup.assignedAgentId) {
            assignedAgent = await storage.getUser(pickup.assignedAgentId);
          }
          return {
            ...pickup,
            customerName: customer?.name || "Unknown",
            customerEmail: customer?.email || "",
            assignedAgentName: assignedAgent?.name || null,
          };
        })
      );

      res.json(enrichedPickups);
    } catch (error) {
      console.error("Get pickups error:", error);
      res.status(500).json({ error: "Failed to fetch pickup requests" });
    }
  });

  // Create pickup request
  app.post("/api/pickups", requireCustomer, async (req, res) => {
    try {
      const { productIds, location, preferredDate } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0 || !location) {
        return res.status(400).json({ error: "Product IDs and location are required" });
      }

      const requestId = generatePickupRequestId();
      const pickup = await storage.createPickupRequest({
        requestId,
        customerId: req.session.userId!,
        productIds,
        location,
        preferredDate,
        status: "Pending",
      });

      res.json(pickup);
    } catch (error) {
      console.error("Create pickup error:", error);
      res.status(500).json({ error: "Failed to create pickup request" });
    }
  });

  // Assign pickup to admin agent
  app.patch("/api/pickups/:id/assign", requireAdmin, async (req, res) => {
    try {
      const pickupId = parseInt(req.params.id);
      const pickup = await storage.updatePickupRequest(pickupId, {
        status: "Assigned",
        assignedAgentId: req.session.userId!,
      });

      if (!pickup) {
        return res.status(404).json({ error: "Pickup request not found" });
      }

      res.json(pickup);
    } catch (error) {
      console.error("Assign pickup error:", error);
      res.status(500).json({ error: "Failed to assign pickup" });
    }
  });

  // Complete pickup
  app.patch("/api/pickups/:id/complete", requireAdmin, async (req, res) => {
    try {
      const pickupId = parseInt(req.params.id);
      const pickupRequest = await storage.getPickupRequest(pickupId);

      if (!pickupRequest) {
        return res.status(404).json({ error: "Pickup request not found" });
      }

      // Update pickup status
      const pickup = await storage.updatePickupRequest(pickupId, {
        status: "Completed",
        completedAt: new Date(),
      });

      // Update product statuses and create transactions
      for (const productId of pickupRequest.productIds) {
        const product = await storage.getProduct(parseInt(productId));
        if (!product) continue;

        // Get previous transaction
        const previousTx = await storage.getLatestTransaction(product.id);
        const previousTxId = previousTx?.txId || null;

        // Calculate next sequence number
        const allTxs = await storage.getTransactionsByProduct(product.id);
        const sequence = allTxs.length + 1;

        const txId = generateTransactionId(product.id, sequence);
        const timestamp = new Date();
        const hash = generateTransactionHash(
          txId,
          previousTxId,
          product.id,
          "Collected",
          req.session.userId!,
          timestamp
        );

        await storage.createTransaction({
          txId,
          productId: product.id,
          previousTxId,
          status: "Collected",
          actorRole: "admin",
          actorId: req.session.userId!,
          location: pickupRequest.location,
          hash,
          timestamp,
        });

        await storage.updateProduct(product.id, { currentStatus: "Collected" });
      }

      res.json(pickup);
    } catch (error) {
      console.error("Complete pickup error:", error);
      res.status(500).json({ error: "Failed to complete pickup" });
    }
  });

  // ============ Admin Routes ============
  
  // Get all companies (for verification)
  app.get("/api/admin/companies", requireAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Verify/approve company
  app.patch("/api/admin/companies/:id/verify", requireAdmin, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const { verified } = req.body;

      const company = await storage.updateUser(companyId, { verified });
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Verify company error:", error);
      res.status(500).json({ error: "Failed to verify company" });
    }
  });

  // Create recycling batch
  app.post("/api/admin/batches", requireAdmin, async (req, res) => {
    try {
      const { productIds, material, weight } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0 || !material) {
        return res.status(400).json({ error: "Product IDs and material are required" });
      }

      const batchId = generateBatchId();
      const batch = await storage.createRecyclingBatch({
        batchId,
        productIds,
        material,
        weight,
        createdById: req.session.userId!,
        sentAt: new Date(),
      });

      // Update product statuses
      for (const productId of productIds) {
        const product = await storage.getProduct(parseInt(productId));
        if (!product) continue;

        // Get previous transaction
        const previousTx = await storage.getLatestTransaction(product.id);
        const previousTxId = previousTx?.txId || null;

        // Calculate next sequence number
        const allTxs = await storage.getTransactionsByProduct(product.id);
        const sequence = allTxs.length + 1;

        const txId = generateTransactionId(product.id, sequence);
        const timestamp = new Date();
        const hash = generateTransactionHash(
          txId,
          previousTxId,
          product.id,
          "Sent to Recycling",
          req.session.userId!,
          timestamp
        );

        await storage.createTransaction({
          txId,
          productId: product.id,
          previousTxId,
          status: "Sent to Recycling",
          actorRole: "admin",
          actorId: req.session.userId!,
          hash,
          timestamp,
        });

        await storage.updateProduct(product.id, { currentStatus: "Sent to Recycling" });
      }

      res.json(batch);
    } catch (error) {
      console.error("Create batch error:", error);
      res.status(500).json({ error: "Failed to create batch" });
    }
  });

  // Get all batches
  app.get("/api/admin/batches", requireAdmin, async (req, res) => {
    try {
      const batches = await storage.getAllRecyclingBatches();
      res.json(batches);
    } catch (error) {
      console.error("Get batches error:", error);
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  });

  // ============ Bulk Import Routes ============
  
  // Bulk import products from CSV with Gemini AI categorization
  app.post("/api/products/bulk-import", requireCompany, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString("utf-8");
      
      // Parse CSV
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (parseResult.errors.length > 0) {
        return res.status(400).json({ 
          error: "CSV parsing error", 
          details: parseResult.errors 
        });
      }

      const rows = parseResult.data as any[];
      if (rows.length === 0) {
        return res.status(400).json({ error: "CSV file is empty" });
      }

      const products = [];
      const errors = [];

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        try {
          // Use Gemini AI to categorize and validate product
          let category = row.category || "";
          let material = row.material || "";
          
          // If category or material is missing, use Gemini to infer
          if (!category || !material) {
            try {
              const model = genAI.getGenerativeModel({ model: "gemini-pro" });
              const prompt = `Given a product with name "${row.name || row.product_name}", 
                ${row.category ? `category "${row.category}"` : ""}, 
                ${row.material ? `material "${row.material}"` : ""},
                please provide:
                1. A suitable product category (e.g., Electronics, Clothing, Furniture, etc.)
                2. The primary material (e.g., Plastic, Metal, Glass, Fabric, etc.)
                
                Respond in JSON format: {"category": "...", "material": "..."}`;
              
              const result = await model.generateContent(prompt);
              const response = await result.response;
              const text = response.text();
              
              // Extract JSON from response
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const aiData = JSON.parse(jsonMatch[0]);
                category = category || aiData.category;
                material = material || aiData.material;
              }
            } catch (aiError) {
              console.error("Gemini AI error:", aiError);
              // Fallback to defaults if AI fails
              category = category || "General";
              material = material || "Mixed";
            }
          }

          const productCode = generateProductCode();
          const product = await storage.createProduct({
            productCode,
            name: row.name || row.product_name,
            category,
            material,
            size: row.size || "",
            batchNo: row.batchNo || row.batch_no || "",
            companyId: req.session.userId!,
            currentStatus: "Manufactured",
            manufactureDate: new Date(row.manufactureDate || row.manufacture_date || new Date()),
          });

          // Create initial transaction
          const txId = generateTransactionId(product.id, 1);
          const hash = generateTransactionHash(
            txId,
            null,
            product.id,
            "Manufactured",
            req.session.userId!,
            new Date()
          );

          await storage.createTransaction({
            txId,
            productId: product.id,
            previousTxId: null,
            status: "Manufactured",
            actorRole: "company",
            actorId: req.session.userId!,
            hash,
            timestamp: new Date(),
          });

          products.push(product);
        } catch (error: any) {
          errors.push({
            row: i + 1,
            data: row,
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${products.length} products`,
        totalRows: rows.length,
        successCount: products.length,
        errorCount: errors.length,
        products,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Bulk import error:", error);
      res.status(500).json({ error: "Failed to import products" });
    }
  });

  // Download CSV template
  app.get("/api/products/csv-template", requireCompany, (req, res) => {
    const csv = `name,category,material,size,batchNo,manufactureDate
Laptop Computer,Electronics,Metal,15 inch,BATCH001,2024-01-15
Office Chair,Furniture,Plastic,Standard,BATCH002,2024-01-20
Water Bottle,Household,Plastic,500ml,BATCH003,2024-02-01`;
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=product-template.csv");
    res.send(csv);
  });

  // ============ Stats Routes ============
  
  // Get dashboard stats
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userRole = req.session.userRole;
      const userId = req.session.userId;

      const stats: any = {};

      if (userRole === "company") {
        const products = await storage.getProductsByCompany(userId!);
        stats.totalProducts = products.length;
        stats.activeProducts = products.filter(p => 
          !["Collected", "Sent to Recycling", "Recycled"].includes(p.currentStatus)
        ).length;
        stats.collected = products.filter(p => 
          ["Collected", "Sent to Recycling", "Recycled"].includes(p.currentStatus)
        ).length;
      } else if (userRole === "customer") {
        const pickups = await storage.getPickupRequestsByCustomer(userId!);
        const allTransactions = await storage.getAllProducts();
        const customerTransactions = [];
        
        for (const product of allTransactions) {
          const txs = await storage.getTransactionsByProduct(product.id);
          customerTransactions.push(...txs.filter(tx => tx.actorId === userId));
        }

        stats.registeredProducts = customerTransactions.filter(tx => 
          tx.status === "Returned"
        ).length;
        stats.collected = customerTransactions.filter(tx => 
          tx.status === "Collected"
        ).length;
        stats.pendingPickup = pickups.filter(p => p.status === "Pending").length;
        stats.totalRewards = customerTransactions.filter(tx => 
          ["Collected", "Sent to Recycling", "Recycled"].includes(tx.status)
        ).length * 15; // $15 per collected item
      } else if (userRole === "admin") {
        const companies = await storage.getAllCompanies();
        const pickups = await storage.getAllPickupRequests();
        const products = await storage.getAllProducts();
        const batches = await storage.getAllRecyclingBatches();

        stats.pendingVerifications = companies.filter(c => !c.verified).length;
        stats.activePickups = pickups.filter(p => p.status !== "Completed").length;
        stats.inventoryCount = products.filter(p => p.currentStatus === "Collected").length;
        stats.batchesSent = batches.length;
      }

      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
