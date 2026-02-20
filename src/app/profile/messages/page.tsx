"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <MessageSquare className="text-[#00BFA6] fill-current" /> Ma Messagerie
            </h1>

            {messages.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">Vous n'avez pas encore de messages.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="text-gray-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            {msg.sender.firstName} {msg.sender.lastName}
                                            {msg.sender.companyName && <span className="text-gray-500 text-xs ml-2">({msg.sender.companyName})</span>}
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            {format(new Date(msg.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                                {msg.announce && (
                                    <span className="text-xs bg-teal-50 text-[#00BFA6] px-2 py-1 rounded-md font-bold">
                                        Ref: {msg.announce.reference}
                                    </span>
                                )}
                            </div>
                            <div className="pl-13">
                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl rounded-tl-none">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
