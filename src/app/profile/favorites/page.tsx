"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { PropertyCard } from "@/components/PropertyCard";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/favorites/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // The backend returns { announce: ... }. We need to extract announce.
                const items = res.data.map((fav: any) => fav.announce);
                setFavorites(items);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Heart className="text-[#00BFA6] fill-current" /> Mes Favoris
            </h1>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">Vous n'avez pas encore de favoris.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map(announce => (
                        <div key={announce.id} className="h-[400px]">
                            <PropertyCard announce={announce} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
