import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  logoUrl: string;
  companyName: string;
  whatsappNumber: string;
  shippingCost: number;
  lateFeePercentage: number;
}

const defaultTheme: ThemeConfig = {
  primaryColor: '#2563eb', // blue-600
  backgroundColor: '#f3f4f6', // gray-100
  logoUrl: 'https://picsum.photos/seed/distribuidora/200/100',
  companyName: 'Distribuidora Central',
  whatsappNumber: '1234567890', // Default placeholder
  shippingCost: 2500,
  lateFeePercentage: 10,
};

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('app-theme', JSON.stringify(theme));
    // Apply CSS variables to root
    document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--color-background', theme.backgroundColor);
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
