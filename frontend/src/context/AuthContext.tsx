import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Update this import

interface AuthContextProps {
  token: string;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string>('');
  const navigate = useNavigate(); // Update this line
  const location = useLocation(); // Add this line

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token') || '';
    setToken(storedToken);
    if (!storedToken && location.pathname !== '/register') { // Update this line
      navigate('/login'); // Update this line
    }
  }, [navigate, location.pathname]); // Update dependency array

  const handleLogin = (token: string) => {
    localStorage.setItem('access_token', token);
    setToken(token);
    navigate('/'); // Redirect to home page after login
  };

  return (
    <AuthContext.Provider value={{ token, setToken: handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
