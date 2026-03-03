import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const ORDER_STATUS_VARIANTS: Record<string, string> = {
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
    shipped: "bg-primary/10 text-primary border-primary/10",
    processing: "bg-amber-500/10 text-amber-600 border-amber-500/10",
    pending: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10",
    cancelled: "bg-destructive/10 text-destructive border-destructive/10 text-white",
};

export function OrdersPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: () => api.get("/orders").then(r => r.data),
    });

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader title="Order Pipeline" description="Real-time multi-store fulfillment and logistics tracking." />
            <div className="flex-1 p-6 space-y-8">
                <div className="glass-card overflow-hidden !p-0">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-primary" /> Active Logistics
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Volume</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">{data?.items?.length ?? 0} Orders</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
                        ) : data?.items?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                    <ShoppingCart className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white">No active orders</p>
                                    <p className="text-xs text-muted-foreground max-w-[200px]">Once you start selling, international orders will appear here for fulfillment.</p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-4 text-left">Customer Strategy</th>
                                        <th className="px-8 py-4 text-left">Platform</th>
                                        <th className="px-8 py-4 text-right">Sale Value</th>
                                        <th className="px-8 py-4 text-right">Net Profit</th>
                                        <th className="px-8 py-4 text-left">lifecycle</th>
                                        <th className="px-8 py-4 text-left">Fulfillment</th>
                                        <th className="px-8 py-4 text-left">Logistics</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {data?.items?.map((o: any) => (
                                        <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-8 py-5 text-left">
                                                <p className="font-bold text-slate-900 dark:text-white">{o.customer_name}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground">{o.product_title}</p>
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">{o.store_name}</p>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                                                    {o.platform_order_id}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-bold text-slate-900 dark:text-white">${o.sale_price.toFixed(2)}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={cn("text-sm font-bold bg-opacity-10 px-2 py-1 rounded-lg", o.profit > 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-destructive bg-destructive/5")}>
                                                    ${o.profit.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                <Badge className={cn("text-[9px] font-bold uppercase tracking-widest px-2 h-5 rounded-md shadow-none", ORDER_STATUS_VARIANTS[o.status] ?? "outline")}>
                                                    {o.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                {o.fulfillment ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn("h-1.5 w-1.5 rounded-full", o.fulfillment.status === 'delivered' ? 'bg-emerald-500' : 'bg-primary')} />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{o.fulfillment.status}</span>
                                                    </div>
                                                ) : <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase italic">Awaiting</span>}
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                {o.fulfillment?.tracking_number ? (
                                                    <a href={o.fulfillment.tracking_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-primary/70 hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4">
                                                        TRACK #{o.fulfillment.tracking_number}
                                                    </a>
                                                ) : <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
