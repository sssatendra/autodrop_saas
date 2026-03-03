import { Outlet, Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function AuthLayout() {
    return (
        <div className="relative grid min-h-screen lg:grid-cols-2">
            {/* Left panel — branding */}
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 p-10">
                <Link to="/" className="relative z-10 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AutoDrop</span>
                </Link>

                <div className="relative z-10 space-y-4">
                    <blockquote className="text-lg text-emerald-100/80 leading-relaxed max-w-md">
                        "We went from zero to 200 orders/day in 3 weeks. The AI product
                        discovery alone saved us 40 hours a month."
                    </blockquote>
                    <div>
                        <p className="text-sm font-semibold text-white">Marcus Elite</p>
                        <p className="text-sm text-emerald-300/60">Founder, DropElite</p>
                    </div>
                </div>

                {/* Background decorative elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-400/5 blur-2xl" />
                </div>
            </div>

            {/* Right panel — auth form */}
            <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
                <div className="w-full max-w-[420px] space-y-6">
                    {/* Mobile logo */}
                    <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">AutoDrop</span>
                    </Link>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
