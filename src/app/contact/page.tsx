'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth'; // Assuming this exists or I'll check auth context

const contactSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters').max(150),
  email: z.string().email('Invalid email address').max(254),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(3, 'Message must be at least 3 characters').max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use local storage auth check if hook doesn't exist, but let's try to be generic
  // I'll skip complex auth hook usage for now and rely on manual check or simple storage
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
  }, []);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (user) {
      if (user.firstName && user.lastName) {
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
      await axios.post('http://localhost:8000/contacts', data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Nous Contacter</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Patrimoine-Immobilier.dz est une plateforme dédiée au domaine de l'immobilier.
          Elle vise à mettre en relation gratuitement les différents acteurs de l'immobilier en Algérie.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Formulaire de contact</h2>
          
          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Message envoyé!</strong>
              <span className="block sm:inline"> Merci de nous avoir contactés. Nous vous répondrons bientôt.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre nom"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input
                  type="text"
                  {...register('subject')}
                  className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sujet de votre message"
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre message..."
                ></textarea>
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info & Map */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-blue-600 text-xl">📞</span>
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-gray-600">+213 21 00 00 00</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-600 text-xl">📧</span>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">contact@patrimoine-immobilier.dz</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-600 text-xl">📍</span>
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-gray-600">Alger, Algérie</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
            {/* Placeholder for Map - Google Maps requires API key */}
            <p className="text-gray-500">Carte (Google Maps)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
