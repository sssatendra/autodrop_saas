import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { LandingPage } from "@/pages/landing";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { DashboardHome } from "@/pages/dashboard";
import { CatalogPage } from "@/pages/catalog";
import { StoresPage } from "@/pages/stores";
import { ProductsPage } from "@/pages/products";
import { CampaignsPage } from "@/pages/campaigns";
import { OrdersPage } from "@/pages/orders";
import { BillingPage } from "@/pages/billing";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 60_000, retry: 1 },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="autodrop-theme">
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            {/* Public */}
                            <Route path="/" element={<LandingPage />} />

                            {/* Auth */}
                            <Route element={<AuthLayout />}>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                            </Route>

                            {/* Protected Dashboard */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<DashboardLayout />}>
                                    <Route path="/app" element={<DashboardHome />} />
                                    <Route path="/app/catalog" element={<CatalogPage />} />
                                    <Route path="/app/stores" element={<StoresPage />} />
                                    <Route path="/app/products" element={<ProductsPage />} />
                                    <Route path="/app/campaigns" element={<CampaignsPage />} />
                                    <Route path="/app/orders" element={<OrdersPage />} />
                                    <Route path="/app/billing" element={<BillingPage />} />
                                </Route>
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    </StrictMode>
);
