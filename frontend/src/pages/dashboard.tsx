import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Package, ShoppingCart, DollarSign, Activity } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

function StatCard({ title, value, icon: Icon, sub }: { title: string; value: string | number; icon: React.ElementType; sub?: string }) {
    return (
        <div className="glass-card hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {sub && <p className="text-[10px] font-medium text-muted-foreground mt-2 flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <span className="h-1 w-1 rounded-full bg-primary/40 block shrink-0" />
                {sub}
            </p>}
        </div>
    );
}

export function DashboardHome() {
    const { user } = useAuth();
    const { data: billing } = useQuery({
        queryKey: ["billing"],
        queryFn: () => api.get("/billing").then(r => r.data),
    });
    const { data: orders } = useQuery({
        queryKey: ["orders", 1],
        queryFn: () => api.get("/orders?per_page=5").then(r => r.data),
    });
    const { data: catalog } = useQuery({
        queryKey: ["catalog", 1],
        queryFn: () => api.get("/catalog?per_page=1").then(r => r.data),
    });

    const totalProfit = orders?.items?.reduce((s: number, o: any) => s + o.profit, 0) ?? 0;

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader
                title={`Welcome back, ${user?.full_name?.split(" ")[0] ?? "there"} 👋`}
                description="Here's what's happening in your workspace today."
            />
            <div className="flex-1 p-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Connected Stores"
                        value={`${billing?.usage?.stores?.current ?? 0} / ${billing?.usage?.stores?.limit ?? 1}`}
                        icon={Store}
                        sub={`${billing?.subscription?.plan_tier ?? "Free"} Membership`}
                    />
                    <StatCard
                        title="Active Products"
                        value={billing?.usage?.products?.current ?? 0}
                        icon={Package}
                        sub="Verified listings"
                    />
                    <StatCard
                        title="Total Orders"
                        value={orders?.total ?? 0}
                        icon={ShoppingCart}
                        sub="Cross-platform sales"
                    />
                    <StatCard
                        title="Net Profit"
                        value={`$${totalProfit.toFixed(2)}`}
                        icon={DollarSign}
                        sub="Revenue after cost"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 glass-card !p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-primary" /> Recents
                            </h2>
                            <Badge variant="outline" className="text-[10px] font-bold">Latest 5</Badge>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {orders?.items?.length === 0 && (
                                <div className="p-12 text-center">
                                    <p className="text-sm text-muted-foreground">Waiting for your first sale...</p>
                                </div>
                            )}
                            {orders?.items?.map((o: any) => (
                                <div key={o.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <ShoppingCart className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{o.customer_name}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{o.product_title}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">${o.sale_price.toFixed(2)}</p>
                                        <Badge variant={o.status === "delivered" ? "default" : "secondary"} className="text-[9px] font-bold px-1.5 h-4 mt-1">
                                            {o.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card !p-0 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" /> Status
                            </h2>
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Global Trends</span>
                                <span className="font-bold text-slate-900 dark:text-white">{catalog?.total ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subscription</span>
                                <span className="font-bold text-primary flex items-center gap-1.5 tracking-tight capitalize">
                                    {billing?.subscription?.plan_tier ?? "Free"} Plan
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Network Health</span>
                                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[9px] font-bold px-1.5 h-4">
                                    Operational
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Workspace ID</span>
                                <span className="font-mono text-[10px] text-slate-400">{user?.tenant?.id?.slice(0, 8)}...</span>
                            </div>
                        </div>
                        <div className="p-4 mt-auto">
                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Pro Tip</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Connect more stores to increase your reach. High volume stores get better pricing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
