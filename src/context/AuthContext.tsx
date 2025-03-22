import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string,phone_number:Text, password: string) => Promise<{ isNewAccount: boolean } | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          const { 
            user: { id, email, user_metadata }
          } = data.session;
          
          setUser({
            id,
            name: user_metadata.name || email?.split('@')[0] || 'User',
            email: email || ''
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        console.error('Error checking auth session:', err);
        setError(err.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Check if the current URL has a confirmation hash for email verification
    const handleEmailConfirmation = async () => {
      if (window.location.hash.includes('#access_token')) {
        // Handle the redirect from email confirmation
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
          toast.success("Email confirmed successfully! Please log in.");
          navigate('/login');
        }
        if (error) {
          toast.error("Failed to confirm email. Please try again.");
        }
      }
    };
    
    handleEmailConfirmation();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (session) {
          const { 
            user: { id, email, user_metadata }
          } = session;
          
          setUser({
            id,
            name: user_metadata.name || email?.split('@')[0] || 'User',
            email: email || ''
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast.success("Welcome back!");
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      toast.error(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string,phone_number:Text, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
        // First attempt to sign up the user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name,phone_number } },
        });

        if (error) {
            // If the error indicates the user already exists
            if (error.message.includes('User already registered')) {
                setError("This email is already registered. Please log in instead.");
                toast.error("This email is already registered. Please log in instead.");
                navigate("/login?email-exists=true");
                return null;
            }
            throw error;
        }

        if (data?.user) {
            toast.success("Please check your email for a confirmation link to complete your registration.");
            return { isNewAccount: true };
        }

        return null;
    } catch (err: any) {
        console.error("Signup error:", err);
        setError(err?.message || "An unexpected error occurred");
        toast.error(err?.message || "Failed to sign up");
        return null;
    } finally {
        setIsLoading(false);
    }
};

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("You've been logged out");
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error(err.message || "Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        error,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
