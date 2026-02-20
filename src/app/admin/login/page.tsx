"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock, Mail, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Check if user is actually admin
        if (result.user.userType !== 'ADMIN') {
            alert("Accès refusé : Vous n'avez pas les droits d'administrateur")
            setIsLoading(false)
            return
        }

        // Store in dedicated Admin storage keys
        localStorage.setItem('admin_token', result.access_token)
        localStorage.setItem('admin_user', JSON.stringify(result.user))
        
        window.location.href = '/admin'
      } else {
        alert("Email ou mot de passe incorrect")
      }
    } catch (error) {
      alert("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-900">
      
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-[#002b36]">
         <div className="absolute inset-0 bg-[#003B4A]/80 backdrop-blur-sm"></div>

         <div className="relative z-10 flex flex-col justify-between w-full p-12 h-full">
           <div>
             <div className="space-y-6 mt-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-white/10 bg-white/10 text-white">
                  <ShieldCheck size={16} />
                  Administration
                </div>

                <h1 className="text-5xl font-bold text-white leading-tight">
                  Portail de <br/>
                  <span className="text-[#00BFA6]">Gestion.</span>
                </h1>
                
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  Accès réservé aux administrateurs de la plateforme Patrimoine Immobilier.
                </p>
             </div>
           </div>

           <div className="flex justify-center items-center flex-1 opacity-10">
              <ShieldCheck className="w-64 h-64 text-white" />
           </div>

           <div className="text-sm text-gray-400 font-medium">
             © 2026 Patrimoine Immobilier - Admin
           </div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Connexion Admin</h2>
            <p className="mt-2 text-sm text-gray-500">
              Session indépendante de votre compte utilisateur.
            </p>
          </div>
        
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00BFA6]">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#00BFA6]" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full pl-12 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                    placeholder="Email administrateur"
                  />
                  {errors.email && <p className="text-red-500 text-xs pl-1">{errors.email.message}</p>}
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00BFA6]">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#00BFA6]" />
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    className="w-full pl-12 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                    placeholder="Mot de passe"
                  />
                  {errors.password && <p className="text-red-500 text-xs pl-1">{errors.password.message}</p>}
                </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full py-6 h-auto rounded-xl bg-[#003B4A] hover:bg-[#002b36] text-white font-bold text-lg shadow-lg transition-all">
              {isLoading ? "Connexion..." : "Accéder au panel"}
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Retour au site public
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
