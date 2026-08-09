'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const inputCls = 'w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white font-medium text-gray-800';

export default function ContactPage() {
  const t = useTranslations('Contact');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const contactSchema = z.object({
    name: z.string().min(5, t('nameTooShort')).max(150),
    email: z.string().email(t('invalidEmail')).max(254),
    subject: z.string().min(1, t('subjectRequired')),
    message: z.string().min(3, t('messageTooShort')).max(2000),
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }
    fetch(`${apiUrl}/content/settings`).then((r) => r.json()).then(setSettings).catch(() => {});
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
      setError(t('submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t('title')}</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            {t('intro')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#00BFA6]" /> {t('formTitle')}
            </h2>

            {success ? (
              <div className="flex flex-col items-center text-center py-10">
                <CheckCircle2 className="h-12 w-12 text-[#00BFA6] mb-4" />
                <p className="font-bold text-gray-900">{t('successTitle')}</p>
                <p className="text-gray-500 text-sm mt-1">{t('successDescription')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">{t('nameLabel')}</label>
                  <input type="text" {...register('name')} className={inputCls} placeholder={t('namePlaceholder')} />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">{t('emailLabel')}</label>
                  <input type="email" {...register('email')} className={inputCls} placeholder={t('emailPlaceholder')} />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">{t('subjectLabel')}</label>
                  <input type="text" {...register('subject')} className={inputCls} placeholder={t('subjectPlaceholder')} />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">{t('messageLabel')}</label>
                  <textarea {...register('message')} rows={5} className={inputCls} placeholder={t('messagePlaceholder')}></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold py-3.5 px-4 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? t('sending') : t('send')}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5">{t('infoTitle')}</h2>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-[#00BFA6]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t('phoneLabel')}</p>
                    <p className="text-gray-500 text-sm">{settings.CONTACT_PHONE || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-[#00BFA6]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t('emailInfoLabel')}</p>
                    <p className="text-gray-500 text-sm">{settings.CONTACT_EMAIL || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#00BFA6]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t('addressLabel')}</p>
                    <p className="text-gray-500 text-sm">{settings.CONTACT_ADDRESS || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-56 flex items-center justify-center text-gray-400 text-sm font-medium">
              {t('mapPlaceholder')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
