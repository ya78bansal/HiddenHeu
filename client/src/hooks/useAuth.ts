import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  preferredLanguage: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  preferredLanguage: string;
}

interface LoginData {
  username: string;
  password: string;
}

export function useAuth() {
  const { toast } = useToast();

  // Get current user
  const { data, isLoading, error } = useQuery<{ user: User | null }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Registration failed. Please try again.";
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Login Successful",
        description: "Welcome back to HiddenHeu!",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Login failed. Please check your credentials.";
      
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logout Successful",
        description: "You have been logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    user: data?.user || null,
    isAuthenticated: !!data?.user,
    isLoading,
    error,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
