"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock, Mail, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
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
        localStorage.setItem('token', result.access_token)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        // Redirection conditionnelle
        if (result.user.userType === 'ADMIN') {
            window.location.href = '/admin'
        } else if (!result.user.isProfileComplete) {
            window.location.href = '/profile/complete'
        } else {
            window.location.href = '/'
        }
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
    <div className="min-h-screen w-full flex bg-white">
      
      {/* Left Side - Visual (Full height, 45% width) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden">
         {/* Background Image */}
         <div 
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{ 
              backgroundImage: "url('/connexion.jpg')",
            }}
         />
         
         {/* Overlay with Brand Color */}
         <div className="absolute inset-0 bg-[#003B4A]/60 backdrop-blur-[2px]"></div>

         {/* Decorative Elements */}
         <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-[#00BFA6]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-purple-600"></div>
         </div>

         {/* Content Container */}
         <div className="relative z-10 flex flex-col justify-between w-full p-12 h-full">
           <div>
             
             <div className="space-y-6 mt-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 bg-[#00BFA6]/20 text-[#00BFA6]">
                  <Building2 size={16} />
                  Espace Membre
                </div>

                <h1 className="text-5xl font-bold text-white leading-tight">
                  Heureux de vous<br/>
                  revoir <span className="text-[#00BFA6]">parmi nous.</span>
                </h1>
                
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  Accédez à votre espace personnel pour gérer vos annonces, vos favoris et vos échanges.
                </p>
             </div>
           </div>

           {/* Big Icon Representation */}
           <div className="flex justify-center items-center flex-1 opacity-10">
              <Building2 className="w-64 h-64 text-white transform rotate-[12deg]" />
           </div>

           <div className="text-sm text-gray-400 font-medium">
             © 2026 Patrimoine Immobilier.
           </div>
         </div>
      </div>

      {/* Right Side - Form (Full height, 55% width) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Connexion</h2>
            <p className="mt-2 text-gray-500">
              Entrez vos identifiants pour accéder à votre compte.
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
                    className="w-full pl-12 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                    placeholder="Adresse email"
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
                    className="w-full pl-12 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                    placeholder="Mot de passe"
                  />
                  {errors.password && <p className="text-red-500 text-xs pl-1">{errors.password.message}</p>}
                </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#00BFA6] focus:ring-[#00BFA6] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-[#00BFA6] hover:text-[#00908A] transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full py-4 h-auto rounded-xl bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold text-lg shadow-lg shadow-[#00BFA6]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="font-bold text-[#003B4A] hover:text-[#00BFA6] transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
