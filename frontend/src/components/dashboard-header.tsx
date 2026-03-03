import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
    title: string;
    description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
    const { user } = useAuth();

    return (
        <header className="px-6 pt-6 pb-2">
            <div className="flex h-16 items-center justify-between glass rounded-2xl px-6">
                <div>
                    <h1 className="text-lg font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-xs font-medium text-muted-foreground/80">{description}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-800/5 hover:text-primary transition-colors">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-white" />
                    </Button>
                    <div className="h-6 w-px bg-slate-200/50 dark:bg-white/10 mx-1" />
                    <ThemeToggle />
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 text-xs font-bold text-primary-foreground transform transition-transform hover:scale-110 cursor-pointer">
                        {(user?.full_name ?? user?.email ?? "?")[0]?.toUpperCase() ?? "?"}
                    </div>
                </div>
            </div>
        </header>
    );
}
