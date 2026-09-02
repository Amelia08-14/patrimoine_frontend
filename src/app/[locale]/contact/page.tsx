'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import {
  Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare,
  Briefcase, Scale, Wrench, Globe, Paperclip, MessageCircle,
} from 'lucide-react';

type Motif = 'COMMERCIAL' | 'JURIDIQUE' | 'TECHNIQUE' | 'GENERAL';

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const inputCls = 'w-full p-4 border border-gray-300 dark:border-white/15 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white dark:bg-white/5 font-medium text-gray-800 dark:text-white/90';

const SUBJECT_PREFIX: Record<Motif, string> = {
  COMMERCIAL: '[COMMERCIAL]',
  JURIDIQUE: '[JURIDIQUE]',
  TECHNIQUE: '[TECHNIQUE]',
  GENERAL: '[CONTACT]',
};

// Chaque motif est adossé à un "département" de réglages (email/téléphone/WhatsApp/Viber/
// Telegram) — GENERAL utilise le préfixe CONTACT, qui sert aussi de repli pour les autres
// s'ils n'ont pas leurs propres canaux renseignés par l'admin.
const MOTIF_PREFIX: Record<Motif, string> = {
  COMMERCIAL: 'SUPPORT_COMMERCIAL',
  JURIDIQUE: 'SUPPORT_JURIDIQUE',
  TECHNIQUE: 'SUPPORT_TECHNIQUE',
  GENERAL: 'CONTACT',
};

function channelsFor(prefix: string, settings: Record<string, string>) {
  const fallback = (key: string) => (prefix !== 'CONTACT' ? settings[`CONTACT_${key}`] : undefined);
  return {
    email: settings[`${prefix}_EMAIL`] || fallback('EMAIL'),
    phone: settings[`${prefix}_PHONE`] || fallback('PHONE'),
    whatsapp: settings[`${prefix}_WHATSAPP`] || fallback('WHATSAPP'),
    viber: settings[`${prefix}_VIBER`] || fallback('VIBER'),
    telegram: settings[`${prefix}_TELEGRAM`] || fallback('TELEGRAM'),
  };
}

const telHref = (v: string) => `tel:${v.replace(/[^0-9+]/g, '')}`;
const mailHref = (v: string) => `mailto:${v}`;
const waHref = (v: string) => `https://wa.me/${v.replace(/[^0-9]/g, '')}`;
const viberHref = (v: string) => `viber://chat?number=${encodeURIComponent(v.replace(/[^0-9+]/g, ''))}`;
const telegramHref = (v: string) => `https://t.me/${v.replace(/^@/, '').trim()}`;

function ChannelBadge({ icon: Icon, text, href, colorClass, external }: { icon: typeof Mail; text?: string; href?: string; colorClass: string; external?: boolean }) {
  if (!text || !href) return null;
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#00BFA6] hover:shadow-sm transition-all text-sm font-semibold text-gray-700 dark:text-white/70 hover:text-[#00BFA6]"
    >
      <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} /> {text}
    </a>
  );
}

function ChannelBadgeRow({ prefix, settings }: { prefix: string; settings: Record<string, string> }) {
  const c = channelsFor(prefix, settings);
  return (
    <div className="flex flex-wrap gap-2.5">
      <ChannelBadge icon={Mail} text={c.email} href={c.email && mailHref(c.email)} colorClass="text-[#00BFA6]" />
      <ChannelBadge icon={Phone} text={c.phone} href={c.phone && telHref(c.phone)} colorClass="text-[#00BFA6]" />
      <ChannelBadge icon={MessageCircle} text={c.whatsapp && 'WhatsApp'} href={c.whatsapp && waHref(c.whatsapp)} colorClass="text-green-500" external />
      <ChannelBadge icon={MessageCircle} text={c.viber && 'Viber'} href={c.viber && viberHref(c.viber)} colorClass="text-purple-500" external />
      <ChannelBadge icon={Send} text={c.telegram && 'Telegram'} href={c.telegram && telegramHref(c.telegram)} colorClass="text-blue-500" external />
    </div>
  );
}

