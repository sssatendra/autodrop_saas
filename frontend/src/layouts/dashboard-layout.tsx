import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";

export function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
            <Sidebar />
            {/* Offset main content by sidebar width */}
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
