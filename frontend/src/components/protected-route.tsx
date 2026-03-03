import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

/** Blocks unauthenticated users from reaching /app routes. */
export function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}
