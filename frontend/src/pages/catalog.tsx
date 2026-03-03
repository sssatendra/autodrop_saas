import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, ShoppingBag, TrendingUp, ArrowUpRight, X, Plus } from "lucide-react";
import api from "@/lib/api";

interface Product {
    id: string; title: string; description: string; image_url: string;
    supplier_cost: number; estimated_retail_price: number; margin_pct: number;
    category: string; source_platform: string; multi_factor_score: number;
}

function ImportModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const qc = useQueryClient();
    const { data: storesData } = useQuery({
        queryKey: ["stores"],
        queryFn: () => api.get("/stores").then(r => r.data),
    });
    const [selectedStore, setSelectedStore] = useState("");
    const [error, setError] = useState("");

    const mutation = useMutation({
        mutationFn: () => api.post("/products/import", { global_product_id: product.id, store_id: selectedStore }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); onClose(); },
        onError: (e: any) => setError(e.response?.data?.error ?? "Import failed"),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md transition-all duration-300" onClick={onClose}>
            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
                <div className="mb-6 flex items-start justify-between">
                    <div className="text-left">
                        <h3 className="text-xl font-bold tracking-tight">Import Product</h3>
                        <p className="mt-1 text-xs font-medium text-muted-foreground line-clamp-1">{product.title}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-100">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {storesData?.stores?.length === 0 ? (
                    <div className="rounded-2xl border border-destructive/10 bg-destructive/5 p-4 text-center">
                        <p className="text-sm font-bold text-destructive">No connected stores found.</p>
                        <p className="mt-1 text-xs text-destructive/70">Please connect a store in the "My Stores" section first.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2 text-left">
                            <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Destination</Label>
                            <select
                                value={selectedStore}
                                onChange={e => setSelectedStore(e.target.value)}
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium transition-all focus:bg-white focus:outline-none"
                            >
                                <option value="">Choose a destination store...</option>
                                {storesData?.stores?.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.store_name} ({s.platform})</option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="rounded-xl border border-destructive/10 bg-destructive/5 p-3 text-center text-xs font-semibold text-destructive">{error}</p>}
                        <Button
                            className="h-12 w-full rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={!selectedStore || mutation.isPending}
                            onClick={() => mutation.mutate()}
                        >
                            {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                            Import to Inventory
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function CatalogPage() {
    const [search, setSearch] = useState("");
    const [importProduct, setImportProduct] = useState<Product | null>(null);
    const { data, isLoading } = useQuery({
        queryKey: ["catalog", 1],
        queryFn: () => api.get("/catalog?per_page=15").then(r => r.data),
    });

    const filtered = data?.items?.filter((p: Product) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader title="Global Catalog" description="Discover AI-ranked winning products across global markets." />
            <div className="flex-1 p-6 space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Find products, categories, or trends..."
                            className="h-12 rounded-2xl border-slate-200 bg-white pl-11 shadow-sm transition-all focus:shadow-md focus:ring-0"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filter by ROI</span>
                        <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full w-2/3 bg-emerald-500 rounded-full" />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((p: Product) => (
                            <div key={p.id} className="glass-card !p-0 group overflow-hidden transition-all hover:-translate-y-2 hover:border-primary/30">
                                <div className="relative aspect-square overflow-hidden bg-slate-50">
                                    <img
                                        src={p.image_url}
                                        alt={p.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-slate-900/90 text-white border-none text-[11px] font-bold px-2.5 h-7 shadow-xl backdrop-blur-md">
                                            <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />SCORE {p.multi_factor_score.toFixed(0)}
                                        </Badge>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">{p.category}</p>
                                        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white line-clamp-2 leading-snug h-10">{p.title}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Supply Cost</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">${p.supplier_cost.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">MSRP</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">${p.estimated_retail_price.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                                {p.margin_pct}% MARGIN
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={p.image_url} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-slate-50">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Button>
                                            </a>
                                            <Button size="sm" className="h-9 px-4 rounded-xl text-[11px] font-bold shadow-lg shadow-primary/10" onClick={() => setImportProduct(p)}>
                                                <Plus className="h-3.5 w-3.5 mr-1.5" /> Import
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {importProduct && <ImportModal product={importProduct} onClose={() => setImportProduct(null)} />}
        </div>
    );
}
