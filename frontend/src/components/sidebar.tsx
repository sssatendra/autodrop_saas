import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    TrendingUp,
    Store,
    Package,
    Megaphone,
    ShoppingCart,
    CreditCard,
    LogOut,
    Zap,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/app/catalog", label: "Product Catalog", icon: TrendingUp },
    { to: "/app/stores", label: "My Stores", icon: Store },
    { to: "/app/products", label: "My Products", icon: Package },
    { to: "/app/campaigns", label: "Campaigns", icon: Megaphone },
    { to: "/app/orders", label: "Orders", icon: ShoppingCart },
    { to: "/app/billing", label: "Billing", icon: CreditCard },
];

export function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 p-4">
            <div className="flex h-full flex-col overflow-hidden rounded-3xl sidebar-glass shadow-2xl">
                {/* Logo & Tenant */}
                <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                        <Zap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-base font-bold tracking-tight text-white leading-tight">AutoDrop</p>
                        <p className="truncate text-[10px] uppercase tracking-widest font-semibold text-slate-400 mt-0.5">{user?.tenant.name}</p>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6 custom-scrollbar">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                cn(
                                    "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                                    )}
                                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                                    <span className="flex-1 truncate">{label}</span>
                                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-40" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Context & Footer */}
                <div className="mt-auto p-4 border-t border-slate-800/30">
                    <div className="mb-3 rounded-2xl bg-slate-800/40 border border-slate-700/30 px-4 py-3">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                {user?.full_name?.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-200">{user?.full_name}</p>
                                <span className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary mt-1">
                                    {user?.subscription?.plan_tier ?? "Free"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
