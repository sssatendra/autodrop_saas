import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Store, ShoppingBag, Plus, Loader2, Trash2, ExternalLink,
    RefreshCcw, ShieldCheck, Plug, AlertCircle, Globe, Zap,
    Layers, Truck, Search, Briefcase, X
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const PLATFORM_LOGOS: Record<string, string> = {
    shopify: "https://cdn.simpleicons.org/shopify/white",
    woocommerce: "https://cdn.simpleicons.org/woocommerce/white",
    aliexpress: "https://s.yimg.com/zb/imgv1/dda661a9-0f07-3213-89f6-6183da0439fd/t_500x300",
    cj: "https://www.cjdropshipping.com/wp-content/uploads/2021/04/CJ-logo-2.png", // Placeholder, adjust as needed
};

interface ConnectedStore {
    id: string;
    platform: "shopify" | "woocommerce" | "aliexpress" | "cj";
    store_name: string;
    store_url: string;
    is_active: boolean;
    last_synced_at: string | null;
    created_at: string;
}

function ConnectionModal({
    platform,
    onClose,
}: {
    platform: "shopify" | "woocommerce" | "aliexpress" | "cj";
    onClose: () => void;
}) {
    const qc = useQueryClient();
    const [formData, setFormData] = useState({
        store_name: "",
        store_url: "",
        access_token: "", // for shopify
        consumer_key: "", // for woo
        consumer_secret: "", // for woo
        api_key: "" // For suppliers
    });
    const [error, setError] = useState("");

    const mutation = useMutation({
        mutationFn: (data: any) => api.post("/stores/connect", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["stores"] });
            qc.invalidateQueries({ queryKey: ["billing"] });
            onClose();
        },
        onError: (e: any) => setError(e.response?.data?.error ?? "Connection failed"),
    });

    const supplierMutation = useMutation({
        mutationFn: (data: any) => api.post("/integrations/connect", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["integrations"] });
            onClose();
        },
        onError: (e: any) => setError(e.response?.data?.error ?? "Connection failed"),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (platform === "shopify") {
            try {
                const shopUrl = formData.store_url.replace(/^https?:\/\//, "").replace(/\/$/, "");
                const res = await api.get(`/stores/shopify/authorize?shop=${shopUrl}`);
                if (res.data?.url) {
                    window.location.href = res.data.url;
                } else {
                    setError("Failed to generate authorize URL");
                }
            } catch (err: any) {
                setError(err.response?.data?.error ?? "Authorization failed");
            }
        } else if (platform === "aliexpress" || platform === "cj") {
            // Supplier integrations
            supplierMutation.mutate({
                platform,
                credentials: { api_key: formData.api_key }
            });
        } else { // woocommerce
            mutation.mutate({ platform, ...formData });
        }
    };

    const isSupplierPlatform = platform === "aliexpress" || platform === "cj";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md transition-all duration-300" onClick={onClose}>
            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 dark:bg-slate-900/90 p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
                <div className="mb-8 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-xl">
                            {isSupplierPlatform ? (
                                <img src={PLATFORM_LOGOS[platform]} alt={platform} className="h-6 w-6 object-contain invert dark:invert-0" />
                            ) : (
                                <img src={PLATFORM_LOGOS[platform]} alt={platform} className="h-6 w-6" />
                            )}
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold tracking-tight capitalize dark:text-white">Connect {platform}</h3>
                            <p className="text-xs font-medium text-muted-foreground">Link your {isSupplierPlatform ? "supplier account" : "store"} to AutoDrop</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isSupplierPlatform && (
                        <>
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Store Name</Label>
                                <Input
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900 dark:text-white"
                                    placeholder="e.g. My Premium Shop"
                                    value={formData.store_name}
                                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Store URL</Label>
                                <Input
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900 dark:text-white"
                                    placeholder={platform === "shopify" ? "https://mystore.myshopify.com" : "https://mydomain.com"}
                                    value={formData.store_url}
                                    onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {platform === "shopify" ? (
                        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-left">
                            <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5" /> Secure OAuth 2.0
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                You will be redirected to Shopify to securely authorize AutoDrop. We never see your password.
                            </p>
                        </div>
                    ) : isSupplierPlatform ? (
                        <div className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">API Key / Access Token</Label>
                                <Input
                                    type="password"
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900 dark:text-white"
                                    placeholder="Enter your security token..."
                                    value={formData.api_key}
                                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-left">
                                <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5" /> High-speed Scraping
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Connecting as a supplier allows AutoDrop to pull real-time inventory and fulfillment updates directly.
                                </p>
                            </div>
                        </div>
                    ) : ( // woocommerce
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key</Label>
                                <Input
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900 dark:text-white"
                                    placeholder="ck_..."
                                    value={formData.consumer_key}
                                    onChange={(e) => setFormData({ ...formData, consumer_key: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secret</Label>
                                <Input
                                    type="password"
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900 dark:text-white"
                                    placeholder="cs_..."
                                    value={formData.consumer_secret}
                                    onChange={(e) => setFormData({ ...formData, consumer_secret: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {error && <p className="rounded-xl border border-destructive/10 bg-destructive/5 p-3 text-center text-xs font-semibold text-destructive">{error}</p>}

                    <Button
                        className="h-12 w-full rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={mutation.isPending || supplierMutation.isPending}
                    >
                        {(mutation.isPending || supplierMutation.isPending) ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plug className="mr-2 h-4 w-4" /> {platform === "shopify" ? "Authorize on Shopify" : isSupplierPlatform ? "Configure Integration" : "Connect Platform"}</>}
                    </Button>
                </form>
            </div>
        </div>
    );
}

function StoreCard({ store, onDelete }: { store: ConnectedStore; onDelete: (id: string) => void }) {
    return (
        <div className="glass-card group relative flex flex-col h-full !p-6 border-2 border-transparent transition-all hover:border-primary/20 hover:bg-primary/[0.01]">
            <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-lg group-hover:scale-105 transition-transform">
                        <img src={PLATFORM_LOGOS[store.platform]} alt={store.platform} className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[140px]">{store.store_name}</p>
                        <Badge className={cn("mt-1 rounded-md px-1.5 h-4 text-[8px] font-bold uppercase tracking-widest shadow-none", store.is_active ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                            {store.is_active ? "LIVE" : "INACTIVE"}
                        </Badge>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(store.id)}
                    className="rounded-lg p-2 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 space-y-4">
                <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 p-3 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-3 w-3 text-primary/50" />
                        <a href={store.store_url} target="_blank" rel="noreferrer" className="truncate text-[11px] font-semibold text-primary/70 hover:text-primary hover:underline">
                            {store.store_url.replace(/^https?:\/\//, "")}
                        </a>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Last Sync</span>
                        <span className="text-[9px] font-bold text-slate-500">
                            {store.last_synced_at ? new Date(store.last_synced_at).toLocaleDateString() : "Never"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Secure Pipeline Active</span>
            </div>
        </div>
    );
}

export function StoresPage() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: () => api.get("/stores").then((r) => r.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (storeId: string) => api.delete(`/stores/${storeId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["stores"] });
            qc.invalidateQueries({ queryKey: ["billing"] });
        },
    });

    const [connectPlatform, setConnectPlatform] = useState<"shopify" | "woocommerce" | "aliexpress" | "cj" | null>(null);

    const stores: ConnectedStore[] = data?.stores ?? [];

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader title="Store Ecosystem" description="Scale your drop-shipping empire across multiple platforms." />

            <div className="flex-1 p-6 space-y-10">

                {/* Managed Ecosystem Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            <Zap className="h-3.5 w-3.5 text-primary" /> Active Connections
                        </h2>
                        {stores.length > 0 && (
                            <span className="rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                                {stores.length} Managed Entities
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="glass-card h-48 animate-pulse bg-slate-50 dark:bg-slate-900/50" />
                            ))}
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-slate-50/30 dark:bg-slate-900/10">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl mb-6">
                                <Store className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No stores connected yet</h3>
                            <p className="mt-1 text-xs text-muted-foreground">Start by linking a Shopify or WooCommerce store below.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {stores?.map((s: any) => (
                                <div key={s.id} className="glass-card flex items-center justify-between group transition-all hover:border-primary/40">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                                            {s.platform === "aliexpress" || s.platform === "cj" ? (
                                                <img src={PLATFORM_LOGOS[s.platform]} alt={s.platform} className="h-6 w-6 object-contain invert dark:invert-0" />
                                            ) : (
                                                <Store className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">{s.store_name || s.platform}</p>
                                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] font-black h-4 px-1 uppercase tracking-tighter">Live</Badge>
                                            </div>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                                                {s.platform.toUpperCase()} {s.store_url && `• ${s.store_url.replace("https://", "")}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        {s.store_url && (
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => window.open(s.store_url, "_blank")}>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteMutation.mutate(s.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Supplier Network Section */}
                <div className="mt-12 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <Truck className="h-4 w-4" />
                        </div>
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Supplier Network</h2>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* AliExpress */}
                        <div className="glass-card hover:border-primary/30 transition-all group relative overflow-hidden bg-white/50 dark:bg-slate-900/50">
                            <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:opacity-30 transition-opacity">
                                <Zap className="h-16 w-16 text-orange-500" />
                            </div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center p-3 shadow-inner">
                                        <img src={PLATFORM_LOGOS.aliexpress} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                                    </div>
                                    <div className="text-left py-1">
                                        <h3 className="text-base font-bold dark:text-white">AliExpress Global</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-1">Millions of products, automated fulfillment.</p>
                                    </div>
                                </div>
                                <Button
                                    className="rounded-xl h-10 px-4 font-bold text-xs"
                                    onClick={() => setConnectPlatform("aliexpress")}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Configure
                                </Button>
                            </div>
                        </div>

                        {/* CJ Dropshipping */}
                        <div className="glass-card hover:border-primary/30 transition-all group relative overflow-hidden bg-white/50 dark:bg-slate-900/50">
                            <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:opacity-30 transition-opacity">
                                <Search className="h-16 w-16 text-blue-500" />
                            </div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center p-4 shadow-inner">
                                        <div className="text-primary font-black italic text-xl">CJ</div>
                                    </div>
                                    <div className="text-left py-1">
                                        <h3 className="text-base font-bold dark:text-white">CJDropshipping</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-1">Curated winning items & warehouse stock.</p>
                                    </div>
                                </div>
                                <Button
                                    className="rounded-xl h-10 px-4 font-bold text-xs"
                                    onClick={() => setConnectPlatform("cj")}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Configure
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration Marketplace */}
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        <Plug className="h-3.5 w-3.5 text-primary" /> Multi-Store Marketplace
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {(["shopify", "woocommerce"] as const).map((platform) => {
                            const count = stores.filter(s => s.platform === platform).length;
                            return (
                                <div key={platform} className="glass-card group relative !p-8 flex flex-col h-full bg-slate-900 border-none overflow-hidden hover:scale-[1.01] transition-all">
                                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative mb-8 flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                                                <img src={PLATFORM_LOGOS[platform]} alt={platform} className="h-8 w-8" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xl font-bold capitalize tracking-tight text-white">{platform}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                                                    {count > 0 ? `${count} Active ${count === 1 ? 'Store' : 'Stores'}` : 'Global Ready'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-white/10 text-white/60 border-none text-[9px] font-bold tracking-tighter">API V4 READY</Badge>
                                    </div>

                                    <div className="relative flex-1">
                                        <p className="mb-8 text-left text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">
                                            Scale your {platform} presence. Link as many accounts as your plan allows with zero latency syncing.
                                        </p>

                                        <Button
                                            className="h-12 w-full rounded-xl font-bold bg-white text-slate-900 hover:bg-primary hover:text-white shadow-xl transition-all"
                                            onClick={() => setConnectPlatform(platform)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Link New {platform} Store
                                        </Button>
                                    </div>

                                    <div className="mt-6 flex items-center justify-center gap-4 border-t border-white/5 pt-6">
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Encrypted</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Real-time</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {connectPlatform && <ConnectionModal platform={connectPlatform} onClose={() => setConnectPlatform(null)} />}
        </div>
    );
}
