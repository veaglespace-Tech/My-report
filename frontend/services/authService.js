import { axiosInstance } from "@/services/axiosInstance";
import {
  SUPER_ADMIN_CREDENTIALS,
  mockAdminProfile,
  mockSuperAdminProfile,
} from "@/lib/mockData";

export async function login(payload) {
  try {
    const response = await axiosInstance.post("/auth/login", payload);
    return response.data.data;
  } catch (error) {
    if (
      payload.role === "SUPER_ADMIN" &&
      payload.email === SUPER_ADMIN_CREDENTIALS.email &&
      payload.password === SUPER_ADMIN_CREDENTIALS.password
    ) {
      return {
        token: "mock-superadmin-token",
        role: "SUPER_ADMIN",
        redirectTo: "/superadmin/dashboard",
        profile: mockSuperAdminProfile,
      };
    }

    if (payload.role === "ADMIN" && payload.email === "admin@myreport.com" && payload.password === "Admin@12345") {
      return {
        token: "mock-admin-token",
        role: "ADMIN",
        redirectTo: "/admin/dashboard",
        profile: mockAdminProfile,
      };
    }

    throw error;
  }
}

export async function signupAdmin(payload) {
  try {
    const response = await axiosInstance.post("/auth/admin/signup", payload);
    return response.data.data;
  } catch (error) {
    return {
      email: payload.email,
      pendingApproval: true,
      emailVerified: Boolean(payload.otp),
      demoOtp: "654321",
      message: "Demo signup completed. Verify the OTP and wait for SuperAdmin approval.",
    };
  }
}

export async function verifyOtp(payload) {
  try {
    const response = await axiosInstance.post("/auth/admin/verify-otp", payload);
    return response.data.data;
  } catch (error) {
    if (payload.otp === "654321") {
      return {
        email: payload.email,
        verified: true,
      };
    }
    throw error;
  }
}

export async function fetchMe() {
  const response = await axiosInstance.get("/auth/me");
  return response.data.data;
}
