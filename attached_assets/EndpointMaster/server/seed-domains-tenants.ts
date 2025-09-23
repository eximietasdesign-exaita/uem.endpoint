import { db } from "./db";
import { domains, tenants } from "@shared/schema";

export async function seedDomainsAndTenants() {
  console.log("🌱 Seeding domains and tenants...");

  try {
    // Clear existing data
    await db.delete(tenants);
    await db.delete(domains);

    // Seed domains
    const sampleDomains = [
      {
        name: "global-enterprise",
        displayName: "Global Enterprise",
        description: "Root domain for enterprise-wide operations",
        parentDomainId: null,
        type: "root",
        status: "active",
        settings: {
          allowSubdomains: true,
          maxTenants: 100,
          customBranding: true,
          dataRetentionDays: 2555,
          features: ["multi-tenant", "advanced-analytics", "api-access", "custom-integrations"],
        },
        branding: {
          primaryColor: "#0ea5e9",
          secondaryColor: "#64748b",
          logo: "",
          favicon: "",
          companyName: "Enterprise Corp",
        },
      },
      {
        name: "north-america",
        displayName: "North America Division",
        description: "Regional domain for North American operations",
        parentDomainId: null, // Will be updated after global-enterprise is created
        type: "standard",
        status: "active",
        settings: {
          allowSubdomains: true,
          maxTenants: 50,
          customBranding: false,
          dataRetentionDays: 1825,
          features: ["multi-tenant", "basic-analytics"],
        },
        branding: {
          primaryColor: "#10b981",
          secondaryColor: "#6b7280",
          logo: "",
          favicon: "",
          companyName: "Enterprise NA",
        },
      },
      {
        name: "europe-division",
        displayName: "Europe Division",
        description: "Regional domain for European operations with GDPR compliance",
        parentDomainId: null,
        type: "standard",
        status: "active",
        settings: {
          allowSubdomains: true,
          maxTenants: 30,
          customBranding: false,
          dataRetentionDays: 1095,
          features: ["multi-tenant", "gdpr-compliance", "basic-analytics"],
        },
        branding: {
          primaryColor: "#8b5cf6",
          secondaryColor: "#6b7280",
          logo: "",
          favicon: "",
          companyName: "Enterprise EU",
        },
      },
      {
        name: "development-sandbox",
        displayName: "Development Sandbox",
        description: "Isolated development and testing environment",
        parentDomainId: null,
        type: "subdomain",
        status: "active",
        settings: {
          allowSubdomains: false,
          maxTenants: 5,
          customBranding: false,
          dataRetentionDays: 90,
          features: ["testing-environment"],
        },
        branding: {
          primaryColor: "#f59e0b",
          secondaryColor: "#6b7280",
          logo: "",
          favicon: "",
          companyName: "Dev Environment",
        },
      },
    ];

    const createdDomains = await db.insert(domains).values(sampleDomains).returning();
    console.log(`✅ Created ${createdDomains.length} domains`);

    // Get the global enterprise domain ID for parent references
    const globalDomain = createdDomains.find(d => d.name === "global-enterprise");
    const northAmericaDomain = createdDomains.find(d => d.name === "north-america");
    const europeDomain = createdDomains.find(d => d.name === "europe-division");
    const devDomain = createdDomains.find(d => d.name === "development-sandbox");

    // Seed tenants
    const sampleTenants = [
      // Global Enterprise Tenants
      {
        name: "headquarters",
        displayName: "Corporate Headquarters",
        description: "Primary tenant for corporate headquarters operations",
        domainId: globalDomain!.id,
        type: "enterprise",
        status: "active",
        settings: {
          maxUsers: 500,
          maxEndpoints: 10000,
          dataIsolation: "strict" as const,
          allowGlobalPublishing: true,
          features: ["advanced-analytics", "custom-reporting", "api-access"],
        },
        quotas: {
          usedStorage: 5120,
          maxStorage: 51200,
          usedBandwidth: 25,
          maxBandwidth: 500,
          usedQuota: 750,
          maxQuota: 10000,
        },
      },
      {
        name: "it-operations",
        displayName: "IT Operations",
        description: "Dedicated tenant for IT infrastructure management",
        domainId: globalDomain!.id,
        type: "premium",
        status: "active",
        settings: {
          maxUsers: 100,
          maxEndpoints: 5000,
          dataIsolation: "strict" as const,
          allowGlobalPublishing: true,
          features: ["infrastructure-monitoring", "automated-discovery"],
        },
        quotas: {
          usedStorage: 2048,
          maxStorage: 20480,
          usedBandwidth: 15,
          maxBandwidth: 200,
          usedQuota: 450,
          maxQuota: 5000,
        },
      },
      // North America Tenants
      {
        name: "na-sales",
        displayName: "North America Sales",
        description: "Sales department tenant for North American region",
        domainId: northAmericaDomain!.id,
        type: "standard",
        status: "active",
        settings: {
          maxUsers: 75,
          maxEndpoints: 1500,
          dataIsolation: "shared" as const,
          allowGlobalPublishing: false,
          features: ["basic-analytics", "user-management"],
        },
        quotas: {
          usedStorage: 1024,
          maxStorage: 10240,
          usedBandwidth: 8,
          maxBandwidth: 100,
          usedQuota: 200,
          maxQuota: 1500,
        },
      },
      {
        name: "na-support",
        displayName: "North America Support",
        description: "Customer support operations for North American region",
        domainId: northAmericaDomain!.id,
        type: "standard",
        status: "active",
        settings: {
          maxUsers: 50,
          maxEndpoints: 1000,
          dataIsolation: "shared" as const,
          allowGlobalPublishing: false,
          features: ["ticket-management", "basic-analytics"],
        },
        quotas: {
          usedStorage: 512,
          maxStorage: 5120,
          usedBandwidth: 5,
          maxBandwidth: 50,
          usedQuota: 150,
          maxQuota: 1000,
        },
      },
      // Europe Tenants
      {
        name: "eu-finance",
        displayName: "Europe Finance",
        description: "Financial operations tenant with GDPR compliance",
        domainId: europeDomain!.id,
        type: "premium",
        status: "active",
        settings: {
          maxUsers: 40,
          maxEndpoints: 800,
          dataIsolation: "strict" as const,
          allowGlobalPublishing: false,
          features: ["gdpr-compliance", "financial-reporting", "encryption"],
        },
        quotas: {
          usedStorage: 3072,
          maxStorage: 15360,
          usedBandwidth: 12,
          maxBandwidth: 150,
          usedQuota: 300,
          maxQuota: 2000,
        },
      },
      {
        name: "eu-hr",
        displayName: "Europe Human Resources",
        description: "HR department with strict data privacy requirements",
        domainId: europeDomain!.id,
        type: "standard",
        status: "active",
        settings: {
          maxUsers: 25,
          maxEndpoints: 500,
          dataIsolation: "strict" as const,
          allowGlobalPublishing: false,
          features: ["gdpr-compliance", "hr-management"],
        },
        quotas: {
          usedStorage: 256,
          maxStorage: 2560,
          usedBandwidth: 3,
          maxBandwidth: 30,
          usedQuota: 75,
          maxQuota: 500,
        },
      },
      // Development Tenants
      {
        name: "dev-testing",
        displayName: "Development Testing",
        description: "Primary development testing environment",
        domainId: devDomain!.id,
        type: "standard",
        status: "active",
        settings: {
          maxUsers: 15,
          maxEndpoints: 200,
          dataIsolation: "shared" as const,
          allowGlobalPublishing: false,
          features: ["testing-tools", "dev-api-access"],
        },
        quotas: {
          usedStorage: 128,
          maxStorage: 1024,
          usedBandwidth: 2,
          maxBandwidth: 20,
          usedQuota: 50,
          maxQuota: 200,
        },
      },
      {
        name: "qa-staging",
        displayName: "QA Staging",
        description: "Quality assurance and staging environment",
        domainId: devDomain!.id,
        type: "standard",
        status: "inactive",
        settings: {
          maxUsers: 10,
          maxEndpoints: 100,
          dataIsolation: "shared" as const,
          allowGlobalPublishing: false,
          features: ["qa-tools"],
        },
        quotas: {
          usedStorage: 64,
          maxStorage: 512,
          usedBandwidth: 1,
          maxBandwidth: 10,
          usedQuota: 25,
          maxQuota: 100,
        },
      },
    ];

    const createdTenants = await db.insert(tenants).values(sampleTenants).returning();
    console.log(`✅ Created ${createdTenants.length} tenants`);

    console.log("🎉 Successfully seeded domains and tenants!");
    return {
      domains: createdDomains,
      tenants: createdTenants,
    };
  } catch (error) {
    console.error("❌ Error seeding domains and tenants:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDomainsAndTenants()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}