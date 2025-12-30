import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'trainer' | 'learner';
  avatar_url?: string;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'trainer' | 'learner') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a backend DRF token is present, load profile from server. This avoids relying on Supabase.
    const token = localStorage.getItem('trainerToken');
    if (token) {
      (async () => {
        try {
          const resp = await fetch('/api/profiles/me/', { headers: { 'Authorization': `Token ${token}` } });
          if (resp.ok) {
            const data = await resp.json();
            setProfile(data);
          } else {
            // token invalid or expired
            localStorage.removeItem('trainerToken');
            setProfile(null);
          }
        } catch (err) {
          console.error('Error loading profile:', err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('trainerToken');
      if (!token) {
        setProfile(null);
        return;
      }
      const resp = await fetch('/api/profiles/me/', { headers: { 'Authorization': `Token ${token}` } });
      if (resp.ok) {
        const data = await resp.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Authenticate against the Django backend and store DRF token for API calls
    console.log('signIn attempt:', email);
    try {
      const resp = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      console.log('signIn response status:', resp.status);
      
      if (!resp.ok) {
        let errMsg = 'Invalid credentials';
        try {
          const errData = await resp.json();
          console.log('signIn error response:', errData);
          errMsg = errData.detail || errData.error || JSON.stringify(errData) || errMsg;
        } catch (e) {
          const text = await resp.text();
          console.log('signIn error text:', text);
          if (text) errMsg = text;
        }
        throw new Error(errMsg);
      }
      
      const data = await resp.json();
      console.log('signIn success, token:', data.token);
      localStorage.setItem('trainerToken', data.token);
      
      // Load profile after successful login
      try {
        await loadProfile();
        console.log('Profile loaded successfully');
      } catch (err) {
        console.warn('Could not load profile after login:', err);
      }
    } catch (err: any) {
      console.error('signIn error:', err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'trainer' | 'learner') => {
    // Create user in Django users table and return token
    const resp = await fetch('/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, role })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Signup failed');
    }
    const data = await resp.json();
    localStorage.setItem('trainerToken', data.token);
    setProfile(data.user);
  };

  const signOut = async () => {
    localStorage.removeItem('trainerToken');
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
