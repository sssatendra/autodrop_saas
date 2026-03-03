import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import type { AxiosError } from "axios";
import type { ApiError } from "@/lib/types";

const registerSchema = z
    .object({
        companyName: z.string().min(2, "Company name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const { register: registerUser } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async ({ companyName, email, password }: RegisterFormData) => {
        setServerError(null);
        setFieldErrors({});
        try {
            await registerUser(companyName, email, password);
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            const data = axiosErr.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
            } else {
                setServerError(data?.error ?? "Registration failed. Please try again.");
            }
        }
    };

    return (
        <>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
                <p className="text-sm text-muted-foreground">
                    Start automating your dropshipping in under 2 minutes
                </p>
            </div>

            {serverError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                        id="companyName"
                        placeholder="Acme Dropshipping"
                        autoComplete="organization"
                        disabled={isSubmitting}
                        {...register("companyName")}
                    />
                    {(errors.companyName || fieldErrors.companyName) && (
                        <p className="text-xs text-destructive">
                            {errors.companyName?.message ?? fieldErrors.companyName}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...register("email")}
                    />
                    {(errors.email || fieldErrors.email) && (
                        <p className="text-xs text-destructive">
                            {errors.email?.message ?? fieldErrors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                        id="reg-password"
                        type="password"
                        placeholder="Min. 8 chars, 1 uppercase, 1 number"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}
                    Create Account
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    By creating an account you agree to our{" "}
                    <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
                    <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
                </p>
            </form>

            <Separator />

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
        </>
    );
}
