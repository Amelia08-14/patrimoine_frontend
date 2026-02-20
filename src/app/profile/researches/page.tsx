"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function ResearchesPage() {
  const router = useRouter()
  // Mock data for now, real endpoint would be /entrusted-research/my
  const [researches, setResearches] = useState<any[]>([])
  
  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token')
    if (!token) router.push('/auth/login')
    
    // Simulating empty list for now
    setResearches([])
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mes Recherches Confiées</h1>
      
      {researches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore confié de recherche.</p>
        </div>
      ) : (
        <div>Liste des recherches...</div>
      )}
    </div>
  )
}
