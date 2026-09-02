"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { Lock, Mail, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const t = useTranslations("Auth.login")
  const [isLoading, setIsLoading] = useState(false)

  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordTooShort")),
  })

  type LoginForm = z.infer<typeof loginSchema>

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: data.email.trim().toLowerCase(),
        }),
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
        const error = await response.json().catch(() => null)
        const message = Array.isArray(error?.message)
          ? error.message.join("\n")
          : error?.message
        alert(message || t("invalidCredentials"))
      }
    } catch (error) {
      alert(t("connectionError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-transparent">
      
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
                  {t("memberSpace")}
                </div>

                <h1 className="text-5xl font-bold text-white leading-tight">
                  {t.rich("welcomeBack", { hl: (chunks) => <span className="text-[#00BFA6]">{chunks}</span> })}
                </h1>

                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  {t("heroDescription")}
                </p>
             </div>
           </div>

           {/* Big Icon Representation */}
           <div className="flex justify-center items-center flex-1 opacity-10">
              <Building2 className="w-64 h-64 text-white transform rotate-[12deg]" />
           </div>

           <div className="text-sm text-gray-400 font-medium">
             © {new Date().getFullYear()} Patrimoine Immobilier.
           </div>
         </div>
      </div>

      {/* Right Side - Form (Full height, 55% width) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-white dark:bg-white/5">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t("title")}</h2>
            <p className="mt-2 text-gray-500 dark:text-white/50">
              {t("subtitle")}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00BFA6]">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-white/40 group-focus-within:text-[#00BFA6]" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full pl-12 px-4 py-3.5 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500"
                    placeholder={t("emailPlaceholder")}
                  />
                  {errors.email && <p className="text-red-500 text-xs pl-1">{errors.email.message}</p>}
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00BFA6]">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-white/40 group-focus-within:text-[#00BFA6]" />
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    className="w-full pl-12 px-4 py-3.5 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500"
                    placeholder={t("passwordPlaceholder")}
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
                  className="h-4 w-4 text-[#00BFA6] focus:ring-[#00BFA6] border-gray-300 dark:border-white/15 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-white/60 cursor-pointer select-none">
                  {t("rememberMe")}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-[#00BFA6] hover:text-[#00908A] transition-colors">
                  {t("forgotPassword")}
                </a>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full py-4 h-auto rounded-xl bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold text-lg shadow-lg shadow-[#00BFA6]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
              {isLoading ? t("loggingIn") : t("submit")}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-white/50">
              {t("noAccount")}{' '}
              <Link href="/auth/register" className="font-bold text-[#003B4A] hover:text-[#00BFA6] transition-colors">
                {t("createAccount")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
