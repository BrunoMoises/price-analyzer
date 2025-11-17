'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (jwtToken: string) => void
  logout: () => void
}

export const createAuthHeaders = (additionalHeaders?: Record<string, string>): HeadersInit => {
    const headers = new Headers(additionalHeaders);
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    
    if (storedToken) {
        headers.set('Authorization', `Bearer ${storedToken}`);
    }
    
    return headers; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'price_analyzer_jwt'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const login = useCallback((jwtToken: string) => {
    localStorage.setItem(TOKEN_KEY, jwtToken)
    setToken(jwtToken)
    router.push('/')
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    router.push('/auth/login')
  }, [router])

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const getAuthHeader = () => {
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  
  if (storedToken) {
    return { 'Authorization': `Bearer ${storedToken}` }
  }
  
  return {} 
}