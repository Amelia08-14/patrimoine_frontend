"use client"

import { useEffect, useState, type ComponentType } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock, Mail, Phone, Building2, User, Building, Hotel, PartyPopper, Warehouse, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"

const numberFromForm = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined
  if (typeof v === "number" && Number.isNaN(v)) return undefined
  return v
}, z.number().optional())

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
  cityCode: numberFromForm,
  townCode: numberFromForm,
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
    if (!data.commercialRegister) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registre de commerce requis", path: ["commercialRegister"] });
    if (!data.cityCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wilaya requise", path: ["cityCode"] });
    if (!data.townCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Commune requise", path: ["townCode"] });
  }
});

type RegisterFormInput = z.input<typeof registerSchema>
type RegisterFormOutput = z.output<typeof registerSchema>

type ActivityFamilyId = "IMMOBILIER" | "HOTELLERIE" | "EVENEMENTIEL" | "ENTREPOSAGE"

const ACTIVITY_FAMILIES: Array<{
  id: ActivityFamilyId
  label: string
  image: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  accent: string
  items: Array<{ id: string; label: string }>
}> = [
  {
    id: "IMMOBILIER",
    label: "Activités Immobilières",
    image: "/immobilier.jpg",
    icon: Building,
    accent: "text-[#00BFA6]",
    items: [
      { id: "AGENCE_IMMOBILIERE", label: "Agence Immobilière" },
      { id: "PROMOTEUR_IMMOBILIER", label: "Promoteur Immobilier" },
      { id: "ADMINISTRATEUR_BIENS", label: "Administrateur de biens" },
      { id: "AUTRES_PROFESSIONNELS", label: "Autres Professionnels" },
    ],
  },
  {
    id: "HOTELLERIE",
    label: "Activité Hôtelière et\nHébergement",
    image: "/hotel.jpg",
    icon: Hotel,
    accent: "text-orange-500",
    items: [
      { id: "HOTEL", label: "Hôtel" },
      { id: "COMPLEXE_TOURISTIQUE", label: "Complexe Touristiques" },
      { id: "VILLAGE_VACANCES", label: "Village de vacances" },
      { id: "APPART_HOTEL", label: "Appart Hôtel" },
      { id: "RESIDENCE_HOTELIERE", label: "Résidence Hôtelière" },
      { id: "MOTEL", label: "Motel" },
      { id: "RELAIS_ROUTIER", label: "Relais routier" },
      { id: "CAMPING_TOURISTIQUE", label: "Camping Touristique" },
      { id: "AUTRES_STRUCTURES", label: "Autres Structures" },
    ],
  },
  {
    id: "EVENEMENTIEL",
    label: "Activité évènementiel",
    image: "/event.jpg",
    icon: PartyPopper,
    accent: "text-red-500",
    items: [
      { id: "SALLE_DES_FETES", label: "Salle Des fêtes" },
      { id: "SALLES_DINATOIRES", label: "Salles Dinatoires" },
      { id: "SALLE_FORMATION", label: "Salle de formation" },
      { id: "SALLE_CONFERENCE", label: "Salle de conférence" },
      { id: "AUTRES_EVENEMENTIEL", label: "Autres" },
    ],
  },
  {
    id: "ENTREPOSAGE",
    label: "Activités d'entreposage et de stockage",
    image: "/stockage.jpg",
    icon: Warehouse,
    accent: "text-slate-600",
    items: [
      { id: "ENTREPOSAGE_FRIGORIFIQUE", label: "Entreposage et stockage frigorifiques" },
      { id: "ENTREPOSAGE_NON_FRIGORIFIQUE", label: "Entreposage et stockage non frigorifiques" },
      { id: "AUTRES_ENTREPOSAGE_STOCKAGE", label: "Autres" },
    ],
  },
]

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<"PARTICULIER" | "SOCIETE">("PARTICULIER")
  const [activityFamily, setActivityFamily] = useState<ActivityFamilyId | null>(null)
  const [cities, setCities] = useState<Array<{ id: number; nameFr?: string; name?: string }>>([])
  const [towns, setTowns] = useState<Array<{ id: number; nameFr?: string; name?: string }>>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingTowns, setIsLoadingTowns] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormInput, any, RegisterFormOutput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "PARTICULIER"
    }
  })

  const selectedActivity = watch("activityType")
  const selectedCityCode = watch("cityCode") as unknown as number | undefined

  const selectedFamily = activityFamily ? ACTIVITY_FAMILIES.find(f => f.id === activityFamily) : null

  useEffect(() => {
    if (userType === "SOCIETE" && !activityFamily) {
      setActivityFamily(ACTIVITY_FAMILIES[0].id)
    }
    if (userType === "PARTICULIER") {
      setActivityFamily(null)
      setValue("activityType", undefined)
      setValue("companyName", undefined)
      setValue("commercialRegister", undefined)
      setValue("cityCode", undefined)
      setValue("townCode", undefined)
    }
  }, [activityFamily, setValue, userType])

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true)
      try {
        setCities(
          WILAYAS.map((w) => ({
            id: Number(w.code),
            nameFr: w.name,
          })).sort((a, b) => a.id - b.id)
        )
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchCities()
  }, [])

  useEffect(() => {
    const fetchTowns = async () => {
      if (!selectedCityCode) {
        setTowns([])
        setValue("townCode", undefined)
        return
      }
      setIsLoadingTowns(true)
      try {
        const wilayaCode = String(selectedCityCode).padStart(2, "0")
        setTowns(
          COMMUNES.filter((c) => c.wilayaCode === wilayaCode)
            .map((c) => ({ id: Number(c.id), nameFr: c.name }))
            .sort((a, b) => (a.nameFr || "").localeCompare(b.nameFr || "", "fr"))
        )
      } finally {
        setIsLoadingTowns(false)
      }
    }
    fetchTowns()
  }, [selectedCityCode, setValue])

  const onSubmit = async (data: RegisterFormOutput) => {
    setIsLoading(true)
    try {
      const { confirmPassword, ...rest } = data
      // Clean up data based on type
      const payload = {
        ...rest,
        userType, // Ensure userType is set from state if needed, or form data
        // Remove undefined fields to avoid sending empty strings
        ...(userType === "PARTICULIER" ? {
          companyName: undefined,
          activityType: undefined,
          commercialRegister: undefined,
          cityCode: undefined,
          townCode: undefined
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
              backgroundImage: userType === 'PARTICULIER'
                ? "url('/particulier.jpg')"
                : `url('${selectedFamily?.image || "/société.jpg"}')`,
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
                  {userType === 'PARTICULIER' ? "Espace Particulier" : (selectedFamily?.label || "Espace Professionnel")}
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
              {(() => {
                const FamilyIcon = selectedFamily?.icon
                if (userType === "PARTICULIER") {
                  return <User className="w-64 h-64 text-white transform rotate-[-12deg]" />
                }
                if (FamilyIcon) {
                  return <FamilyIcon className="w-64 h-64 text-white transform rotate-[12deg]" />
                }
                return <Building2 className="w-64 h-64 text-white transform rotate-[12deg]" />
              })()}
           </div>

           <div className="text-sm text-gray-400 font-medium">
             © 2026 Patrimoine Immobilier.
           </div>
         </div>
      </div>

      {/* Right Side - Form (Full height, 55% width, Scrollable) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-2xl space-y-6 sm:space-y-8 pb-16 md:pb-0">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Créer un compte</h2>
            <p className="mt-2 text-gray-500">
              Sélectionnez votre type de compte pour commencer.
            </p>
          </div>

          {/* Type de compte */}
          <div className="flex justify-center gap-6 sm:gap-16">
            <button
              type="button"
              onClick={() => { setUserType("PARTICULIER"); setValue("userType", "PARTICULIER"); }}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4 relative",
                userType === "PARTICULIER"
                  ? "bg-white border-[#00BFA6] shadow-[0_8px_16px_rgba(0,191,166,0.25)] -translate-y-0.5"
                  : "bg-white border-gray-100 shadow-[0_8px_16px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/30 group-hover:-translate-y-0.5"
              )}>
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                  userType === "PARTICULIER"
                    ? "bg-[#00BFA6] text-white"
                    : "bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
                )}>
                  <User className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
              </div>
              <div className="text-center">
                <span className={cn(
                  "block text-sm font-extrabold transition-colors",
                  userType === "PARTICULIER" ? "text-[#00BFA6]" : "text-gray-500 group-hover:text-[#00BFA6]"
                )}>
                  Particulier
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Pour usage personnel</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setUserType("SOCIETE"); setValue("userType", "SOCIETE"); }}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4 relative",
                userType === "SOCIETE"
                  ? "bg-white border-[#00BFA6] shadow-[0_8px_16px_rgba(0,191,166,0.25)] -translate-y-0.5"
                  : "bg-white border-gray-100 shadow-[0_8px_16px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/30 group-hover:-translate-y-0.5"
              )}>
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                  userType === "SOCIETE"
                    ? "bg-[#00BFA6] text-white"
                    : "bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
                )}>
                  <Building2 className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
              </div>
              <div className="text-center">
                <span className={cn(
                  "block text-sm font-extrabold transition-colors",
                  userType === "SOCIETE" ? "text-[#00BFA6]" : "text-gray-500 group-hover:text-[#00BFA6]"
                )}>
                  Société
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Pour les professionnels</span>
              </div>
            </button>
          </div>

          <div className="h-px bg-gray-100"></div>
          
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
                 <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 md:gap-y-8 md:gap-x-6 justify-items-center">
                      {ACTIVITY_FAMILIES.map((family) => {
                        const Icon = family.icon
                        const isActive = activityFamily === family.id
                        return (
                          <button
                            key={family.id}
                            type="button"
                            onClick={() => {
                              setActivityFamily(family.id)
                              setValue("activityType", undefined)
                            }}
                            className="flex flex-col items-center gap-3 cursor-pointer group w-full"
                          >
                            <div
                              className={cn(
                                "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-200 border-4 relative",
                                isActive
                                  ? "bg-white border-[#00BFA6] shadow-[0_8px_16px_rgba(0,191,166,0.25)] -translate-y-0.5"
                                  : "bg-white border-[#00BFA6]/20 shadow-[0_8px_16px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/45 group-hover:-translate-y-0.5"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors duration-200",
                                  isActive
                                    ? "bg-[#00BFA6] text-white"
                                    : "bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
                                )}
                              >
                                <Icon size={18} strokeWidth={2.5} className="sm:hidden" />
                                <Icon size={22} strokeWidth={2.5} className="hidden sm:block" />
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-extrabold text-center max-w-[150px] leading-snug transition-colors whitespace-pre-line",
                                isActive ? "text-[#00BFA6]" : "text-gray-600 group-hover:text-[#00BFA6]"
                              )}
                            >
                              {family.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {selectedFamily && (
                    <div className="space-y-3">
                      <div className="h-px bg-gray-100"></div>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {selectedFamily.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setValue("activityType", item.id)}
                            className={cn(
                              "whitespace-nowrap border px-3 py-2 rounded-full text-xs font-bold text-center transition-all duration-200 flex items-center justify-center min-h-[40px]",
                              selectedActivity === item.id
                                ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A] ring-1 ring-[#00BFA6]"
                                : "border-[#00BFA6]/35 text-gray-700 bg-white hover:bg-gray-50 hover:border-[#00BFA6]"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      {errors.activityType && <p className="text-red-500 text-xs pl-1">{errors.activityType.message}</p>}
                    </div>
                  )}

                 <div className="space-y-1">
                   <input
                      {...register("companyName")}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                      placeholder="Raison sociale (Nom de la société) *"
                   />
                   {errors.companyName && <p className="text-red-500 text-xs pl-1">{errors.companyName.message}</p>}
                 </div>

                 <div className="space-y-1">
                   <input
                     {...register("commercialRegister")}
                     className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500"
                     placeholder="Registre de commerce *"
                   />
                   {errors.commercialRegister && <p className="text-red-500 text-xs pl-1">{errors.commercialRegister.message}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <div className="relative">
                       <select
                         {...register("cityCode", { valueAsNumber: true })}
                         className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900"
                         disabled={isLoadingCities}
                       >
                         <option value="">Wilaya *</option>
                         {cities.map((c) => (
                           <option key={c.id} value={c.id}>
                             {c.nameFr || c.name || `Wilaya ${c.id}`}
                           </option>
                         ))}
                       </select>
                       {isLoadingCities && (
                         <div className="absolute inset-y-0 right-3 flex items-center">
                           <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                         </div>
                       )}
                     </div>
                     {errors.cityCode && <p className="text-red-500 text-xs pl-1">{errors.cityCode.message as any}</p>}
                   </div>

                   <div className="space-y-1">
                     <div className="relative">
                       <select
                         {...register("townCode", { valueAsNumber: true })}
                         className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900"
                         disabled={!selectedCityCode || isLoadingTowns}
                       >
                         <option value="">Commune *</option>
                         {towns.map((t) => (
                           <option key={t.id} value={t.id}>
                             {t.nameFr || t.name || `Commune ${t.id}`}
                           </option>
                         ))}
                       </select>
                       {isLoadingTowns && (
                         <div className="absolute inset-y-0 right-3 flex items-center">
                           <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                         </div>
                       )}
                     </div>
                     {errors.townCode && <p className="text-red-500 text-xs pl-1">{errors.townCode.message as any}</p>}
                   </div>
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
