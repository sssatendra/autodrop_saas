import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    TrendingUp,
    Store,
    BarChart3,
    Check,
    ArrowRight,
    ShieldCheck,
    Globe,
    Rocket,
} from "lucide-react";

const FEATURES = [
    {
        icon: TrendingUp,
        title: "AI Product Discovery",
        description:
            "Global scraping engine discovers trending products ranked by a multi-factor viability score.",
    },
    {
        icon: Store,
        title: "One-Click Store Sync",
        description:
            "Connect Shopify or WooCommerce via OAuth. Push products with AI-generated SEO descriptions.",
    },
    {
        icon: BarChart3,
        title: "Automated Ad Campaigns",
        description:
            "Launch Meta & Google ads automatically. Track ROAS and conversions in real-time.",
    },
    {
        icon: ShieldCheck,
        title: "Multi-Vendor Fulfillment",
        description:
            "Route orders to the best supplier automatically. Track shipments end-to-end.",
    },
    {
        icon: Globe,
        title: "Global Sourcing Network",
        description:
            "Products sourced from AliExpress, CJDropshipping, and vetted vendors worldwide.",
    },
    {
        icon: Rocket,
        title: "Subscription Billing",
        description:
            "Stripe & Razorpay support. Manage tiers, enforce limits, and handle upgrades seamlessly.",
    },
];

const PRICING_TIERS = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Explore trending products and test the waters.",
        highlighted: false,
        features: [
            "Browse Global Product Catalog",
            "Up to 5 Product Imports",
            "1 Connected Store",
            "Community Support",
        ],
        cta: "Start Free",
        ctaVariant: "outline" as const,
    },
    {
        name: "Starter",
        price: "$49",
        period: "/month",
        description: "Everything you need to launch your first store.",
        highlighted: false,
        features: [
            "1 Connected Store",
            "50 Active Products",
            "AI SEO Descriptions",
            "Order Pipeline & Tracking",
            "Email Support",
        ],
        cta: "Get Started",
        ctaVariant: "outline" as const,
    },
    {
        name: "Pro",
        price: "$149",
        period: "/month",
        description: "Scale with automated ads and unlimited products.",
        highlighted: true,
        features: [
            "Up to 3 Connected Stores",
            "Unlimited Active Products",
            "AI SEO Descriptions",
            "Automated Meta & Google Ads",
            "Campaign ROAS Dashboard",
            "Multi-Vendor Fulfillment",
            "Priority Support",
        ],
        cta: "Upgrade to Pro",
        ctaVariant: "default" as const,
    },
];

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* ─── Navbar ─── */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">AutoDrop</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Sign In</Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm" className="gap-1.5">
                                Get Started <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ─── Hero ─── */}
            <section className="relative overflow-hidden">
                <div className="container mx-auto px-4 py-24 sm:py-32">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Now in Open Beta — Free to try
                        </div>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                            Automate Your{" "}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                                Dropshipping
                            </span>{" "}
                            Empire
                        </h1>
                        <p className="mb-10 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                            Discover trending products globally, push to Shopify & WooCommerce, automate
                            Meta & Google Ads, and fulfill orders — all from one AI-powered dashboard.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/register">
                                <Button size="lg" className="gap-2 text-base px-8">
                                    <Zap className="h-4 w-4" />
                                    Start Free
                                </Button>
                            </Link>
                            <a href="#pricing">
                                <Button size="lg" variant="outline" className="text-base px-8">
                                    View Pricing
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            </section>

            {/* ─── Features ─── */}
            <section id="features" className="border-t border-border/40 bg-muted/30">
                <div className="container mx-auto px-4 py-24">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4">Features</Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Everything to run a profitable store
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                            From product discovery to order fulfillment — AutoDrop handles
                            the entire dropshipping lifecycle.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f) => (
                            <div
                                key={f.title}
                                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                            >
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pricing ─── */}
            <section id="pricing" className="border-t border-border/40">
                <div className="container mx-auto px-4 py-24">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4">Pricing</Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Simple, transparent pricing
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                            Start free, upgrade when you're ready. No hidden fees.
                        </p>
                    </div>
                    <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto items-stretch">
                        {PRICING_TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative flex flex-col rounded-xl border p-8 transition-all duration-300 hover:-translate-y-1 ${tier.highlighted
                                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]"
                                    : "border-border bg-card hover:shadow-lg"
                                    }`}
                            >
                                {tier.highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground px-3">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                                    <div className="mt-3 flex items-baseline gap-1">
                                        <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                                        <span className="text-sm text-muted-foreground">{tier.period}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-auto pt-4">
                                    <Link to="/register">
                                        <Button
                                            variant={tier.ctaVariant}
                                            className={`w-full ${tier.highlighted ? "shadow-md" : ""}`}
                                        >
                                            {tier.cta}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-border py-10">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-semibold">AutoDrop</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 AutoDrop. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
