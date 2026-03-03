export interface UserSubscription {
    plan_tier: "starter" | "pro" | "enterprise" | "free";
    status: string | null;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: "owner" | "admin" | "member";
    tenant: Tenant;
    subscription: UserSubscription | null;
}

export interface AuthResponse {
    user: User;
}

export interface ApiError {
    error?: string;
    errors?: Record<string, string>;
}
