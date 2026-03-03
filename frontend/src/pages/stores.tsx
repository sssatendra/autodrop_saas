import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ExternalLink, CheckCircle2, AlertCircle, Plug, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const PLATFORM_LOGOS: Record<string, string> = {
    shopify: "https://cdn.simpleicons.org/shopify/white",
    woocommerce: "https://cdn.simpleicons.org/woocommerce/white",
};

function ConnectionModal({
    platform,
    onClose,
}: {
    platform: "shopify" | "woocommerce";
    onClose: () => void;
}) {
    const qc = useQueryClient();
    const [formData, setFormData] = useState({
        store_name: "",
        store_url: "",
        access_token: "", // for shopify
        consumer_key: "", // for woo
        consumer_secret: "", // for woo
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        mutation.mutate({ platform, ...formData });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md transition-all duration-300" onClick={onClose}>
            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
                <div className="mb-8 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-xl">
                            <img src={PLATFORM_LOGOS[platform]} alt={platform} className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold tracking-tight capitalize">Connect {platform}</h3>
                            <p className="text-xs font-medium text-muted-foreground">Link your store to AutoDrop</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-100">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5 text-left">
                        <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Store Name</Label>
                        <Input
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white"
                            placeholder="e.g. My Premium Shop"
                            value={formData.store_name}
                            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1.5 text-left">
                        <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Store URL</Label>
                        <Input
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white"
                            placeholder={platform === "shopify" ? "https://mystore.myshopify.com" : "https://mydomain.com"}
                            value={formData.store_url}
                            onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                            required
                        />
                    </div>

                    {platform === "shopify" ? (
                        <div className="space-y-1.5 text-left">
                            <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Token</Label>
                            <Input
                                type="password"
                                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white"
                                placeholder="shpat_xxxxxxxxxxxxxxxx"
                                value={formData.access_token}
                                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                                required
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key</Label>
                                <Input
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white"
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
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white"
                                    placeholder="cs_..."
                                    value={formData.consumer_secret}
                                    onChange={(e) => setFormData({ ...formData, consumer_secret: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {error && <p className="rounded-xl border border-destructive/10 bg-destructive/5 p-3 text-center text-xs font-semibold text-destructive">{error}</p>}

                    <Button className="h-12 w-full rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plug className="mr-2 h-4 w-4" /> Connect Platform</>}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export function StoresPage() {
    const { data } = useQuery({
        queryKey: ["stores"],
        queryFn: () => api.get("/stores").then((r) => r.data),
    });

    const [connectPlatform, setConnectPlatform] = useState<"shopify" | "woocommerce" | null>(null);

    const stores = data?.stores ?? [];

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader title="My Stores" description="Connect and manage your global sales channels." />
            <div className="flex-1 p-6 space-y-8">
                {/* Connection Cards */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {(["shopify", "woocommerce"] as const).map((platform) => {
                        const connected = stores.find((s: any) => s.platform === platform);
                        return (
                            <div key={platform} className={cn("glass-card !p-8 flex flex-col h-full transition-all border-2", connected ? "border-primary/20 bg-primary/[0.02]" : "border-transparent border-dashed hover:border-slate-300")}>
                                <div className="mb-8 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-2xl">
                                            <img src={PLATFORM_LOGOS[platform]} alt={platform} className="h-7 w-7" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-lg font-bold capitalize tracking-tight text-slate-900 dark:text-white">{platform}</p>
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                                {platform === "shopify" ? "SaaS E-commerce" : "Open Source Power"}
                                            </p>
                                        </div>
                                    </div>
                                    {connected ? (
                                        <Badge className="rounded-lg border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-600">
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> SECURELY CONNECTED
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="rounded-lg border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-400">
                                            NOT CONNECTED
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-1">
                                    {connected ? (
                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{connected.store_name}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <ExternalLink className="h-3 w-3 text-primary" />
                                                    <a href={connected.store_url} target="_blank" rel="noreferrer" className="truncate text-xs font-semibold text-primary/70 hover:text-primary hover:underline">
                                                        {connected.store_url.replace(/^https?:\/\//, "")}
                                                    </a>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Health Status</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                        <span className="text-[10px] font-bold text-emerald-600">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mb-6 text-left text-sm leading-relaxed text-muted-foreground/80">
                                            Automatically import winning products and sync orders to your {platform} dashboard with a single click.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8">
                                    {connected ? (
                                        <Button variant="outline" className="h-11 w-full rounded-xl border-slate-200 font-bold transition-all hover:bg-slate-50">
                                            Manage Integration
                                        </Button>
                                    ) : (
                                        <Button className="h-11 w-full rounded-xl font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => setConnectPlatform(platform)}>
                                            <Plug className="mr-2 h-4 w-4" /> Connect {platform}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Store Detail Table */}
                {stores.length > 0 && (
                    <div className="glass-card overflow-hidden !p-0">
                        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                                <Store className="h-4 w-4 text-primary" /> Active Stores
                            </h2>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stores.length} Connected</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-4 text-left">Store Identity</th>
                                        <th className="px-8 py-4 text-left">Infrastructure</th>
                                        <th className="px-8 py-4 text-left">Traffic Status</th>
                                        <th className="px-8 py-4 text-right">Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stores.map((s: any) => (
                                        <tr key={s.id} className="transition-colors hover:bg-slate-50/50">
                                            <td className="px-8 py-5 text-left">
                                                <p className="font-bold text-slate-900 dark:text-white">{s.store_name}</p>
                                                <p className="text-xs text-muted-foreground">{s.store_url.replace(/^https?:\/\//, "")}</p>
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                                                        <img src={PLATFORM_LOGOS[s.platform]} alt={s.platform} className="h-3 w-3 brightness-0" />
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{s.platform}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                <Badge className={cn("rounded-md px-2 h-5 text-[9px] font-bold uppercase tracking-widest shadow-none", s.is_active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400")}>
                                                    {s.is_active ? "LIVE" : "INACTIVE"}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right text-xs font-medium text-slate-400">
                                                {s.last_synced_at ? new Date(s.last_synced_at).toLocaleDateString() : "Never Synced"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {connectPlatform && (
                <ConnectionModal
                    platform={connectPlatform}
                    onClose={() => setConnectPlatform(null)}
                />
            )}
        </div>
    );
}
