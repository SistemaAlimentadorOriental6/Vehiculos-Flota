"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: string | null
  login: (username: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("sao6_user")
    const storedAuthTime = localStorage.getItem("sao6_auth_time")

    if (storedUser && storedAuthTime) {
      const authTime = Number.parseInt(storedAuthTime, 10)
      const currentTime = new Date().getTime()
      const sessionDuration = 8 * 60 * 60 * 1000 // 8 horas en milisegundos

      if (currentTime - authTime < sessionDuration) {
        setUser(storedUser)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("sao6_user")
        localStorage.removeItem("sao6_auth_time")
      }
    }

    setIsLoading(false)
  }, [])

  const login = (username: string) => {
    setUser(username)
    setIsAuthenticated(true)

    localStorage.setItem("sao6_user", username)
    localStorage.setItem("sao6_auth_time", new Date().getTime().toString())
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)

    localStorage.removeItem("sao6_user")
    localStorage.removeItem("sao6_auth_time")
  }

  if (isLoading) {
    return null
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>
}

