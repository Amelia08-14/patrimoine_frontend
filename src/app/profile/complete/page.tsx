"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Building2, User, MapPin, Phone, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { WILAYAS } from "@/data/wilayas"

// Schéma de validation
const profileSchema = z.object({
  civility: z.enum(["M", "MME"]).optional(),
  lastName: z.string().min(2, "Nom requis").optional(),
  firstName: z.string().min(2, "Prénom requis").optional(),
  dateOfBirth: z.string().optional(),
  
  phone: z.string().min(9, "Téléphone requis"),
  landline: z.string().optional(),
  address: z.string().min(5, "Adresse requise"),
  wilaya: z.string().min(1, "Wilaya requise"), // Simplifié pour l'exemple
  commune: z.string().min(1, "Commune requise"), // Simplifié

  // Société Specific
  commercialRegister: z.string().optional(),
  agreementNumber: z.string().optional(),
  companyName: z.string().optional(),
  
  // Files
  rcDocument: z.any().optional(),
  agreementDocument: z.any().optional(),
  agencyLogo: z.any().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function CompleteProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      // Pré-remplir les champs connus
      setValue("firstName", parsedUser.firstName)
      setValue("lastName", parsedUser.lastName)
      setValue("companyName", parsedUser.companyName)
    } else {
      window.location.href = '/auth/login'
    }
  }, [setValue])

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
        const token = localStorage.getItem('token')
        const formData = new FormData()

        // Append text fields
        Object.keys(data).forEach(key => {
             const value = data[key as keyof ProfileForm];
             if (key !== 'rcDocument' && key !== 'agreementDocument' && key !== 'agencyLogo' && value) {
                 formData.append(key, value as string)
             }
        })

        // Append files
        if (data.rcDocument?.[0]) formData.append('rcDocument', data.rcDocument[0])
        if (data.agreementDocument?.[0]) formData.append('agreementDocument', data.agreementDocument[0])
        if (data.agencyLogo?.[0]) formData.append('agencyLogo', data.agencyLogo[0])

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        })

        if (response.ok) {
            const updatedUser = await response.json()
            // Mettre à jour le localStorage
            localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser, isProfileComplete: true }))
            alert("Profil mis à jour avec succès !")
            window.location.href = '/'
        } else {
            alert("Erreur lors de la mise à jour")
        }
    } catch (error) {
        console.error(error)
        alert("Erreur technique")
    } finally {
        setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* Left Side - Visual (Full height, 45% width) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between transition-all duration-700">
         {/* Background Image */}
         <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform hover:scale-105"
            style={{ 
              backgroundImage: user?.userType === 'PARTICULIER' ? "url('/particulier.jpg')" : "url('/société.jpg')",
            }}
         />
         
         {/* Overlay */}
         <div className="absolute inset-0 bg-[#003B4A]/80 backdrop-blur-[2px]"></div>

         {/* Content */}
         <div className="relative z-10 p-12 h-full flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-12">
                 <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                    {user.userType === 'PARTICULIER' ? <User className="h-6 w-6 text-[#00BFA6]" /> : <Building2 className="h-6 w-6 text-[#00BFA6]" />}
                 </div>
                 <span className="text-xl font-bold text-white tracking-tight">
                    {user.userType === 'PARTICULIER' ? 'Espace Particulier' : 'Espace Professionnel'}
                 </span>
               </div>
               
               <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                 Finalisons votre<br/>
                 <span className="text-[#00BFA6]">Inscription.</span>
               </h1>
               <p className="text-gray-300 text-lg leading-relaxed max-w-md mb-8">
                 Ces informations sont nécessaires pour vérifier votre identité et garantir la sécurité des transactions sur notre plateforme.
               </p>

               {user.userType === 'SOCIETE' && (
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                      <p className="font-bold text-[#00BFA6] mb-4 text-sm uppercase tracking-wider">Documents requis :</p>
                      <ul className="space-y-3">
                          <li className="flex items-center gap-3 text-gray-200 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]"></div>
                              Registre de commerce
                          </li>
                          <li className="flex items-center gap-3 text-gray-200 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]"></div>
                              Agrément
                          </li>
                          <li className="flex items-center gap-3 text-gray-200 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]"></div>
                              Logo de l'agence (optionnel)
                          </li>
                      </ul>
                  </div>
               )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
               <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-[#00BFA6]"></div>
               </div>
               <span>Étape 2/2</span>
            </div>
         </div>
      </div>

      {/* Right Side - Form (Full height, 55% width, Scrollable) */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-2xl space-y-10 py-8">
          
          <div className="text-center lg:text-left border-b border-gray-100 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Informations Complémentaires</h2>
            <p className="text-gray-500">
              Veuillez compléter les informations ci-dessous pour valider votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
             
             {/* --- SECTION 1: IDENTITÉ --- */}
             <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#003B4A] flex items-center gap-2">
                    <User className="text-[#00BFA6] h-5 w-5" /> 
                    {user.userType === 'PARTICULIER' ? 'Mes coordonnées' : 'Représentant légal'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Civilité *</label>
                        <div className="flex gap-4">
                            <label className={cn(
                                "flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-xl p-3 transition-all",
                                watch("civility") === "M" ? "border-[#00BFA6] bg-[#E6F8F6] text-[#003B4A]" : "border-gray-200 hover:bg-gray-50"
                            )}>
                                <input type="radio" value="M" {...register("civility")} className="hidden" />
                                <span className="text-sm font-bold">Monsieur</span>
                            </label>
                            <label className={cn(
                                "flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-xl p-3 transition-all",
                                watch("civility") === "MME" ? "border-[#00BFA6] bg-[#E6F8F6] text-[#003B4A]" : "border-gray-200 hover:bg-gray-50"
                            )}>
                                <input type="radio" value="MME" {...register("civility")} className="hidden" />
                                <span className="text-sm font-bold">Madame</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="hidden md:block"></div> {/* Spacer */}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nom *</label>
                        <input {...register("lastName")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Prénom *</label>
                        <input {...register("firstName")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                    </div>
                    
                    {user.userType === 'PARTICULIER' && (
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date de naissance *</label>
                            <input type="date" {...register("dateOfBirth")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                        </div>
                    )}
                </div>
             </div>

             <div className="h-px bg-gray-100"></div>

             {/* --- SECTION 2: ADRESSE & CONTACT --- */}
             <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#003B4A] flex items-center gap-2">
                    <MapPin className="text-[#00BFA6] h-5 w-5" /> 
                    Mon adresse
                </h3>
                
                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Adresse complète *</label>
                        <input {...register("address")} placeholder="Cité, Rue, Bâtiment..." className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Wilaya *</label>
                            <select {...register("wilaya")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium appearance-none text-gray-900 placeholder:text-gray-500">
                                <option value="">Sélectionner</option>
                                {WILAYAS.map((wilaya) => (
                                    <option key={wilaya.id} value={wilaya.code}>{wilaya.code} - {wilaya.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Commune *</label>
                            <select {...register("commune")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium appearance-none text-gray-900 placeholder:text-gray-500">
                                <option value="">Sélectionner</option>
                                <option value="Alger Centre">Alger Centre</option>
                                <option value="Hydra">Hydra</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Téléphone Mobile *</label>
                            <input type="tel" {...register("phone")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Téléphone Fixe</label>
                            <input type="tel" {...register("landline")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                        </div>
                    </div>
                </div>
             </div>

             {/* --- SECTION 3: INFO SOCIETE (SI PRO) --- */}
             {user.userType === 'SOCIETE' && (
                 <>
                 <div className="h-px bg-gray-100"></div>
                 <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[#003B4A] flex items-center gap-2">
                        <Building2 className="text-[#00BFA6] h-5 w-5" /> 
                        Informations Société
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Raison Sociale *</label>
                            <input {...register("companyName")} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">N° Registre Commerce</label>
                                <div className="flex gap-2">
                                    <input {...register("commercialRegister")} className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                                    <label className="cursor-pointer bg-[#00BFA6] text-white w-[54px] rounded-xl hover:bg-[#00908A] transition-colors flex items-center justify-center shadow-lg shadow-[#00BFA6]/20">
                                        <Upload className="w-5 h-5" />
                                        <input type="file" className="hidden" {...register("rcDocument")} accept=".pdf,.jpg,.jpeg,.png" />
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">N° Agrément</label>
                                <div className="flex gap-2">
                                    <input {...register("agreementNumber")} className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 placeholder:text-gray-500" />
                                    <label className="cursor-pointer bg-[#00BFA6] text-white w-[54px] rounded-xl hover:bg-[#00908A] transition-colors flex items-center justify-center shadow-lg shadow-[#00BFA6]/20">
                                        <Upload className="w-5 h-5" />
                                        <input type="file" className="hidden" {...register("agreementDocument")} accept=".pdf,.jpg,.jpeg,.png" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block ml-1">Logo de l'agence</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#00BFA6] transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour télécharger</span></p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" {...register("agencyLogo")} accept=".jpg,.jpeg,.png,.svg" />
                                </label>
                            </div>
                        </div>
                    </div>
                 </div>
                 </>
             )}

             <div className="pt-6">
                <Button type="submit" disabled={isLoading} className="w-full py-4 h-auto rounded-xl bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold text-lg shadow-lg shadow-[#00BFA6]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                    {isLoading ? "Enregistrement en cours..." : "Enregistrer et Continuer"}
                </Button>
             </div>

          </form>
        </div>
      </div>
    </div>
  )
}
