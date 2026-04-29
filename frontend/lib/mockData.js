export const SUPER_ADMIN_CREDENTIALS = {
  email: "ankitapatil00001@gmail.com",
  password: "Ankita@12345",
};

export const mockSuperAdminProfile = {
  fullName: "Ankita Patil",
  email: SUPER_ADMIN_CREDENTIALS.email,
  role: "SUPER_ADMIN",
  mobileNumber: "9999999999",
  city: "Pune",
  address: "MyReport HQ",
  avatarUrl: "https://ui-avatars.com/api/?background=111827&color=fff&name=Ankita+Patil",
};

export const mockAdminProfile = {
  fullName: "Neha Sharma",
  email: "admin@myreport.com",
  role: "ADMIN",
  mobileNumber: "9876543210",
  city: "Mumbai",
  address: "Bandra West, Mumbai",
  storeName: "GlowMart",
  avatarUrl: "https://ui-avatars.com/api/?background=2563EB&color=fff&name=Neha+Sharma",
};

export const mockSuperAdminData = {
  dashboard: {
    metrics: [
      { label: "Total Admins", value: "36", helper: "28 active", accent: "cyan" },
      { label: "Total Stores", value: "31", helper: "27 live", accent: "emerald" },
      { label: "Total Revenue", value: "Rs. 14.8L", helper: "Across platform", accent: "amber" },
      { label: "Active Plans", value: "3", helper: "Catalog published", accent: "violet" },
    ],
    revenueSeries: [
      { label: "Nov", value: 120000 },
      { label: "Dec", value: 165000 },
      { label: "Jan", value: 186000 },
      { label: "Feb", value: 228000 },
      { label: "Mar", value: 252000 },
      { label: "Apr", value: 312000 },
    ],
    growthSeries: [
      { label: "Nov", admins: 3, stores: 2 },
      { label: "Dec", admins: 5, stores: 4 },
      { label: "Jan", admins: 4, stores: 3 },
      { label: "Feb", admins: 8, stores: 5 },
      { label: "Mar", admins: 6, stores: 7 },
      { label: "Apr", admins: 10, stores: 9 },
    ],
    recentActivities: [
      { title: "Arjun Mehta onboarded", subtitle: "Urban Basket joined the platform", timestamp: "2026-04-27T12:00:00Z" },
      { title: "Craft Avenue plan renewal", subtitle: "Renews on 2026-05-11", timestamp: "2026-04-25T10:00:00Z" },
      { title: "GlowMart crossed Rs. 1L sales", subtitle: "Growth plan recommended", timestamp: "2026-04-24T10:00:00Z" },
    ],
    expiringPlans: [
      { storeName: "GlowMart", plan: "Starter", owner: "Neha Sharma", planExpiresAt: "2026-05-17" },
      { storeName: "Craft Avenue", plan: "Growth", owner: "Riya Kapoor", planExpiresAt: "2026-06-08" },
    ],
    notifications: [
      { title: "Signup approval", message: "Arjun Mehta is waiting for review.", type: "SIGNUP_APPROVAL", createdAt: "2026-04-28T09:00:00Z" },
      { title: "Payment success", message: "Enterprise renewal captured successfully.", type: "PAYMENT_SUCCESS", createdAt: "2026-04-27T11:00:00Z" },
    ],
  },
  admins: {
    items: [
      { id: 1, fullName: "Neha Sharma", email: "admin@myreport.com", mobileNumber: "9876543210", status: "ACTIVE", emailVerified: true, storeName: "GlowMart", city: "Mumbai", plan: "Starter", planExpiresAt: "2026-05-17", createdAt: "2026-03-18T11:00:00Z" },
      { id: 2, fullName: "Riya Kapoor", email: "riya@myreport.com", mobileNumber: "9001100220", status: "ACTIVE", emailVerified: true, storeName: "Craft Avenue", city: "Bengaluru", plan: "Growth", planExpiresAt: "2026-06-08", createdAt: "2026-03-27T11:00:00Z" },
      { id: 3, fullName: "Arjun Mehta", email: "pending@myreport.com", mobileNumber: "9123456780", status: "PENDING_APPROVAL", emailVerified: true, storeName: "Urban Basket", city: "Ahmedabad", plan: "Starter", planExpiresAt: "2026-05-29", createdAt: "2026-04-27T11:00:00Z" },
    ],
  },
  stores: {
    items: [
      { id: 1, name: "GlowMart", city: "Mumbai", status: "ACTIVE", plan: "Starter", planExpiresAt: "2026-05-17", owner: "Neha Sharma" },
      { id: 2, name: "Craft Avenue", city: "Bengaluru", status: "ACTIVE", plan: "Growth", planExpiresAt: "2026-06-08", owner: "Riya Kapoor" },
      { id: 3, name: "Urban Basket", city: "Ahmedabad", status: "PENDING", plan: "Starter", planExpiresAt: "2026-05-29", owner: "Arjun Mehta" },
    ],
  },
  plans: {
    items: [
      { id: 1, name: "Starter", description: "POS, invoices, and weekly reports.", monthlyPrice: 1499, yearlyPrice: 14999, maxProducts: 250, maxCustomers: 1000, features: "POS Billing, GST invoices, Weekly reports, Email support", status: "ACTIVE" },
      { id: 2, name: "Growth", description: "Automation and deep analytics.", monthlyPrice: 3499, yearlyPrice: 34999, maxProducts: 2000, maxCustomers: 10000, features: "Animated dashboards, Teams, Multi-export, Priority support", status: "ACTIVE" },
      { id: 3, name: "Enterprise", description: "Custom workflows and SLAs.", monthlyPrice: 6999, yearlyPrice: 69999, maxProducts: 10000, maxCustomers: 50000, features: "Dedicated success, Custom roles, API access, SLA support", status: "ACTIVE" },
    ],
  },
  invoices: {
    items: [
      { id: 1, invoiceNumber: "INV-20260429-01", customerName: "Aarav Desai", totalAmount: 15400, status: "PAID", store: "GlowMart", createdAt: "2026-04-29T08:00:00Z" },
      { id: 2, invoiceNumber: "INV-20260425-02", customerName: "Retail Walk-in", totalAmount: 9200, status: "PAID", store: "Craft Avenue", createdAt: "2026-04-25T08:00:00Z" },
    ],
  },
  reports: {
    summary: {
      revenue: 1480000,
      stores: 31,
      admins: 36,
    },
    monthly: [
      { label: "Nov", value: 120000 },
      { label: "Dec", value: 165000 },
      { label: "Jan", value: 186000 },
      { label: "Feb", value: 228000 },
      { label: "Mar", value: 252000 },
      { label: "Apr", value: 312000 },
    ],
    planMix: [
      { name: "Starter", stores: 16, status: "ACTIVE" },
      { name: "Growth", stores: 11, status: "ACTIVE" },
      { name: "Enterprise", stores: 4, status: "ACTIVE" },
    ],
  },
};