function ContactPageContent() {
  const t = useTranslations('Contact');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const searchParams = useSearchParams();

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
  const motifParam = searchParams.get('motif')?.toUpperCase();
  const initialMotif: Motif = motifParam === 'TECHNIQUE' || motifParam === 'COMMERCIAL' || motifParam === 'JURIDIQUE' ? motifParam : 'GENERAL';
  const [motif, setMotif] = useState<Motif>(initialMotif);
  const [attachment, setAttachment] = useState<File | null>(null);

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

  const MOTIFS: Array<{ id: Motif; icon: typeof Briefcase; label: string; desc: string }> = [
    { id: 'COMMERCIAL', icon: Briefcase, label: t('motifCommercial'), desc: t('motifCommercialDesc') },
    { id: 'JURIDIQUE', icon: Scale, label: t('motifJuridique'), desc: t('motifJuridiqueDesc') },
    { id: 'TECHNIQUE', icon: Wrench, label: t('motifTechnique'), desc: t('motifTechniqueDesc') },
    { id: 'GENERAL', icon: Globe, label: t('motifGeneral'), desc: t('motifGeneralDesc') },
  ];

  const activeMotif = MOTIFS.find((m) => m.id === motif)!;
  const generalChannels = channelsFor('CONTACT', settings);

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      fd.append('subject', `${SUBJECT_PREFIX[motif]} ${data.subject}`);
      fd.append('message', data.message);
      fd.append('motif', motif);
      if (attachment) fd.append('attachment', attachment);
      await axios.post(`${apiUrl}/contacts`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      setAttachment(null);
    } catch (err) {
      console.error(err);
      setError(t('submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t('title')}</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            {t('intro')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Sélection du motif */}
        <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('motifTitle')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOTIFS.map((m) => {
              const Icon = m.icon;
              const isActive = motif === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMotif(m.id)}
                  className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    isActive ? 'border-[#00BFA6] bg-[#00BFA6]/5' : 'border-gray-100 dark:border-white/10 hover:border-gray-200'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-[#00BFA6]' : 'text-gray-400 dark:text-white/40'}`} />
                  <span className={`text-sm font-bold ${isActive ? 'text-[#00BFA6]' : 'text-gray-700 dark:text-white/70'}`}>{m.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-4">{activeMotif.desc}</p>

          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/10">
            <ChannelBadgeRow prefix={MOTIF_PREFIX[motif]} settings={settings} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#00BFA6]" /> {t('formTitle')}
            </h2>
            <p className="text-sm text-[#00BFA6] font-semibold mb-6">{activeMotif.label}</p>

            {success ? (
              <div className="flex flex-col items-center text-center py-10">
                <CheckCircle2 className="h-12 w-12 text-[#00BFA6] mb-4" />
                <p className="font-bold text-gray-900 dark:text-white">{t('successTitle')}</p>
                <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{t('successDescription')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">{t('nameLabel')}</label>
                  <input type="text" {...register('name')} className={inputCls} placeholder={t('namePlaceholder')} />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">{t('emailLabel')}</label>
                  <input type="email" {...register('email')} className={inputCls} placeholder={t('emailPlaceholder')} />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">{t('subjectLabel')}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-white/40 shrink-0">{SUBJECT_PREFIX[motif]}</span>
                    <input type="text" {...register('subject')} className={inputCls} placeholder={t('subjectPlaceholder')} />
                  </div>
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">{t('messageLabel')}</label>
                  <textarea {...register('message')} rows={5} className={inputCls} placeholder={t('messagePlaceholder')}></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">{t('attachmentLabel')}</label>
                  <label className="flex items-center gap-2 w-full text-sm border border-gray-300 dark:border-white/15 rounded-xl p-4 bg-white dark:bg-white/5 cursor-pointer text-gray-500 dark:text-white/50 font-medium">
                    <Paperclip className="h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
                    {attachment ? attachment.name : t('attachmentHint')}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      className="hidden"
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    />
                  </label>
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
            <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">{t('infoTitle')}</h2>
              <div className="space-y-4">
                {generalChannels.phone && (
                  <a href={telHref(generalChannels.phone)} className="flex items-center gap-4 group">
                    <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-[#00BFA6]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{t('phoneLabel')}</p>
                      <p className="text-gray-500 dark:text-white/50 text-sm group-hover:text-[#00BFA6] transition-colors">{generalChannels.phone}</p>
                    </div>
                  </a>
                )}
                {generalChannels.email && (
                  <a href={mailHref(generalChannels.email)} className="flex items-center gap-4 group">
                    <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-[#00BFA6]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{t('emailInfoLabel')}</p>
                      <p className="text-gray-500 dark:text-white/50 text-sm group-hover:text-[#00BFA6] transition-colors">{generalChannels.email}</p>
                    </div>
                  </a>
                )}
                {settings.CONTACT_ADDRESS && (
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-[#00BFA6]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{t('addressLabel')}</p>
                      <p className="text-gray-500 dark:text-white/50 text-sm">{settings.CONTACT_ADDRESS}</p>
                    </div>
                  </div>
                )}
                {generalChannels.whatsapp && (
                  <a href={waHref(generalChannels.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp</p>
                      <p className="text-gray-500 dark:text-white/50 text-sm group-hover:text-green-600 transition-colors">{generalChannels.whatsapp}</p>
                    </div>
                  </a>
                )}
                {generalChannels.viber && (
                  <a href={viberHref(generalChannels.viber)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Viber</p>
                      <p className="text-gray-500 dark:text-white/50 text-sm group-hover:text-purple-600 transition-colors">{generalChannels.viber}</p>
                    </div>
                  </a>
                )}
                {generalChannels.telegram && (
                  <a href={telegramHref(generalChannels.telegram)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Send className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Telegram</p>
                      <p className="text-gray-500 dark:text-white/50 text-sm group-hover:text-blue-600 transition-colors">{generalChannels.telegram}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden h-56 flex items-center justify-center text-gray-400 dark:text-white/40 text-sm font-medium">
              {t('mapPlaceholder')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}
