"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Save, Loader2 } from "lucide-react";

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
    confirmPassword: ""
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
            address: userData.address || ""
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
        const token = localStorage.getItem('token');
        // This endpoint needs to be implemented on backend
        // await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, formData, { ... });
        
        // Simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local storage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        alert("Profil mis à jour avec succès !");
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
                                className="bg-gray-50 border-gray-200 focus:border-[#00BFA6]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nom</label>
                            <Input 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                className="bg-gray-50 border-gray-200 focus:border-[#00BFA6]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input 
                                name="email" 
                                value={formData.email} 
                                disabled 
                                className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Téléphone</label>
                            <Input 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                className="bg-gray-50 border-gray-200 focus:border-[#00BFA6]" 
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Adresse</label>
                            <Input 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="bg-gray-50 border-gray-200 focus:border-[#00BFA6]" 
                            />
                        </div>
                    </div>
                </div>

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
                                className="bg-gray-50 border-gray-200 focus:border-[#00BFA6]" 
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
                                    className="bg-gray-50 border-gray-200 focus:border-[#00BFA6]" 
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
