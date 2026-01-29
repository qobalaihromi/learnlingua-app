"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "jp"

interface SpaceContextType {
  currentLanguage: Language | null
  setLanguage: (lang: Language | null) => void
  label: string
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined)

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)

  // Persist functionality could be added here later (reading from localStorage)
  useEffect(() => {
    const saved = localStorage.getItem("f_space_lang") as Language | null
    if (saved) {
        setCurrentLanguage(saved)
    } else {
        // Default to English if nothing saved
        setCurrentLanguage("en")
    }
  }, [])

  const setLanguage = (lang: Language | null) => {
    setCurrentLanguage(lang)
    if (lang) {
        localStorage.setItem("f_space_lang", lang)
    } else {
        localStorage.removeItem("f_space_lang")
    }
  }

  const label = currentLanguage === "en" ? "English Space" : currentLanguage === "jp" ? "Japanese Space" : "All Spaces"

  return (
    <SpaceContext.Provider value={{ currentLanguage, setLanguage, label }}>
      {children}
    </SpaceContext.Provider>
  )
}

export function useSpace() {
  const context = useContext(SpaceContext)
  if (context === undefined) {
    throw new Error("useSpace must be used within a SpaceProvider")
  }
  return context
}
