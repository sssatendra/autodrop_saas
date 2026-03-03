import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone, TrendingUp, DollarSign, Plus, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
    active: "default",
    paused: "secondary",
    draft: "outline",
    ended: "outline",
};

const PLATFORM_LOGOS: Record<string, string> = {
    meta: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    google: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg",
};

function IntegrationModal({ platform, onClose }: { platform: "meta" | "google"; onClose: () => void }) {
    const qc = useQueryClient();
    const [formData, setFormData] = useState({
        access_token: "",
        ad_account_id: "",
        developer_token: "",
        customer_id: "",
    });
    const [error, setError] = useState("");

    const mutation = useMutation({
        mutationFn: (data: any) => api.post("/integrations/connect", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["integrations"] });
            qc.invalidateQueries({ queryKey: ["campaigns"] });
            onClose();
        },
        onError: (e: any) => setError(e.response?.data?.error ?? "Connection failed"),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const credentials = platform === "meta"
            ? { access_token: formData.access_token, ad_account_id: formData.ad_account_id }
            : { developer_token: formData.developer_token, customer_id: formData.customer_id };
        mutation.mutate({ platform, credentials });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md transition-all duration-300" onClick={onClose}>
            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 dark:bg-slate-900/90 p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
                <div className="mb-8 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-2.5">
                            <img src={PLATFORM_LOGOS[platform]} alt={platform} className="h-full w-full object-contain" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold tracking-tight capitalize">{platform} Ads</h3>
                            <p className="text-xs font-medium text-muted-foreground">Authorize your ad account</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {platform === "meta" ? (
                        <>
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Token</Label>
                                <Input
                                    type="password"
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900"
                                    placeholder="EAAG..."
                                    value={formData.access_token}
                                    onChange={e => setFormData({ ...formData, access_token: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ad Account ID</Label>
                                <Input
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900"
                                    placeholder="act_xxxxxxxxxxxxxxx"
                                    value={formData.ad_account_id}
                                    onChange={e => setFormData({ ...formData, ad_account_id: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Developer Token</Label>
                                <Input
                                    type="password"
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900"
                                    placeholder="Unique token from Google"
                                    value={formData.developer_token}
                                    onChange={e => setFormData({ ...formData, developer_token: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer ID</Label>
                                <Input
                                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 transition-all focus:bg-white dark:focus:bg-slate-900"
                                    placeholder="123-456-7890"
                                    value={formData.customer_id}
                                    onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    )}
                    {error && <p className="rounded-xl border border-destructive/10 bg-destructive/5 p-3 text-center text-xs font-semibold text-destructive">{error}</p>}
                    <Button className="h-12 w-full rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Platform"}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export function CampaignsPage() {
    const qc = useQueryClient();
    const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
        queryKey: ["campaigns"],
        queryFn: () => api.get("/campaigns").then(r => r.data),
    });

    const { data: integrationsData } = useQuery({
        queryKey: ["integrations"],
        queryFn: () => api.get("/integrations").then(r => r.data),
    });

    const disconnectMutation = useMutation({
        mutationFn: (platform: string) => api.delete(`/integrations/${platform}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["integrations"] });
            qc.invalidateQueries({ queryKey: ["campaigns"] });
        },
    });

    const [connectPlatform, setConnectPlatform] = useState<"meta" | "google" | null>(null);

    const metrics = campaignsData?.metrics ?? { total_spend: 0, blended_roas: 0 };
    const integrations = integrationsData?.integrations ?? [];

    return (
        <div className="flex flex-col flex-1">
            <DashboardHeader title="Campaigns" description="Global advertising and ROI performance tracker." />
            <div className="flex-1 p-6 space-y-8">

                {/* Top metrics */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="glass-card hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Total Ad Spend</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">${metrics.total_spend.toFixed(2)}</div>
                        <p className="text-[10px] font-medium text-muted-foreground mt-2">Aggregated investment</p>
                    </div>

                    <div className="glass-card hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Blended ROAS</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-emerald-600">{metrics.blended_roas.toFixed(2)}x</div>
                        <p className="text-[10px] font-medium text-muted-foreground mt-2">Performance multiplier</p>
                    </div>
                </div>

                {/* Ad Platform Connections */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {(["meta", "google"] as const).map(p => {
                        const connected = integrations.find((i: any) => i.platform === p && i.is_active);
                        return (
                            <div key={p} className={cn("glass-card !p-4 flex items-center justify-between transition-all group", connected ? "border-primary/20 bg-primary/[0.01]" : "border-dashed border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20")}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-all shadow-sm", connected ? "bg-white dark:bg-slate-800 shadow-xl group-hover:scale-105" : "bg-slate-50 dark:bg-slate-900")}>
                                        <img src={PLATFORM_LOGOS[p]} alt={p} className={cn("h-6 w-6 object-contain", !connected && "opacity-40 grayscale")} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm capitalize text-slate-900 dark:text-white">{p} Ads</p>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                                            {connected ? "SYNC ACTIVE" : "AUTHENTICATION REQUIRED"}
                                        </p>
                                    </div>
                                </div>
                                {connected ? (
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/10 text-[9px] font-bold px-2 h-5 rounded-md">
                                            READY
                                        </Badge>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                if (confirm(`Disconnect ${p} Ads?`)) {
                                                    disconnectMutation.mutate(p);
                                                }
                                            }}
                                            disabled={disconnectMutation.isPending}
                                        >
                                            {disconnectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-[11px] font-bold border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setConnectPlatform(p)}>
                                        <Plus className="h-3 w-3 mr-1.5" /> Link Channel
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Campaigns table */}
                <div className="glass-card overflow-hidden !p-0">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-primary" /> Active Campaigns
                        </h2>
                        <Button size="sm" className="rounded-xl h-9 px-4 font-bold shadow-lg shadow-primary/20" disabled={integrations.length === 0}>
                            Schedule New Campaign
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        {campaignsLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
                        ) : campaignsData?.items?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                    <Megaphone className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white">No campaigns found</p>
                                    <p className="text-xs text-muted-foreground max-w-[200px]">Link an ad account and create your first campaign to see metrics here.</p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-4 text-left">Campaign Strategy</th>
                                        <th className="px-8 py-4 text-left">Platform</th>
                                        <th className="px-8 py-4 text-left">Lifecycle</th>
                                        <th className="px-8 py-4 text-right">Daily Budget</th>
                                        <th className="px-8 py-4 text-right">Conversions</th>
                                        <th className="px-8 py-4 text-right">ROAS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {campaignsData?.items?.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-8 py-5 text-left">
                                                <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.campaign_name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium">{c.product_title}</p>
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                <div className="flex items-center gap-2">
                                                    <img src={PLATFORM_LOGOS[c.platform]} alt={c.platform} className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{c.platform}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                <Badge variant={STATUS_VARIANTS[c.status] ?? "outline"} className="text-[9px] font-bold uppercase tracking-widest px-2 h-5 rounded-md shadow-none">
                                                    {c.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right font-bold text-slate-900 dark:text-white">${c.daily_budget.toFixed(2)}</td>
                                            <td className="px-8 py-5 text-right font-medium text-slate-600 dark:text-slate-400">{c.conversions.toLocaleString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">{c.roas.toFixed(2)}x</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {connectPlatform && <IntegrationModal platform={connectPlatform} onClose={() => setConnectPlatform(null)} />}
        </div>
    );
}
