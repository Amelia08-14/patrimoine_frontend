"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Building2, User, MapPin, Phone, Upload, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function CompleteProfilePage() {
  const t = useTranslations("ProfileComplete")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Wilayas/communes chargées depuis la vraie base (comme dans l'admin) : les valeurs des
  // selects sont ainsi de vrais City.id/Town.id envoyés en townId, plutôt que des noms en
  // texte libre qu'un rapprochement approximatif côté serveur pouvait ne jamais retrouver
  // (ex. "Alger-Centre" saisi vs "Alger Centre" en base -> townId jamais enregistré).
  const [cities, setCities] = useState<Array<{ id: number; nameFr: string }>>([])
  const [towns, setTowns] = useState<Array<{ id: number; nameFr: string }>>([])

  const profileSchema = z.object({
    civility: z.enum(["M", "MME"], { message: t("civilityRequired") }),
    lastName: z.string().min(2, t("lastNameRequired")),
    firstName: z.string().min(2, t("firstNameRequired")),
    dateOfBirth: z.string().optional(),

    phone: z.string().min(9, t("phoneRequired")),
    landline: z.string().optional(),
    address: z.string().min(5, t("addressRequired")),
    wilaya: z.string().min(1, t("wilayaRequired")),
    commune: z.string().min(1, t("communeRequired")),

    // Société Specific
    commercialRegister: z.string().optional(),
    agreementNumber: z.string().optional(),
    companyName: z.string().optional(),
    position: z.string().optional(),

    // Files
    rcDocument: z.any().optional(),
    agreementDocument: z.any().optional(),
    agencyLogo: z.any().optional(),
  }).superRefine((data, ctx) => {
    if (user?.userType === "PARTICULIER" && !data.dateOfBirth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("dobRequired"),
        path: ["dateOfBirth"],
      })
    }
  })

  type ProfileForm = z.infer<typeof profileSchema>

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })
  const wilayaRegister = register("wilaya")
  const communeRegister = register("commune")

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
      setValue("phone", parsedUser.phone || "")
      setValue("civility", parsedUser.civility)
    } else {
      window.location.href = '/auth/login'
    }
  }, [setValue])

  useEffect(() => {
    fetch(`${API_URL}/cities`).then((r) => r.json()).then((d) => setCities(Array.isArray(d) ? d : [])).catch(() => setCities([]))
  }, [])

  const selectedWilaya = watch("wilaya")
  useEffect(() => {
    if (!selectedWilaya) { setTowns([]); return }
    fetch(`${API_URL}/cities/${selectedWilaya}/towns`).then((r) => r.json()).then((d) => setTowns(Array.isArray(d) ? d : [])).catch(() => setTowns([]))
  }, [selectedWilaya])

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
        const token = localStorage.getItem('token')
        const formData = new FormData()

        // Append text fields
        Object.keys(data).forEach(key => {
             const value = data[key as keyof ProfileForm];
             if (key !== 'rcDocument' && key !== 'agreementDocument' && key !== 'agencyLogo' && key !== 'wilaya' && key !== 'commune' && value) {
                 formData.append(key, value as string)
             }
        })

        // wilaya/commune contiennent les vrais City.id / Town.id (sélectionnés depuis /cities et
        // /cities/:id/towns) : on envoie le Town.id directement en townId (lu en priorité par le
        // serveur), et les libellés lisibles séparément pour l'adresse complète affichée ensuite.
        const cityLabel = cities.find((c) => String(c.id) === String(data.wilaya))?.nameFr || data.wilaya
        const townLabel = towns.find((t) => String(t.id) === String(data.commune))?.nameFr || data.commune
        formData.append('wilaya', cityLabel)
        formData.append('commune', townLabel)
        if (data.commune) formData.append('townId', String(data.commune))

        // Append files
        if (data.rcDocument?.[0]) formData.append('rcDocument', data.rcDocument[0])
        if (data.agreementDocument?.[0]) formData.append('agreementDocument', data.agreementDocument[0])
        if (data.agencyLogo?.[0]) formData.append('agencyLogo', data.agencyLogo[0])

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/profile`, {
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
            alert(t("updateSuccess"))
            window.location.href = '/'
        } else {
            const text = await response.text().catch(() => "")
            alert(text || t("updateError"))
        }
    } catch (error) {
        console.error(error)
        alert(t("technicalError"))
    } finally {
        setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-transparent">

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
                    {user.userType === 'PARTICULIER' ? t("particulierSpace") : t("professionalSpace")}
                 </span>
               </div>

               <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                 {t("finalizeTitle")}<br/>
                 <span className="text-[#00BFA6]">{t("registrationHighlight")}</span>
               </h1>
               <p className="text-gray-300 text-lg leading-relaxed max-w-md mb-8">
                 {t("finalizeSubtitle")}
               </p>

               {user.userType === 'SOCIETE' && (
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                      <p className="font-bold text-[#00BFA6] mb-4 text-sm uppercase tracking-wider">{t("requiredDocsTitle")}</p>
                      <ul className="space-y-3">
                          <li className="flex items-center gap-3 text-gray-200 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]"></div>
                              {t("docCommercialRegister")}
                          </li>
                          <li className="flex items-center gap-3 text-gray-200 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]"></div>
                              {t("docAgreement")}
                          </li>
                          <li className="flex items-center gap-3 text-gray-200 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]"></div>
                              {t("docLogoOptional")}
                          </li>
                      </ul>
                  </div>
               )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
            </div>
         </div>
      </div>

      {/* Right Side - Form (Full height, 55% width, Scrollable) */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 lg:p-10 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-[#E6F8F6]/60 dark:bg-none dark:bg-transparent">
        <div className="w-full max-w-3xl my-auto rounded-[28px] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 shadow-[0_24px_70px_rgba(0,59,74,0.10)] p-5 sm:p-8 lg:p-10">

          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center rounded-full bg-[#E6F8F6] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#007F78] mb-3">Profil</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082A3A] dark:text-white tracking-tight mb-2">{t("formTitle")}</h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-white/50">
              {t("formSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

             {/* --- SECTION 1: IDENTITÉ --- */}
             <div className="space-y-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-5 sm:p-6">
                <h3 className="text-base font-extrabold text-[#003B4A] dark:text-white flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00BFA6]/10"><User className="text-[#00BFA6] h-5 w-5" /></span>
                    {user.userType === 'PARTICULIER' ? t("section1TitleParticulier") : t("section1TitleSociete")}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("civilityLabel")}</label>
                        <div className="flex gap-4">
                            <label className={cn(
                                "flex-1 flex items-center justify-center gap-2 cursor-pointer border-2 rounded-xl p-2 transition-all h-[42px]",
                                watch("civility") === "M" ? "border-[#00BFA6] bg-[#E6F8F6] text-[#003B4A]" : "border-gray-200 dark:border-white/10 hover:border-gray-300 bg-gray-50 dark:bg-transparent"
                            )}>
                                <input type="radio" value="M" {...register("civility")} className="hidden" />
                                <span className="text-sm font-bold text-gray-700 dark:text-white/70">{t("mr")}</span>
                            </label>
                            <label className={cn(
                                "flex-1 flex items-center justify-center gap-2 cursor-pointer border-2 rounded-xl p-2 transition-all h-[42px]",
                                watch("civility") === "MME" ? "border-[#00BFA6] bg-[#E6F8F6] text-[#003B4A]" : "border-gray-200 dark:border-white/10 hover:border-gray-300 bg-gray-50 dark:bg-transparent"
                            )}>
                                <input type="radio" value="MME" {...register("civility")} className="hidden" />
                                <span className="text-sm font-bold text-gray-700 dark:text-white/70">{t("mrs")}</span>
                            </label>
                        </div>
                        {errors.civility && <p className="text-red-500 text-xs pl-1 mt-1">{errors.civility.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("lastNameLabel")}</label>
                        <input {...register("lastName")} className="w-full px-4 py-2 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-transparent h-[42px]" />
                        {errors.lastName && <p className="text-red-500 text-xs pl-1">{errors.lastName.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("firstNameLabel")}</label>
                        <input {...register("firstName")} className="w-full px-4 py-2 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-transparent h-[42px]" />
                        {errors.firstName && <p className="text-red-500 text-xs pl-1">{errors.firstName.message}</p>}
                    </div>

                    {user.userType === 'SOCIETE' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("positionLabel")}</label>
                            <input {...register("position")} className="w-full px-4 py-2 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-transparent h-[42px]" placeholder={t("positionPlaceholder")} />
                            {errors.position && <p className="text-red-500 text-xs pl-1">{errors.position.message}</p>}
                        </div>
                    )}

                    {user.userType === 'PARTICULIER' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("dobLabel")}</label>
                            <input type="date" {...register("dateOfBirth")} className="w-full px-4 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white bg-white dark:bg-white/5 h-12" />
                            {errors.dateOfBirth && <p className="text-red-500 text-xs pl-1">{errors.dateOfBirth.message}</p>}
                        </div>
                    )}
                </div>
             </div>

             {/* --- SECTION 2: ADRESSE & CONTACT --- */}
             <div className="space-y-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 sm:p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-[#003B4A] dark:text-white flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00BFA6]/10"><MapPin className="text-[#00BFA6] h-5 w-5" /></span>
                    {t("section2Title")}
                </h3>

                <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("wilayaLabel")}</label>
                                 <select
                                   {...wilayaRegister}
                                   onChange={(e) => {
                                     wilayaRegister.onChange(e)
                                     setValue("commune", "")
                                   }}
                                   className="w-full px-4 py-2 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium appearance-none text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-transparent h-[42px]"
                                 >
                                     <option value="">{t("selectOption")}</option>
                                     {cities.map((c) => (
                                         <option key={c.id} value={c.id}>{c.nameFr}</option>
                                     ))}
                                 </select>
                                 {errors.wilaya && <p className="text-red-500 text-xs pl-1">{errors.wilaya.message}</p>}
                             </div>
                             <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("communeLabel")}</label>
                                 <select {...communeRegister} disabled={!watch("wilaya")} className="w-full px-4 py-2 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium appearance-none text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-transparent h-[42px] disabled:opacity-60">
                                     <option value="">{t("selectOption")}</option>
                                     {towns.map((town) => (
                                       <option key={town.id} value={town.id}>
                                         {town.nameFr}
                                       </option>
                                     ))}
                                 </select>
                                 {errors.commune && <p className="text-red-500 text-xs pl-1">{errors.commune.message}</p>}
                             </div>
                             <div className="space-y-1 sm:col-span-2">
                                 <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("addressLabel")}</label>
                                 <input {...register("address")} placeholder={t("addressPlaceholder")} className="w-full px-4 py-2 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500 bg-gray-50 dark:bg-transparent h-[42px]" />
                                 {errors.address && <p className="text-red-500 text-xs pl-1">{errors.address.message}</p>}
                             </div>
                        </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase ml-1">{t("mobilePhoneLabel")}</label>
                            <input type="tel" {...register("phone")} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500" />
                            {errors.phone && <p className="text-red-500 text-xs pl-1">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase ml-1">{t("landlinePhoneLabel")}</label>
                            <input type="tel" {...register("landline")} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500" />
                        </div>
                    </div>
                </div>
             </div>

             {/* --- SECTION 3: INFO SOCIETE (SI PRO) --- */}
             {user.userType === 'SOCIETE' && (
                 <>
                 <div className="h-px bg-gray-100 dark:bg-white/10"></div>
                 <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[#003B4A] dark:text-white flex items-center gap-2">
                        <Building2 className="text-[#00BFA6] h-5 w-5" />
                        {t("section3Title")}
                    </h3>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase ml-1">{t("companyNameLabel")}</label>
                            <input {...register("companyName")} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("rcLabel")}</label>
                                <label className={cn(
                                    "flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm",
                                    watch("rcDocument")?.[0] ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 dark:bg-transparent border-gray-200 dark:border-white/10 hover:border-[#00BFA6] text-gray-600 dark:text-white/60"
                                )}>
                                    <span className="flex items-center gap-2">
                                        {watch("rcDocument")?.[0] ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {t("documentImported")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("uploadBtn")}</>
                                        )}
                                    </span>
                                    <input type="file" className="hidden" {...register("rcDocument")} accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("agreementLabel")}</label>
                                <label className={cn(
                                    "flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm",
                                    watch("agreementDocument")?.[0] ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 dark:bg-transparent border-gray-200 dark:border-white/10 hover:border-[#00BFA6] text-gray-600 dark:text-white/60"
                                )}>
                                    <span className="flex items-center gap-2">
                                        {watch("agreementDocument")?.[0] ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {t("documentImported")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("uploadBtn")}</>
                                        )}
                                    </span>
                                    <input type="file" className="hidden" {...register("agreementDocument")} accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase ml-1">{t("logoLabel")}</label>
                                <label className={cn(
                                    "flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm",
                                    watch("agencyLogo")?.[0] ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 dark:bg-transparent border-gray-200 dark:border-white/10 hover:border-[#00BFA6] text-gray-600 dark:text-white/60"
                                )}>
                                    <span className="flex items-center gap-2">
                                        {watch("agencyLogo")?.[0] ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {t("logoImported")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("uploadLogoBtn")}</>
                                        )}
                                    </span>
                                    <input type="file" className="hidden" {...register("agencyLogo")} accept=".jpg,.jpeg,.png,.svg,.webp" />
                                </label>
                            </div>
                        </div>
                    </div>
                 </div>
                 </>
             )}

             <div className="pt-2">
                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-[#00BFA6] hover:bg-[#009B91] text-white font-extrabold text-base shadow-[0_12px_25px_rgba(0,191,166,0.25)] transition-all hover:-translate-y-0.5 active:translate-y-0">
                    {isLoading ? t("saving") : t("submit")}
                </Button>
             </div>

          </form>
        </div>
      </div>
    </div>
  )
}
