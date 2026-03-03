import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Package, ExternalLink, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const SYNC_VARIANTS: Record<string, string> = {
    synced: "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
    pending: "bg-primary/10 text-primary border-primary/10",
    failed: "bg-destructive/10 text-destructive border-destructive/10",
};

export function ProductsPage() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: () => api.get("/products").then(r => r.data),
    });

    const syncMutation = useMutation({
        mutationFn: (id: string) => api.post(`/products/${id}/sync`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["products"] });
            // Add toast or notification if needed
        }
    });

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader title="Inventory Suite" description="Manage and synchronize your curated product catalog across all marketplaces." />
            <div className="flex-1 p-6 space-y-8">
                <div className="glass-card overflow-hidden !p-0 border-none shadow-2xl">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" /> Connected Inventory
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active SKUs</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{data?.items?.length ?? 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
                        ) : data?.items?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                                <div className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                    <Package className="h-10 w-10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white">Your inventory is empty</p>
                                    <p className="text-xs text-muted-foreground max-w-[240px]">Explore the global catalog to find and import winning products to your stores.</p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-4 text-left">Product Entity</th>
                                        <th className="px-8 py-4 text-left">Distribution</th>
                                        <th className="px-8 py-4 text-right">Unit Price</th>
                                        <th className="px-8 py-4 text-right">Profit Potential</th>
                                        <th className="px-8 py-4 text-left">Sync Health</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {data?.items?.map((p: any) => {
                                        const cost = p.global_product?.supplier_cost ?? 0;
                                        const price = p.custom_price ?? 0;
                                        const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : "—";

                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative group/img h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-800">
                                                            <img src={p.global_product?.image_url} alt="" className="h-full w-full object-cover transition-transform group-hover/img:scale-110" />
                                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] leading-tight mb-0.5">{p.custom_title}</p>
                                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                                SKU: {p.platform_product_id || "NOT-PUSHED"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-left">
                                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize mb-0.5">{p.store?.name ?? "—"}</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm inline-block">{p.store?.platform}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <p className="font-bold text-slate-900 dark:text-white">${price.toFixed(2)}</p>
                                                    <p className="text-[10px] text-muted-foreground">Cost: ${cost.toFixed(2)}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                                        {margin}%
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-left">
                                                    <Badge className={cn("text-[9px] font-bold uppercase tracking-widest px-2 h-5 rounded-md shadow-none", SYNC_VARIANTS[p.sync_status] ?? "outline")}>
                                                        {p.sync_status}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
