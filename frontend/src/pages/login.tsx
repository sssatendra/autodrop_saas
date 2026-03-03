import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import type { AxiosError } from "axios";
import type { ApiError } from "@/lib/types";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const { login } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async ({ email, password }: LoginFormData) => {
        setServerError(null);
        try {
            await login(email, password);
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            setServerError(axiosErr.response?.data?.error ?? "Login failed. Please try again.");
        }
    };

    return (
        <>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                    Sign in to your AutoDrop workspace
                </p>
            </div>

            {serverError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            to="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    Sign In
                </Button>
            </form>

            <Separator />

            <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                    Create one free
                </Link>
            </p>
        </>
    );
}
