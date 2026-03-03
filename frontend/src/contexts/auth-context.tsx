import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (companyName: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // On mount, check if we already have a valid session cookie
    useEffect(() => {
        api
            .get<{ user: User }>("/auth/me")
            .then((r) => setUser(r.data.user))
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { data } = await api.post<{ user: User }>("/auth/login", { email, password });
        setUser(data.user);
        navigate("/app");
    }, [navigate]);

    const register = useCallback(async (
        companyName: string,
        email: string,
        password: string,
    ) => {
        const { data } = await api.post<{ user: User }>("/auth/register", {
            companyName,
            email,
            password,
        });
        setUser(data.user);
        navigate("/app");
    }, [navigate]);

    const logout = useCallback(async () => {
        await api.post("/auth/logout").catch(() => null);
        setUser(null);
        navigate("/login");
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
