'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(5, 'Le nom doit contenir au moins 5 caractères').max(150),
  email: z.string().email('Adresse e-mail invalide').max(254),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(3, 'Le message doit contenir au moins 3 caractères').max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const inputCls = 'w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white font-medium text-gray-800';

export default function ContactPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }
  }, []);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (user) {
      if (user.companyName) {
        setValue('name', user.companyName);
      } else if (user.firstName && user.lastName) {
        setValue('name', `${user.firstName} ${user.lastName}`);
      }
      if (user.email) {
        setValue('email', user.email);
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post(`${apiUrl}/contacts`, data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("L'envoi a échoué. Merci de réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Nous Contacter</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            Patrimoine-Immobilier.dz est une plateforme dédiée au domaine de l'immobilier.
            Elle vise à mettre en relation gratuitement les différents acteurs de l'immobilier en Algérie.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#00BFA6]" /> Formulaire de contact
            </h2>

            {success ? (
              <div className="flex flex-col items-center text-center py-10">
                <CheckCircle2 className="h-12 w-12 text-[#00BFA6] mb-4" />
                <p className="font-bold text-gray-900">Message envoyé !</p>
                <p className="text-gray-500 text-sm mt-1">Merci de nous avoir contactés. Nous vous répondrons bientôt.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Nom complet</label>
                  <input type="text" {...register('name')} className={inputCls} placeholder="Votre nom" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">E-mail</label>
                  <input type="email" {...register('email')} className={inputCls} placeholder="votre@email.com" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Sujet</label>
                  <input type="text" {...register('subject')} className={inputCls} placeholder="Sujet de votre message" />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Message</label>
                  <textarea {...register('message')} rows={5} className={inputCls} placeholder="Votre message..."></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold py-3.5 px-4 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Informations</h2>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-[#00BFA6]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Téléphone</p>
                    <p className="text-gray-500 text-sm">+213 21 00 00 00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-[#00BFA6]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">E-mail</p>
                    <p className="text-gray-500 text-sm">contact@patrimoine-immobilier.dz</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#00BFA6]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Adresse</p>
                    <p className="text-gray-500 text-sm">Alger, Algérie</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-56 flex items-center justify-center text-gray-400 text-sm font-medium">
              Carte (Google Maps)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
