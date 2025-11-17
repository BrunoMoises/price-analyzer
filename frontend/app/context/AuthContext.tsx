'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  avatar_url: string
}

interface AuthContextType {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (jwtToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'price_analyzer_jwt'

export const createAuthHeaders = (additionalHeaders?: Record<string, string>): HeadersInit => {
    const headers = new Headers(additionalHeaders);
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    
    if (storedToken) {
        headers.set('Authorization', `Bearer ${storedToken}`);
    }
    
    return headers; 
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    async function fetchMe() {
        if (!token) return
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
            const res = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const userData = await res.json()
                setUser(userData)
            } else {
                logout() 
            }
        } catch (error) {
            console.error(error)
        }
    }
    fetchMe()
  }, [token])

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
    user,
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