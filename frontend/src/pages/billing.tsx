import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Zap, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "$49/mo",
        features: ["1 Store", "50 Products", "Order Pipeline"],
    },
    {
        id: "pro",
        name: "Pro",
        price: "$149/mo",
        features: ["3 Stores", "Unlimited Products", "Automated Ads", "Priority Support"],
    },
];

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
    const isUnlimited = limit >= 999999;
    const pct = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
    const near = pct > 80;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>{label}</span>
                <span className={cn("text-slate-900 dark:text-white font-black", near && "text-amber-600")}>
                    {current} / {isUnlimited ? "∞" : limit}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100/50 dark:bg-slate-800/50 overflow-hidden border border-slate-200/20 dark:border-white/5">
                {!isUnlimited && (
                    <div
                        className={cn("h-full rounded-full transition-all duration-1000", near ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" : "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]")}
                        style={{ width: `${pct}%` }}
                    />
                )}
                {isUnlimited && <div className="h-full w-full bg-emerald-500/20 rounded-full" />}
            </div>
        </div>
    );
}

export function BillingPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["billing"],
        queryFn: () => api.get("/billing").then(r => r.data),
    });

    const tier = data?.subscription?.plan_tier ?? "free";
    const usage = data?.usage;

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader title="Subscription Console" description="Manage your enterprise resource allocation and service tiers." />
            <div className="flex-1 p-6 space-y-8 max-w-5xl mx-auto w-full pb-20">
                {isLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Current Status */}
                        <div className="lg:col-span-5 space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Current Standing</h2>
                            <div className="glass-card relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <CreditCard className="h-24 w-24 -rotate-12" />
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full inline-block mb-2">Active {tier} Member</p>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight capitalize">{tier}</p>
                                        </div>
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] px-2.5 h-6 font-bold shadow-lg shadow-emerald-500/20 border-none uppercase">
                                            {data?.subscription?.status ?? "Inactive"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <p>Gateway: <span className="text-slate-800 dark:text-slate-200">{data?.subscription?.billing_gateway ?? "Direct"}</span></p>
                                        {data?.subscription?.current_period_end && (
                                            <p>Next Cycle: <span className="text-slate-800 dark:text-slate-200">{new Date(data.subscription.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-4">
                                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[11px] font-bold border-slate-200 dark:border-white/10 dark:hover:bg-slate-800">Manage Payment</Button>
                                    </div>
                                </div>
                            </div>

                            {usage && (
                                <div className="glass-card space-y-6 p-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                            <Zap className="h-3.5 w-3.5 text-amber-500" /> Resource Usage
                                        </h3>
                                    </div>
                                    <div className="space-y-6">
                                        <UsageBar
                                            label="Distribution Nodes"
                                            current={usage.stores.current}
                                            limit={usage.stores.limit}
                                        />
                                        <UsageBar
                                            label="Inventory SKUs"
                                            current={usage.products.current}
                                            limit={usage.products.limit}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Marketplace Plans */}
                        <div className="lg:col-span-7 space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Available Expansions</h2>
                            <div className="grid grid-cols-1 gap-6">
                                {PLANS.map(plan => {
                                    const isCurrent = plan.id === tier;
                                    const isPro = plan.id === "pro";

                                    return (
                                        <div key={plan.id} className={cn(
                                            "glass-card relative overflow-hidden transition-all duration-300",
                                            isPro && !isCurrent && "border-primary/20 bg-primary/[0.02] shadow-xl shadow-primary/5",
                                            isCurrent && "opacity-60 grayscale-[0.5] dark:opacity-40"
                                        )}>
                                            {isPro && !isCurrent && (
                                                <div className="absolute top-0 right-0 bg-primary px-4 py-1 text-[9px] font-black text-white uppercase tracking-tighter rounded-bl-xl shadow-lg shadow-primary/20">
                                                    Recommended Expansion
                                                </div>
                                            )}

                                            <div className="flex flex-col md:flex-row gap-8 p-4">
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <h4 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h4>
                                                        <p className="text-3xl font-black text-primary tracking-tight mt-1">{plan.price}</p>
                                                    </div>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                        {plan.features.map(f => (
                                                            <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="flex flex-col justify-center items-center gap-3">
                                                    <Button
                                                        className={cn(
                                                            "h-12 w-full md:w-40 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95",
                                                            isPro ? "bg-primary shadow-primary/20" : "bg-slate-900 dark:bg-slate-800 shadow-slate-900/10"
                                                        )}
                                                        disabled={isCurrent}
                                                    >
                                                        {isCurrent ? "Active Tier" : `Scale to ${plan.name}`}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
