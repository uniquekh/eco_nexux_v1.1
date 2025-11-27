import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  try {
    // Create a test admin user
    const adminPassword = await hashPassword("admin123");
    const admin = await storage.createUser({
      email: "admin@circularchain.com",
      password: adminPassword,
      role: "admin",
      name: "Admin User",
      adminId: "admin_001",
    });
    console.log("✓ Created admin user:", { adminId: admin.adminId, password: "admin123" });

    // Create a test company (verified)
    const companyPassword = await hashPassword("company123");
    const company = await storage.createUser({
      email: "company@example.com",
      password: companyPassword,
      role: "company",
      name: "John Smith",
      companyName: "GreenEco Products Ltd",
      registrationNumber: "REG-2024-001",
      verified: true,
    });
    console.log("✓ Created verified company:", { email: company.email, password: "company123" });

    // Create an unverified company for testing admin verification
    const unverifiedPassword = await hashPassword("test123");
    const unverifiedCompany = await storage.createUser({
      email: "pending@example.com",
      password: unverifiedPassword,
      role: "company",
      name: "Jane Doe",
      companyName: "Sustainable Goods Inc",
      registrationNumber: "REG-2024-002",
      verified: false,
    });
    console.log("✓ Created unverified company:", { email: unverifiedCompany.email, password: "test123" });

    console.log("\n✓ Database seeded successfully!");
    console.log("\nTest Credentials:");
    console.log("─────────────────────────────────");
    console.log("Admin:");
    console.log("  Admin ID: admin_001");
    console.log("  Password: admin123");
    console.log("\nCompany (Verified):");
    console.log("  Email: company@example.com");
    console.log("  Password: company123");
    console.log("\nCompany (Pending):");
    console.log("  Email: pending@example.com");
    console.log("  Password: test123");
    console.log("\nCustomer:");
    console.log("  Use any email to receive OTP");
    console.log("─────────────────────────────────\n");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
