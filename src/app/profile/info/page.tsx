"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Save, Loader2, Building2, Upload, Check } from "lucide-react";

export default function ProfileInfoPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // Champs Société
    companyName: "",
    commercialRegister: "",
    agreementNumber: "",
    position: ""
  });
  
  const [files, setFiles] = useState({
    rcDocument: null as File | null,
    agreementDocument: null as File | null,
    agencyLogo: null as File | null
  });

  useEffect(() => {
    // Load user data
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setFormData(prev => ({
            ...prev,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            companyName: userData.companyName || "",
            commercialRegister: userData.commercialRegister || "",
            agreementNumber: userData.agreementNumber || "",
            position: userData.position || ""
        }));
        setLoading(false);
    } else {
        // Redirect or show login
        setLoading(false);
    }
  }, []);

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

        // Append files if they exist
        if (files.rcDocument) submitData.append('rcDocument', files.rcDocument);
        if (files.agreementDocument) submitData.append('agreementDocument', files.agreementDocument);
        if (files.agencyLogo) submitData.append('agencyLogo', files.agencyLogo);

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
            alert("Profil mis à jour avec succès !");
            
            // Si le mot de passe a été changé, on peut réinitialiser les champs
            if (formData.newPassword) {
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            }
        } else {
            const text = await response.text().catch(() => "");
            alert(text || "Erreur lors de la mise à jour");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la mise à jour");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <User className="text-[#00BFA6] fill-current" /> Mon Profil
        </h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal Info */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Informations Personnelles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Prénom</label>
                            <Input 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nom</label>
                            <Input 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input 
                                name="email" 
                                value={formData.email} 
                                disabled 
                                className="bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-not-allowed font-medium h-[42px]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Téléphone</label>
                            <Input 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]" 
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Adresse</label>
                            <Input 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]" 
                            />
                        </div>
                    </div>
                </div>

                {/* Société Section */}
                {user.userType === 'SOCIETE' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-400" /> Informations Société
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Raison Sociale</label>
                                <Input 
                                    name="companyName" 
                                    value={formData.companyName} 
                                    onChange={handleChange} 
                                    className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Poste du représentant</label>
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
                                <label className="text-sm font-medium text-gray-700">Registre Commerce</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.rcDocument || user.rcDocumentUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.rcDocument || user.rcDocumentUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.rcDocument ? files.rcDocument.name : 'Document existant'}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> Mettre à jour</>
                                        )}
                                    </span>
                                    <input type="file" name="rcDocument" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Agrément</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.agreementDocument || user.agreementDocumentUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.agreementDocument || user.agreementDocumentUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.agreementDocument ? files.agreementDocument.name : 'Document existant'}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> Mettre à jour</>
                                        )}
                                    </span>
                                    <input type="file" name="agreementDocument" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Logo de l'agence</label>
                                <label className={`flex items-center justify-center w-full h-[42px] border-2 rounded-xl cursor-pointer transition-all font-bold text-sm ${files.agencyLogo || user.agencyLogoUrl ? "bg-[#E6F8F6] border-[#00BFA6] text-[#003B4A]" : "bg-gray-50 border-gray-200 hover:border-[#00BFA6] text-gray-600"}`}>
                                    <span className="flex items-center gap-2">
                                        {files.agencyLogo || user.agencyLogoUrl ? (
                                            <><Check className="w-4 h-4 text-[#00BFA6]" /> {files.agencyLogo ? files.agencyLogo.name : 'Logo existant'}</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> Mettre à jour</>
                                        )}
                                    </span>
                                    <input type="file" name="agencyLogo" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.svg,.webp" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Change */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-400" /> Sécurité
                    </h2>
                    <div className="grid grid-cols-1 gap-6 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                            <Input 
                                type="password"
                                name="newPassword" 
                                value={formData.newPassword} 
                                onChange={handleChange} 
                                placeholder="Laisser vide pour ne pas changer"
                                className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:ring-0 focus:border-[#00BFA6] outline-none transition-all font-medium text-gray-900 h-[42px]" 
                            />
                        </div>
                        {formData.newPassword && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
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
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enregistrement...</>
                        ) : (
                            <><Save className="w-5 h-5 mr-2" /> Enregistrer les modifications</>
                        )}
                    </Button>
                </div>

            </form>
        </div>
    </div>
  );
}
