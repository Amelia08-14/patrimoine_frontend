"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Save, Loader2, Building2, Upload, Check, MapPin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProfileInfoPage() {
  const t = useTranslations("ProfileInfo");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Wilaya/commune chargées depuis la vraie base (City/Town), comme dans le reste du site :
  // les selects portent de vrais id, envoyés en townId — la source pour les filtres par la suite.
  const [cities, setCities] = useState<Array<{ id: number; nameFr: string }>>([]);
  const [towns, setTowns] = useState<Array<{ id: number; nameFr: string }>>([]);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // Champs Société
    companyName: "",
    commercialRegister: "",
    agreementNumber: "",
    position: "",
    nif: "",
    nis: "",
    agreementExpiryDate: ""
  });

  const [files, setFiles] = useState({
    rcDocument: null as File | null,
    agreementDocument: null as File | null,
    agencyLogo: null as File | null,
    nifDocument: null as File | null,
    nisDocument: null as File | null,
    inapiDocument: null as File | null
  });

  const applyUserData = (userData: any) => {
    setUser(userData);
    setFormData(prev => ({
        ...prev,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        companyName: userData.companyName || "",
        commercialRegister: userData.commercialRegister || "",
        agreementNumber: userData.agreementNumber || "",
        position: userData.position || "",
        nif: userData.nif || "",
        nis: userData.nis || "",
        agreementExpiryDate: userData.agreementExpiryDate ? userData.agreementExpiryDate.substring(0, 10) : ""
    }));
    if (userData.town?.city?.id) setSelectedWilaya(String(userData.town.city.id));
    if (userData.townId) setSelectedCommune(String(userData.townId));
  };

  useEffect(() => {
    // Load user data
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        // Peinture immédiate depuis le cache local, puis on rafraîchit avec /users/me pour
        // récupérer la wilaya/commune réelles (town.city) même si le cache local est ancien.
        applyUserData(JSON.parse(userStr));
        fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((fresh) => { if (fresh) applyUserData(fresh); })
            .catch(() => {});
        setLoading(false);
    } else {
        // Redirect or show login
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/cities`).then((r) => r.json()).then((d) => setCities(Array.isArray(d) ? d : [])).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!selectedWilaya) { setTowns([]); return; }
    fetch(`${API_URL}/cities/${selectedWilaya}/towns`).then((r) => r.json()).then((d) => setTowns(Array.isArray(d) ? d : [])).catch(() => setTowns([]));
  }, [selectedWilaya]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
        setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
        const token = localStorage.getItem('token');
        const submitData = new FormData();
        
        // Append text data
        Object.entries(formData).forEach(([key, value]) => {
            if (value) submitData.append(key, value);
        });

        // Wilaya/commune : townId réel (City.id/Town.id), utilisé ensuite pour les filtres.
        if (selectedCommune) submitData.append('townId', selectedCommune);

        // Append files if they exist
        if (files.rcDocument) submitData.append('rcDocument', files.rcDocument);
        if (files.agreementDocument) submitData.append('agreementDocument', files.agreementDocument);
        if (files.agencyLogo) submitData.append('agencyLogo', files.agencyLogo);
        if (files.nifDocument) submitData.append('nifDocument', files.nifDocument);
        if (files.nisDocument) submitData.append('nisDocument', files.nisDocument);
        if (files.inapiDocument) submitData.append('inapiDocument', files.inapiDocument);

        // Real API call
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/profile`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: submitData,
        });

        if (response.ok) {
            const updatedUser = await response.json();
            
            // Generate full URL for logo if it's a relative path from backend
            if (updatedUser.agencyLogoUrl && !updatedUser.agencyLogoUrl.startsWith('http')) {
                 updatedUser.agencyLogoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${updatedUser.agencyLogoUrl}`;
            }

            localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
            setUser({ ...user, ...updatedUser });
            alert(t("updateSuccess"));

            // Si le mot de passe a été changé, on peut réinitialiser les champs
            if (formData.newPassword) {
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            }
        } else {
            const text = await response.text().catch(() => "");
            alert(text || t("updateError"));
        }
    } catch (error) {
        console.error(error);
        alert(t("updateError"));
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">{t("loading")}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <User className="text-[#00BFA6] fill-current" /> {t("title")}
        </h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Société Section (en premier) */}
                {user.userType === 'SOCIETE' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-400" /> {t("companyInfoTitle")}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("companyName")}</label>
                                <Input
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("position")}</label>
                                <Input
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("rcLabel")}</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.rcDocument || user.rcDocumentUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.rcDocument || user.rcDocumentUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.rcDocument ? files.rcDocument.name : t("existingDocument")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("updateFile")}</>
                                        )}
                                    </span>
                                    <input type="file" name="rcDocument" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("agreementLabel")}</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.agreementDocument || user.agreementDocumentUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.agreementDocument || user.agreementDocumentUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.agreementDocument ? files.agreementDocument.name : t("existingDocument")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("updateFile")}</>
                                        )}
                                    </span>
                                    <input type="file" name="agreementDocument" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("logoLabel")}</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.agencyLogo || user.agencyLogoUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.agencyLogo || user.agencyLogoUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.agencyLogo ? files.agencyLogo.name : t("existingLogo")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("updateFile")}</>
                                        )}
                                    </span>
                                    <input type="file" name="agencyLogo" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.svg,.webp" />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("nifDocLabel")}</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.nifDocument || user.nifDocumentUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.nifDocument || user.nifDocumentUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.nifDocument ? files.nifDocument.name : t("existingDocument")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("updateFile")}</>
                                        )}
                                    </span>
                                    <input type="file" name="nifDocument" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("nisDocLabel")}</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.nisDocument || user.nisDocumentUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.nisDocument || user.nisDocumentUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.nisDocument ? files.nisDocument.name : t("existingDocument")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("updateFile")}</>
                                        )}
                                    </span>
                                    <input type="file" name="nisDocument" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("inapiDocLabel")} <span className="text-gray-400 font-normal">{t("inapiDocHint")}</span></label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.inapiDocument || user.inapiDocumentUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.inapiDocument || user.inapiDocumentUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.inapiDocument ? files.inapiDocument.name : t("existingDocument")}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {t("updateFile")}</>
                                        )}
                                    </span>
                                    <input type="file" name="inapiDocument" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Responsable légal pour une société, Informations personnelles pour un particulier (en deuxième) */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" /> {user.userType === 'SOCIETE' ? t("legalRepresentativeTitle") : t("personalInfoTitle")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("firstName")}</label>
                            <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("lastName")}</label>
                            <Input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("email")}</label>
                            <Input
                                name="email"
                                value={formData.email}
                                disabled
                                className="bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-not-allowed font-medium h-[42px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("phone")}</label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Wilaya / Commune (en troisième) — remplace l'ancien champ Adresse en texte libre, sert de base aux filtres */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" /> {t("addressSectionTitle")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("wilaya")}</label>
                            <select
                                value={selectedWilaya}
                                onChange={(e) => { setSelectedWilaya(e.target.value); setSelectedCommune(""); }}
                                className="w-full bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px] rounded-md px-3"
                            >
                                <option value="">{t("wilayaPlaceholder")}</option>
                                {cities.map((c) => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("commune")}</label>
                            <select
                                value={selectedCommune}
                                onChange={(e) => setSelectedCommune(e.target.value)}
                                disabled={!selectedWilaya}
                                className="w-full bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px] rounded-md px-3 disabled:opacity-60"
                            >
                                <option value="">{t("communePlaceholder")}</option>
                                {towns.map((tw) => <option key={tw.id} value={tw.id}>{tw.nameFr}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-400" /> {t("securityTitle")}
                    </h2>
                    <div className="grid grid-cols-1 gap-6 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t("newPassword")}</label>
                            <Input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder={t("newPasswordPlaceholder")}
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]"
                            />
                        </div>
                        {formData.newPassword && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t("confirmPassword")}</label>
                                <Input 
                                    type="password"
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]" 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button 
                        type="submit" 
                        disabled={saving}
                        className="bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all min-w-[200px]"
                    >
                        {saving ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t("saving")}</>
                        ) : (
                            <><Save className="w-5 h-5 mr-2" /> {t("saveChanges")}</>
                        )}
                    </Button>
                </div>

            </form>
        </div>
    </div>
  );
}
