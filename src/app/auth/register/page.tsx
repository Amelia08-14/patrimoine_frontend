"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock, Mail, Phone, Building2, User, FileText, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const registerSchema = z.object({
  userType: z.enum(["PARTICULIER", "SOCIETE"]),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
  confirmPassword: z.string(),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  
  // Particulier
  firstName: z.string().optional(),
  lastName: z.string().optional(),

  // Société
  companyName: z.string().optional(),
  activityType: z.string().optional(),
  commercialRegister: z.string().optional(),
  agreementNumber: z.string().optional(),
  townId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    });
  }
  if (data.userType === "PARTICULIER") {
    if (!data.firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prénom requis", path: ["firstName"] });
    if (!data.lastName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nom requis", path: ["lastName"] });
  }
  if (data.userType === "SOCIETE") {
    if (!data.companyName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Raison sociale requise", path: ["companyName"] });
    if (!data.activityType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type d'activité requis", path: ["activityType"] });
  }
});

type RegisterForm = z.infer<typeof registerSchema>

const ACTIVITY_TYPES = [
  { id: 'AGENCE_IMMOBILIERE', label: 'Agence immobilière' },
  { id: 'PROMOTEUR_IMMOBILIER', label: 'Promoteur immobilier' },
  { id: 'HOTELLERIE_HEBERGEMENT', label: 'Hôtellerie / hébergement' },
  { id: 'SALLE_DES_FETES', label: 'Salle des fêtes' },
  { id: 'ENTREPOSAGE_FRIGORIFIQUE', label: 'Entreposage frigorifique' },
  { id: 'ENTREPOSAGE_NON_FRIGORIFIQUE', label: 'Entreposage non frigorifique' },
]

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<"PARTICULIER" | "SOCIETE">("PARTICULIER")

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "PARTICULIER"
    }
  })

  const selectedActivity = watch("activityType")

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      // Clean up data based on type
      const payload = {
        ...data,
        userType, // Ensure userType is set from state if needed, or form data
        // Remove undefined fields to avoid sending empty strings
        ...(userType === "PARTICULIER" ? {
          companyName: undefined,
          activityType: undefined,
          commercialRegister: undefined,
          agreementNumber: undefined,
          townId: undefined
        } : {
          firstName: undefined,
          lastName: undefined
        })
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Rediriger vers une page de succès ou afficher un message modal
        alert("Inscription réussie ! Veuillez vérifier la console du serveur pour le lien d'activation (Simulation Locale).")
        // Optionnel: window.location.href = '/auth/check-email'
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          alert("Cet email est déjà utilisé. Veuillez vous connecter.")
        } else {
          alert(`Erreur: ${errorData.message}`)
        }
      }
    } catch (error) {
      alert("Une erreur est survenue lors de l'inscription.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* Left Side - Visual (Full height, 45% width) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden transition-all duration-700 ease-in-out">
         {/* Dynamic Background Image */}
         <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
            style={{ 
              backgroundImage: userType === 'PARTICULIER' ? "url('/particulier.jpg')" : "url('/société.jpg')",
            }}
         />
         
         {/* Overlay with Brand Color */}
         <div className="absolute inset-0 bg-[#003B4A]/60 backdrop-blur-[2px] transition-colors duration-700"></div>

         {/* Decorative Elements */}
         <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
            <div className={cn(
              "absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000",
              userType === 'PARTICULIER' ? "bg-[#00BFA6]" : "bg-blue-600"
            )}></div>
            <div className={cn(
              "absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000",
              userType === 'PARTICULIER' ? "bg-[#00BFA6]" : "bg-purple-600"
            )}></div>
         </div>

         {/* Content Container */}
         <div className="relative z-10 flex flex-col justify-between w-full p-12 h-full">
           <div>
             
             <div className="space-y-6 mt-20">
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 transition-all duration-500",
                  userType === 'PARTICULIER' ? "bg-[#00BFA6]/20 text-[#00BFA6]" : "bg-blue-500/20 text-blue-400"
                )}>
                  {userType === 'PARTICULIER' ? <User size={16} /> : <Building2 size={16} />}
                  {userType === 'PARTICULIER' ? "Espace Particulier" : "Espace Professionnel"}
                </div>

                <h1 className="text-5xl font-bold text-white leading-tight">
                  {userType === 'PARTICULIER' ? (
                    <>
                      Trouvez le bien<br/>
                      de vos <span className="text-[#00BFA6]">rêves.</span>
                    </>
                  ) : (
                    <>
                      Développez votre<br/>
                      <span className="text-blue-400">Patrimoine.</span>
                    </>
                  )}
                </h1>
                
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  {userType === 'PARTICULIER' 
                    ? "Accédez à des milliers d'annonces exclusives et gérez vos favoris en toute simplicité."
                    : "Une suite d'outils puissants pour les agences, promoteurs et professionnels de l'immobilier."
                  }
                </p>
             </div>
           </div>

           {/* Big Icon Representation */}
           <div className="flex justify-center items-center flex-1 opacity-10">
              {userType === 'PARTICULIER' ? (
                <User className="w-64 h-64 text-white transform rotate-[-12deg]" />
              ) : (
                <Building2 className="w-64 h-64 text-white transform rotate-[12deg]" />
              )}
           </div>

           <div className="text-sm text-gray-400 font-medium">
             © 2026 Patrimoine Immobilier.
           </div>
         </div>
      </div>

      {/* Right Side - Form (Full height, 55% width, Scrollable) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-2xl space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Créer un compte</h2>
            <p className="mt-2 text-gray-500">
              Sélectionnez votre type de compte pour commencer.
            </p>
          </div>

          {/* Modern Tabs */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { setUserType("PARTICULIER"); setValue("userType", "PARTICULIER"); }}
              className={cn(
                "relative group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300",
                userType === "PARTICULIER" 
                  ? "border-[#00BFA6] bg-[#00BFA6]/5" 
                  : "border-gray-100 hover:border-[#00BFA6]/50 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                userType === "PARTICULIER" ? "bg-[#00BFA6] text-white shadow-lg shadow-[#00BFA6]/30" : "bg-gray-100 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
              )}>
                <User size={24} strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <span className={cn("block text-sm font-bold", userType === "PARTICULIER" ? "text-[#003B4A]" : "text-gray-500")}>Particulier</span>
                <span className="text-[10px] text-gray-400 font-medium">Pour usage personnel</span>
              </div>
              
              {userType === "PARTICULIER" && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#00BFA6]"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setUserType("SOCIETE"); setValue("userType", "SOCIETE"); }}
              className={cn(
                "relative group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300",
                userType === "SOCIETE" 
                  ? "border-[#00BFA6] bg-[#00BFA6]/5" 
                  : "border-gray-100 hover:border-[#00BFA6]/50 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                userType === "SOCIETE" ? "bg-[#00BFA6] text-white shadow-lg shadow-[#00BFA6]/30" : "bg-gray-100 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
              )}>
                <Building2 size={24} strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <span className={cn("block text-sm font-bold", userType === "SOCIETE" ? "text-[#003B4A]" : "text-gray-500")}>Société</span>
                <span className="text-[10px] text-gray-400 font-medium">Pour les professionnels</span>
              </div>

              {userType === "SOCIETE" && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#00BFA6]"></div>
              )}
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* --- FORMULAIRE PARTICULIER --- */}
            {userType === "PARTICULIER" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    {...register("firstName")}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                    placeholder="Prénom *"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs pl-1">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1">
                  <input
                    {...register("lastName")}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                    placeholder="Nom *"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs pl-1">{errors.lastName.message}</p>}
                </div>
              </div>
            )}

            {/* --- FORMULAIRE SOCIETE --- */}
            {userType === "SOCIETE" && (
              <div className="space-y-6">
                 {/* Activity Type Grid */}
                 <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Type d'activité *</label>
                    <div className="grid grid-cols-2 gap-3">
                       {ACTIVITY_TYPES.map((type) => (
                          <div 
                            key={type.id}
                            onClick={() => setValue("activityType", type.id)}
                            className={cn(
                              "cursor-pointer border rounded-xl p-4 text-xs font-bold text-center transition-all duration-200 hover:border-[#00BFA6] flex items-center justify-center min-h-[60px]",
                              selectedActivity === type.id 
                                ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A] ring-1 ring-[#00BFA6]" 
                                : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
                            )}
                          >
                             {type.label}
                          </div>
                       ))}
                    </div>
                    {errors.activityType && <p className="text-red-500 text-xs pl-1">{errors.activityType.message}</p>}
                 </div>

                 <div className="space-y-1">
                   <input
                      {...register("companyName")}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                      placeholder="Raison Sociale *"
                   />
                   {errors.companyName && <p className="text-red-500 text-xs pl-1">{errors.companyName.message}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <input
                      {...register("commercialRegister")}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                      placeholder="N° Registre Commerce"
                    />
                    <input
                      {...register("agreementNumber")}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                      placeholder="N° d'Agrément"
                    />
                 </div>
              </div>
            )}

            {/* --- CHAMPS COMMUNS --- */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00BFA6]">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#00BFA6]" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full pl-12 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                  placeholder="Adresse email *"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs pl-1">{errors.email.message}</p>}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#00BFA6]" />
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full pl-12 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                  placeholder="Numéro de téléphone *"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs pl-1">{errors.phone.message}</p>}

              <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#00BFA6]" />
                    </div>
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full pl-12 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                      placeholder="Mot de passe *"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#00BFA6]" />
                    </div>
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      className="w-full pl-12 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                      placeholder="Confirmer *"
                    />
                  </div>
              </div>
              {(errors.password || errors.confirmPassword) && (
                  <p className="text-red-500 text-xs pl-1">
                      {errors.password?.message || errors.confirmPassword?.message}
                  </p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full py-4 h-auto rounded-xl bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold text-lg shadow-lg shadow-[#00BFA6]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                {isLoading ? "Création en cours..." : "Créer mon compte"}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="font-bold text-[#003B4A] hover:text-[#00BFA6] transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