export const mockAdminData = {
  dashboard: {
    metrics: [
      { label: "Today's Sales", value: "Rs. 15,400", helper: "Cashflow today", accent: "cyan" },
      { label: "Monthly Sales", value: "Rs. 2.4L", helper: "April performance", accent: "emerald" },
      { label: "Products", value: "48", helper: "Catalog live", accent: "violet" },
      { label: "Low Stock", value: "5", helper: "Requires action", accent: "amber" },
    ],
    revenueSeries: [
      { label: "Nov", value: 42000 },
      { label: "Dec", value: 51000 },
      { label: "Jan", value: 58000 },
      { label: "Feb", value: 64000 },
      { label: "Mar", value: 82000 },
      { label: "Apr", value: 111000 },
    ],
    topSales: [
      { name: "Arabica Beans", value: 72, unit: "KG" },
      { name: "Cold Brew Bottles", value: 58, unit: "PIECE" },
      { name: "Dessert Boxes", value: 44, unit: "BOX" },
      { name: "Signature Syrup", value: 31, unit: "LITRE" },
    ],
    notifications: [
      { id: 1, title: "Low stock alert", message: "Arabica Beans is below threshold.", type: "LOW_STOCK", createdAt: "2026-04-29T08:00:00Z" },
      { id: 2, title: "Plan expiry", message: "Starter plan renews in 18 days.", type: "PLAN_EXPIRY", createdAt: "2026-04-27T09:00:00Z" },
    ],
    store: {
      name: "GlowMart",
      city: "Mumbai",
      plan: "Starter",
      planExpiresAt: "2026-05-17",
    },
    highlights: ["Customer base: 126", "Active invoices: 64", "Available products: 48"],
  },
  customers: {
    items: [
      { id: 1, fullName: "Aarav Desai", email: "aarav@example.com", mobileNumber: "9011111111", city: "Mumbai", blocked: false, totalSpent: 32400, purchaseCount: 12, createdAt: "2026-04-14T08:00:00Z" },
      { id: 2, fullName: "Meera Nair", email: "meera@example.com", mobileNumber: "9022222222", city: "Mumbai", blocked: false, totalSpent: 17450, purchaseCount: 7, createdAt: "2026-04-08T08:00:00Z" },
      { id: 3, fullName: "Kunal Jain", email: "kunal@example.com", mobileNumber: "9033333333", city: "Pune", blocked: true, totalSpent: 21320, purchaseCount: 9, createdAt: "2026-03-29T08:00:00Z" },
    ],
  },
  products: {
    items: [
      { id: 1, name: "Arabica Beans", sku: "SKU-AB-01", price: 720, quantity: 18, reorderThreshold: 30, unit: "KG", active: true, stockHealth: 60, lowStock: true, createdAt: "2026-04-20T08:00:00Z" },
      { id: 2, name: "Cold Brew Bottles", sku: "SKU-CB-04", price: 160, quantity: 44, reorderThreshold: 35, unit: "PIECE", active: true, stockHealth: 126, lowStock: false, createdAt: "2026-04-18T08:00:00Z" },
      { id: 3, name: "Dessert Boxes", sku: "SKU-DB-10", price: 220, quantity: 19, reorderThreshold: 35, unit: "BOX", active: true, stockHealth: 54, lowStock: true, createdAt: "2026-04-15T08:00:00Z" },
    ],
  },
  invoices: {
    items: [
      { id: 1, invoiceNumber: "INV-20260429-01", customerName: "Aarav Desai", subtotal: 15400, taxAmount: 2772, discountAmount: 250, totalAmount: 17922, status: "PAID", notes: "Generated from seeded POS data", createdAt: "2026-04-29T08:00:00Z" },
      { id: 2, invoiceNumber: "INV-20260410-02", customerName: "Meera Nair", subtotal: 8450, taxAmount: 1521, discountAmount: 250, totalAmount: 9721, status: "PAID", notes: "Generated from seeded POS data", createdAt: "2026-04-10T08:00:00Z" },
    ],
  },
  plan: {
    plan: {
      name: "Starter",
      description: "POS, invoices, and weekly reports.",
      monthlyPrice: 1499,
      yearlyPrice: 14999,
      maxProducts: 250,
      maxCustomers: 1000,
      features: "POS Billing, GST invoices, Weekly reports, Email support",
      expiresAt: "2026-05-17",
      daysLeft: 18,
    },
  },
  reports: {
    summary: {
      revenue: 111000,
      invoices: 64,
      customers: 126,
      products: 48,
    },
    series: [
      { label: "Nov", value: 42000 },
      { label: "Dec", value: 51000 },
      { label: "Jan", value: 58000 },
      { label: "Feb", value: 64000 },
      { label: "Mar", value: 82000 },
      { label: "Apr", value: 111000 },
    ],
  },
  settings: {
    profile: {
      fullName: "Neha Sharma",
      email: "admin@myreport.com",
      mobileNumber: "9876543210",
      city: "Mumbai",
      address: "Bandra West, Mumbai",
      storeName: "GlowMart",
    },
    preferences: {
      lowStockAlerts: true,
      planExpiryAlerts: true,
      paymentAlerts: true,
      darkMode: false,
    },
  },
};
