import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Store, BarChart3 } from "lucide-react";

function App() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">AutoDrop</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Hero */}
            <main className="container mx-auto px-4 py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-4 inline-flex items-center rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Platform Status: Operational
                    </div>
                    <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
                        Automate Your{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                            Dropshipping
                        </span>{" "}
                        Empire
                    </h1>
                    <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
                        Discover trending products, push to your stores, automate ads, and
                        fulfill orders — all from one intelligent dashboard.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Button size="lg" className="gap-2">
                            <Zap className="h-4 w-4" />
                            Get Started Free
                        </Button>
                        <Button size="lg" variant="outline">
                            Watch Demo
                        </Button>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            icon: TrendingUp,
                            title: "AI Product Discovery",
                            description: "Global scraping engine discovers trending products ranked by a multi-factor viability score.",
                        },
                        {
                            icon: Store,
                            title: "One-Click Store Sync",
                            description: "Connect Shopify or WooCommerce via OAuth. Push products with AI-generated SEO descriptions.",
                        },
                        {
                            icon: BarChart3,
                            title: "Automated Ad Campaigns",
                            description: "Launch Meta & Google ads automatically. Track ROAS and conversions in real-time.",
                        },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
                <div className="container mx-auto px-4">
                    © 2026 AutoDrop. Phase 1 — Stack Operational.
                </div>
            </footer>
        </div>
    );
}

export default App;
