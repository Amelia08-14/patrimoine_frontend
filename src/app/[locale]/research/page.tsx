'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  Home, Key, Factory, Briefcase, Trees, Hotel, Check, ArrowLeft,
  Ruler, MapPin, Handshake, Compass, ShieldCheck, Sparkles,
} from 'lucide-react';
import {
  RESEARCH_BRANCHES, RESEARCH_PROPERTY_TYPES, RESEARCH_INTERLOCUTORS,
  OUTDOOR_SPACE_OPTIONS, PROXIMITY_OPTIONS, BUREAUX_EQUIPMENT_OPTIONS, VIABILISATION_OPTIONS,
  HOTELIER_EQUIPMENT_OPTIONS, ResearchBranchId,
  SITUATION_OPTIONS, ACHAT_INTERLOCUTOR_OPTIONS, REALISATION_STAGE_OPTIONS, DELIVERY_STATE_OPTIONS,
  ACHAT_DESTINATION_OPTIONS, FLOOR_APPLICABLE_TYPES, FLOOR_PREFERENCE_OPTIONS, APARTMENTS_PER_FLOOR_OPTIONS,
  ORIENTATION_OPTIONS, VIEW_OPTIONS, AIRPORT_PROXIMITY_OPTIONS, CURRENCY_OPTIONS, FINANCING_OPTIONS,
  ENVIRONMENT_OPTIONS, RESIDENCE_AMENITIES_OPTIONS, PARENTAL_SUITE_OPTIONS, KITCHEN_TYPE_OPTIONS,
  KITCHEN_EQUIPMENT_OPTIONS, HEATING_OPTIONS, AC_OPTIONS, SECURITY_OPTIONS, CONNECTIVITY_OPTIONS,
} from '@/data/researchConfig';

const BRANCH_ICONS: Record<string, any> = { Home, Factory, Briefcase, Trees, Hotel };

enum TransactionType {
  RENTAL = 'RENTAL',
  SALE = 'SALE',
}

const inputCls = 'w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white font-medium text-gray-800';

// Pastille ronde sélectionnable (charte du dépôt d'annonce) — pour choix uniques (branche, type, transaction)
const CircleOption = ({ active, onClick, icon: Icon, label, size = 'md' }: { active: boolean; onClick: () => void; icon: any; label: string; size?: 'lg' | 'md' | 'sm' }) => {
  const outer = size === 'lg' ? 'w-28 h-28 md:w-40 md:h-40' : size === 'md' ? 'w-32 h-32' : 'w-24 h-24';
  const inner = size === 'lg' ? 'w-20 h-20 md:w-32 md:h-32' : size === 'md' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'h-10 w-10 md:h-16 md:w-16' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8';
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-3 cursor-pointer group w-full">
      <div className={cn(
        outer, 'rounded-full flex items-center justify-center transition-all duration-300 border-4 relative',
        active
          ? 'bg-white border-[#00BFA6] shadow-[0_8px_16px_rgba(0,191,166,0.3)] transform -translate-y-2'
          : 'bg-white border-gray-100 shadow-[0_8px_16px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/30 group-hover:-translate-y-1'
      )}>
        <div className={cn(inner, 'rounded-full flex items-center justify-center transition-colors duration-300', active ? 'bg-[#00BFA6] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]')}>
          <Icon className={iconSize} />
        </div>
      </div>
      <span className={cn('font-bold text-center max-w-[160px] transition-colors', size === 'sm' ? 'text-sm' : 'text-base md:text-lg', active ? 'text-[#00BFA6]' : 'text-gray-500 group-hover:text-[#00BFA6]')}>
        {label}
      </span>
    </div>
  );
};

// Pastille rectangulaire à cocher (charte du dépôt d'annonce) — pour choix multiples (critères, équipements, interlocuteurs)
const PillOption = ({ checked, onChange, label, icon: Icon }: { checked: boolean; onChange: () => void; label: string; icon?: any }) => (
  <label className="cursor-pointer block">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
    <div className={cn(
      'w-full min-h-[52px] flex items-center gap-3 px-4 py-3 border-2 rounded-xl font-bold transition-all bg-white shadow-sm',
      checked ? 'border-[#00BFA6] bg-green-50/50 text-[#00BFA6]' : 'border-gray-300 text-gray-900 hover:border-gray-400'
    )}>
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="text-sm leading-snug">{label}</span>
      {checked && <Check className="h-4 w-4 ml-auto shrink-0" />}
    </div>
  </label>
);

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#00BFA6]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function OptionGroup({
  label, options, field, watch, toggle, icons = {},
}: {
  label: string;
  options: { id: string; label: string }[];
  field: any;
  watch: any;
  toggle: (field: any, value: string) => void;
  icons?: Record<string, any>;
}) {
  const selected: string[] = watch(field) || [];
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-3">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((opt) => (
          <PillOption key={opt.id} checked={selected.includes(opt.id)} label={opt.label} icon={icons[opt.id]} onChange={() => toggle(field, opt.id)} />
        ))}
      </div>
    </div>
  );
}

export default function ResearchPage() {
  const t = useTranslations('Research');
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [towns, setTowns] = useState<any[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [useMyInfo, setUseMyInfo] = useState(true);

  const researchSchema = z.object({
    branch: z.string().min(1, t('zodBranchRequired')),
    transaction: z.nativeEnum(TransactionType).optional(),
    propertyType: z.string().optional(),

    minSurface: z.coerce.number().optional(),
    maxSurface: z.coerce.number().optional(),
    surfaceUnit: z.enum(['M2', 'HA']).optional(),
    nbPieces: z.coerce.number().optional(),
    nbRooms: z.coerce.number().optional(),

    outdoorSpaces: z.array(z.string()).optional(),
    proximity: z.array(z.string()).optional(),

    storageSurfaceMin: z.coerce.number().optional(),
    storageSurfaceMax: z.coerce.number().optional(),
    ceilingHeight: z.coerce.number().optional(),
    truckAccess: z.boolean().optional(),
    technicalSpecs: z.string().optional(),

    nbOffices: z.coerce.number().optional(),
    streetWindow: z.boolean().optional(),
    floorLevel: z.enum(['RDC', 'ETAGE']).optional(),
    bureauxEquipments: z.array(z.string()).optional(),
    footfall: z.enum(['FAIBLE', 'MOYEN', 'ELEVE']).optional(),

    constructibility: z.string().optional(),
    viabilisation: z.array(z.string()).optional(),
    topography: z.enum(['PLAT', 'PENTE']).optional(),

    hotelierEquipments: z.array(z.string()).optional(),
    classification: z.string().optional(),

    interlocutors: z.array(z.string()).optional(),

    cityId: z.coerce.number().optional(),
    towns: z.array(z.string()).optional(),

    minBudget: z.coerce.number().optional(),
    maxBudget: z.coerce.number().optional(),
    currency: z.enum(['DA', 'EUR', 'USD']).optional(),
    installationDate: z.string().optional(),
    comment: z.string().min(10, t('zodCommentRequired')),

    // Fiche détaillée Résidentiel — Achat / Habitation
    situation: z.enum(['RESIDENT_NATIONAL', 'DIASPORA']).optional(),
    realisationStage: z.enum(['FINI', 'EN_FINALISATION', 'SUR_PLAN']).optional(),
    deliveryState: z.enum(['VIDE', 'MEUBLE', 'PEU_IMPORTE']).optional(),
    achatDestination: z.enum(['HABITATION', 'COMMERCIAL', 'MIXTE']).optional(),
    floorPreference: z.string().optional(),
    apartmentsPerFloor: z.string().optional(),
    orientation: z.string().optional(),
    views: z.array(z.string()).optional(),
    airportProximity: z.string().optional(),
    financingMode: z.enum(['CASH', 'CREDIT', 'MIXTE']).optional(),
    environment: z.array(z.string()).optional(),
    residenceAmenities: z.array(z.string()).optional(),
    parentalSuite: z.string().optional(),
    kitchenType: z.string().optional(),
    kitchenEquipment: z.string().optional(),
    heating: z.string().optional(),
    ac: z.string().optional(),
    security: z.array(z.string()).optional(),
    connectivity: z.array(z.string()).optional(),
    outdoorPrivate: z.boolean().optional(),

    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    companyName: z.string().optional(),
    activity: z.string().optional(),
    userType: z.enum(['PARTICULIER', 'SOCIETE']).optional(),
    isDelegate: z.boolean().optional(),
    receiveAlert: z.boolean().optional(),
  });

  type ResearchFormInput = z.input<typeof researchSchema>;
  type ResearchFormValues = z.output<typeof researchSchema>;

  const STEP_KEYS = ['BRANCH', 'TRANSACTION', 'CRITERIA', 'BUDGET', 'INTERLOCUTOR', 'CONTACT'] as const;
  type StepKey = typeof STEP_KEYS[number];

  const STEP_LABELS: Record<StepKey, string> = {
    BRANCH: t('stepBranch'),
    TRANSACTION: t('stepTransaction'),
    CRITERIA: t('stepCriteria'),
    BUDGET: t('stepBudget'),
    INTERLOCUTOR: t('stepInterlocutor'),
    CONTACT: t('stepContact'),
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ResearchFormInput, any, ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      branch: '',
      outdoorSpaces: [],
      proximity: [],
      bureauxEquipments: [],
      viabilisation: [],
      hotelierEquipments: [],
      interlocutors: [],
      towns: [],
      userType: 'PARTICULIER',
      surfaceUnit: 'M2',
      currency: 'DA',
      views: [],
      environment: [],
      residenceAmenities: [],
      security: [],
      connectivity: [],
    },
  });

  const branch = watch('branch') as ResearchBranchId | '';
  const isResidentielAchat = branch === 'RESIDENTIEL' && watch('transaction') === TransactionType.SALE;
  const selectedPropertyType = watch('propertyType');

  const steps: StepKey[] = [...STEP_KEYS];
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    axios.get(`${apiUrl}/cities`).then((res) => setCities(res.data)).catch(() => {});

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.userType !== 'ADMIN') setLoggedInUser(userData);
      } catch {}
    }
  }, []);

  const selectedCityId = watch('cityId');
  useEffect(() => {
    if (selectedCityId) {
      axios.get(`${apiUrl}/cities/${selectedCityId}/towns`).then((res) => setTowns(res.data)).catch(() => {});
    }
  }, [selectedCityId]);

  const toggleArrayValue = (field: keyof ResearchFormValues, value: string) => {
    const current = (watch(field) as string[]) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field as any, next as any);
  };

  const nextStep = () => setCurrentStepIndex((p) => Math.min(p + 1, steps.length - 1));
  const prevStep = () => setCurrentStepIndex((p) => Math.max(p - 1, 0));
  const goToStep = (index: number) => {
    if (index <= currentStepIndex) setCurrentStepIndex(index);
  };

  const onSubmit = async (data: ResearchFormValues) => {
    setLoading(true);
    try {
      if (!data.installationDate) {
        alert(t('alertDateRequired'));
        setLoading(false);
        return;
      }

      const amenities: any = { interlocutors: data.interlocutors || [], currency: data.currency };
      switch (data.branch) {
        case 'RESIDENTIEL':
          amenities.residentiel = { outdoorSpaces: data.outdoorSpaces, proximity: data.proximity };
          if (data.transaction === TransactionType.SALE) {
            amenities.residentiel.achatHabitation = {
              situation: data.situation,
              realisationStage: data.realisationStage,
              deliveryState: data.deliveryState,
              achatDestination: data.achatDestination,
              floorPreference: data.floorPreference,
              apartmentsPerFloor: data.apartmentsPerFloor,
              orientation: data.orientation,
              views: data.views,
              airportProximity: data.airportProximity,
              financingMode: data.financingMode,
              environment: data.environment,
              residenceAmenities: data.residenceAmenities,
              parentalSuite: data.parentalSuite,
              kitchenType: data.kitchenType,
              kitchenEquipment: data.kitchenEquipment,
              heating: data.heating,
              ac: data.ac,
              security: data.security,
              connectivity: data.connectivity,
              outdoorPrivate: !!data.outdoorPrivate,
            };
          }
          break;
        case 'INDUSTRIEL':
          amenities.industriel = {
            storageSurfaceMin: data.storageSurfaceMin,
            storageSurfaceMax: data.storageSurfaceMax,
            ceilingHeight: data.ceilingHeight,
            truckAccess: !!data.truckAccess,
            technicalSpecs: data.technicalSpecs,
          };
          break;
        case 'BUREAUX_COMMERCES':
          amenities.bureaux = {
            nbOffices: data.nbOffices,
            streetWindow: !!data.streetWindow,
            floorLevel: data.floorLevel,
            equipments: data.bureauxEquipments,
            footfall: data.footfall,
          };
          break;
        case 'TERRAIN_FONCIER':
          amenities.terrain = {
            surfaceUnit: data.surfaceUnit,
            constructibility: data.constructibility,
            viabilisation: data.viabilisation,
            topography: data.topography,
          };
          break;
        case 'HOTELIER':
          amenities.hotelier = {
            equipments: data.hotelierEquipments,
            classification: data.classification,
          };
          break;
      }

      const useProfile = !!loggedInUser && useMyInfo;
      const contact = useProfile
        ? {
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            email: loggedInUser.email,
            phone: loggedInUser.phone,
            address: loggedInUser.address,
            companyName: loggedInUser.companyName,
            activity: loggedInUser.activity,
          }
        : {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            companyName: data.companyName,
            activity: data.activity,
          };

      const payload = {
        transaction: data.transaction,
        minSurface: data.minSurface,
        maxSurface: data.maxSurface,
        nbPieces: data.nbPieces,
        nbRooms: data.nbRooms,
        minBudget: data.minBudget || 0,
        maxBudget: data.maxBudget || 0,
        installationDate: data.installationDate,
        cityId: data.cityId,
        towns: JSON.stringify(data.towns || []),
        comment: data.comment,
        ...contact,
        userId: loggedInUser?.id,
        realEstateType: data.branch,
        propertyType: data.propertyType,
        amenities: JSON.stringify(amenities),
      };

      await axios.post(`${apiUrl}/entrusted-research`, payload);
      alert(t('alertSuccess'));
      router.push('/demandes');
    } catch (err) {
      console.error(err);
      alert(t('alertGenericError'));
    } finally {
      setLoading(false);
    }
  };

  // Le bouton "Confier ma recherche" ne se contentait de rien faire quand la validation
  // échouait silencieusement (ex: commentaire manquant sur une étape déjà quittée) — on
  // ramène désormais l'utilisateur à l'étape concernée avec un message explicite.
  const onInvalid = (formErrors: any) => {
    console.error('Erreurs de validation:', formErrors);
    if (formErrors.branch) {
      setCurrentStepIndex(steps.indexOf('BRANCH'));
      alert(t('alertChooseBranch'));
      return;
    }
    if (formErrors.comment) {
      const idx = steps.indexOf('BUDGET');
      if (idx !== -1) setCurrentStepIndex(idx);
      alert(t('alertCommentRequired'));
      return;
    }
    alert(t('alertCheckInfo'));
  };

  const renderResidentielAchatCriteria = () => {
    const floorApplicable = FLOOR_APPLICABLE_TYPES.includes(selectedPropertyType || '');
    return (
      <>
        <Section title={t('sqNatureTitle')} icon={Sparkles}>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqRealisationStage')}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {REALISATION_STAGE_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('realisationStage') === opt.id} label={`${opt.label} — ${opt.description}`} onChange={() => setValue('realisationStage', opt.id as any)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqDeliveryState')}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DELIVERY_STATE_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('deliveryState') === opt.id} label={opt.description ? `${opt.label} — ${opt.description}` : opt.label} onChange={() => setValue('deliveryState', opt.id as any)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqAchatDestination')}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ACHAT_DESTINATION_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('achatDestination') === opt.id} label={opt.label} onChange={() => setValue('achatDestination', opt.id as any)} />
              ))}
            </div>
          </div>
        </Section>

        <Section title={t('sqTypologyTitle')} icon={Ruler}>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqPropertyTypeSought')}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {RESEARCH_PROPERTY_TYPES.RESIDENTIEL.map((t) => (
                <PillOption key={t.id} checked={watch('propertyType') === t.id} label={t.label} onChange={() => setValue('propertyType', watch('propertyType') === t.id ? '' : t.id)} />
              ))}
            </div>
          </div>
          {floorApplicable && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqFloorPreference')}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FLOOR_PREFERENCE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={watch('floorPreference') === opt.id} label={opt.label} onChange={() => setValue('floorPreference', opt.id)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqApartmentsPerFloor')}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {APARTMENTS_PER_FLOOR_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={watch('apartmentsPerFloor') === opt.id} label={opt.label} onChange={() => setValue('apartmentsPerFloor', opt.id)} />
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label={t('sqHabitableSurfaceMin')}><input type="number" {...register('minSurface')} className={inputCls} /></Field>
            <Field label={t('sqHabitableSurfaceMax')}><input type="number" {...register('maxSurface')} className={inputCls} /></Field>
          </div>
        </Section>

        <Section title={t('sqOrientationTitle')} icon={Compass}>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqOrientationPref')}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ORIENTATION_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('orientation') === opt.id} label={opt.label} onChange={() => setValue('orientation', opt.id)} />
              ))}
            </div>
          </div>
          <OptionGroup label={t('sqViewType')} options={VIEW_OPTIONS} field="views" watch={watch} toggle={toggleArrayValue} />
        </Section>

        <Section title={t('sqNonNegotiableTitle')} icon={ShieldCheck}>
          <p className="text-sm text-gray-500 -mt-2">{t('sqNonNegotiableHint')}</p>
          <OptionGroup label={t('sqEnvironment')} options={ENVIRONMENT_OPTIONS} field="environment" watch={watch} toggle={toggleArrayValue} />
          <OptionGroup label={t('sqResidenceAmenities')} options={RESIDENCE_AMENITIES_OPTIONS} field="residenceAmenities" watch={watch} toggle={toggleArrayValue} />

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqParentalSuite')}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PARENTAL_SUITE_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('parentalSuite') === opt.id} label={opt.label} onChange={() => setValue('parentalSuite', opt.id)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqKitchenType')}</label>
              <div className="grid grid-cols-1 gap-3">
                {KITCHEN_TYPE_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={watch('kitchenType') === opt.id} label={opt.label} onChange={() => setValue('kitchenType', opt.id)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqKitchenEquipment')}</label>
              <div className="grid grid-cols-1 gap-3">
                {KITCHEN_EQUIPMENT_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={watch('kitchenEquipment') === opt.id} label={opt.label} onChange={() => setValue('kitchenEquipment', opt.id)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqHeating')}</label>
              <div className="grid grid-cols-1 gap-3">
                {HEATING_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={watch('heating') === opt.id} label={opt.label} onChange={() => setValue('heating', opt.id)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('sqAc')}</label>
              <div className="grid grid-cols-1 gap-3">
                {AC_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={watch('ac') === opt.id} label={opt.label} onChange={() => setValue('ac', opt.id)} />
                ))}
              </div>
            </div>
          </div>

          <OptionGroup label={t('sqSecurity')} options={SECURITY_OPTIONS} field="security" watch={watch} toggle={toggleArrayValue} />
          <OptionGroup label={t('sqConnectivity')} options={CONNECTIVITY_OPTIONS} field="connectivity" watch={watch} toggle={toggleArrayValue} />

          <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <input type="checkbox" {...register('outdoorPrivate')} className="h-4 w-4 accent-[#00BFA6]" />
            {t('sqOutdoorPrivate')}
          </label>
        </Section>
      </>
    );
  };

  const renderCriteriaStep = () => {
    switch (branch) {
      case 'RESIDENTIEL':
        if (isResidentielAchat) return renderResidentielAchatCriteria();
        return (
          <Section title={t('mainCriteria')} icon={Home}>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('resPropertyTypeSought')}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {RESEARCH_PROPERTY_TYPES.RESIDENTIEL.map((rt) => (
                  <PillOption key={rt.id} checked={watch('propertyType') === rt.id} label={rt.label} onChange={() => setValue('propertyType', watch('propertyType') === rt.id ? '' : rt.id)} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label={t('resNbPieces')}><input type="number" {...register('nbPieces')} className={inputCls} /></Field>
              <Field label={t('resSurfaceMin')}><input type="number" {...register('minSurface')} className={inputCls} /></Field>
              <Field label={t('resSurfaceMax')}><input type="number" {...register('maxSurface')} className={inputCls} /></Field>
            </div>
            <OptionGroup label={t('resOutdoorSpaces')} options={OUTDOOR_SPACE_OPTIONS} field="outdoorSpaces" watch={watch} toggle={toggleArrayValue} />
            <OptionGroup label={t('resProximity')} options={PROXIMITY_OPTIONS} field="proximity" watch={watch} toggle={toggleArrayValue} />
          </Section>
        );

      case 'INDUSTRIEL':
        return (
          <Section title={t('mainCriteria')} icon={Factory}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label={t('indTotalSurfaceMin')}><input type="number" {...register('minSurface')} className={inputCls} /></Field>
              <Field label={t('indTotalSurfaceMax')}><input type="number" {...register('maxSurface')} className={inputCls} /></Field>
              <Field label={t('indStorageSurfaceMin')}><input type="number" {...register('storageSurfaceMin')} className={inputCls} /></Field>
              <Field label={t('indStorageSurfaceMax')}><input type="number" {...register('storageSurfaceMax')} className={inputCls} /></Field>
              <Field label={t('indCeilingHeight')}><input type="number" step="0.1" {...register('ceilingHeight')} className={inputCls} /></Field>
              <Field label={t('indTechnicalSpecs')}>
                <input type="text" placeholder={t('indTechnicalSpecsPlaceholder')} {...register('technicalSpecs')} className={inputCls} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <input type="checkbox" {...register('truckAccess')} className="h-4 w-4 accent-[#00BFA6]" />
              {t('indTruckAccess')}
            </label>
          </Section>
        );

      case 'BUREAUX_COMMERCES':
        return (
          <Section title={t('mainCriteria')} icon={Briefcase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label={t('burSurfaceMin')}><input type="number" {...register('minSurface')} className={inputCls} /></Field>
              <Field label={t('burSurfaceMax')}><input type="number" {...register('maxSurface')} className={inputCls} /></Field>
              <Field label={t('burNbOffices')}><input type="number" {...register('nbOffices')} className={inputCls} /></Field>
              <Field label={t('burFloorLevel')}>
                <select {...register('floorLevel')} className={inputCls}>
                  <option value="">{t('optIndifferent')}</option>
                  <option value="RDC">{t('optGroundFloor')}</option>
                  <option value="ETAGE">{t('optFloor')}</option>
                </select>
              </Field>
              <Field label={t('burFootfall')}>
                <select {...register('footfall')} className={inputCls}>
                  <option value="">{t('optIndifferent')}</option>
                  <option value="FAIBLE">{t('optLow')}</option>
                  <option value="MOYEN">{t('optMedium')}</option>
                  <option value="ELEVE">{t('optHigh')}</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <input type="checkbox" {...register('streetWindow')} className="h-4 w-4 accent-[#00BFA6]" />
              {t('burStreetWindow')}
            </label>
            <OptionGroup label={t('optDesiredEquipment')} options={BUREAUX_EQUIPMENT_OPTIONS} field="bureauxEquipments" watch={watch} toggle={toggleArrayValue} />
          </Section>
        );

      case 'TERRAIN_FONCIER':
        return (
          <Section title={t('mainCriteria')} icon={Trees}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label={t('terSurfaceUnit')}>
                <select {...register('surfaceUnit')} className={inputCls}>
                  <option value="M2">m²</option>
                  <option value="HA">{t('optHectares')}</option>
                </select>
              </Field>
              <Field label={t('terTopography')}>
                <select {...register('topography')} className={inputCls}>
                  <option value="">{t('optIndifferent')}</option>
                  <option value="PLAT">{t('optFlat')}</option>
                  <option value="PENTE">{t('optSlope')}</option>
                </select>
              </Field>
              <Field label={t('terSurfaceMin')}><input type="number" {...register('minSurface')} className={inputCls} /></Field>
              <Field label={t('terSurfaceMax')}><input type="number" {...register('maxSurface')} className={inputCls} /></Field>
              <Field label={t('terConstructibility')} full>
                <input type="text" placeholder={t('terConstructibilityPlaceholder')} {...register('constructibility')} className={inputCls} />
              </Field>
            </div>
            <OptionGroup label={t('terViabilisation')} options={VIABILISATION_OPTIONS} field="viabilisation" watch={watch} toggle={toggleArrayValue} />
          </Section>
        );

      case 'HOTELIER':
        return (
          <Section title={t('mainCriteria')} icon={Hotel}>
            <p className="text-sm text-gray-500 -mt-2">
              {t('hotHint')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label={t('burSurfaceMin')}><input type="number" {...register('minSurface')} className={inputCls} /></Field>
              <Field label={t('burSurfaceMax')}><input type="number" {...register('maxSurface')} className={inputCls} /></Field>
              <Field label={t('hotNbRooms')}><input type="number" {...register('nbRooms')} className={inputCls} /></Field>
            </div>
            <Field label={t('hotClassification')}>
              <select {...register('classification')} className={inputCls}>
                <option value="">{t('optIndifferent')}</option>
                <option value="NON_CLASSE">{t('optUnclassified')}</option>
                <option value="1">{t('optStar1')}</option>
                <option value="2">{t('optStar2')}</option>
                <option value="3">{t('optStar3')}</option>
                <option value="4">{t('optStar4')}</option>
                <option value="5">{t('optStar5')}</option>
              </select>
            </Field>
            <OptionGroup label={t('optDesiredEquipment')} options={HOTELIER_EQUIPMENT_OPTIONS} field="hotelierEquipments" watch={watch} toggle={toggleArrayValue} />
          </Section>
        );

      default:
        return null;
    }
  };

  const renderBudgetStep = () => (
    <Section title={t('budgetTitle')} icon={Ruler}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label={t('budgetCity')}>
          <select {...register('cityId', { valueAsNumber: true })} className={inputCls}>
            <option value="">{t('optSelect')}</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.nameFr || c.name}</option>)}
          </select>
        </Field>

        <Field label={t('budgetTowns')}>
          <select multiple {...register('towns')} className={cn(inputCls, 'h-32')}>
            {towns.map((tw) => <option key={tw.id} value={tw.id}>{tw.nameFr || tw.name}</option>)}
          </select>
        </Field>

        {isResidentielAchat && (
          <Field label={t('budgetAirportProximity')} full>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AIRPORT_PROXIMITY_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('airportProximity') === opt.id} label={opt.label} onChange={() => setValue('airportProximity', opt.id)} />
              ))}
            </div>
          </Field>
        )}

        <Field label={t('budgetDesiredDate')}>
          <input type="date" {...register('installationDate')} className={inputCls} />
        </Field>

        <Field label={t('budgetMin')}><input type="number" {...register('minBudget')} className={inputCls} /></Field>
        <Field label={t('budgetMax')}><input type="number" {...register('maxBudget')} className={inputCls} /></Field>

        <Field label={t('budgetCurrency')}>
          <select {...register('currency')} className={inputCls}>
            {CURRENCY_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>

        {isResidentielAchat && (
          <Field label={t('budgetFinancingMode')}>
            <div className="grid grid-cols-1 gap-3">
              {FINANCING_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('financingMode') === opt.id} label={opt.label} onChange={() => setValue('financingMode', opt.id as any)} />
              ))}
            </div>
          </Field>
        )}

        <Field label={t('budgetComment')} full>
          <textarea {...register('comment')} rows={3} className={inputCls}></textarea>
          {errors.comment && <span className="text-red-500 text-sm">{errors.comment.message}</span>}
        </Field>
      </div>
    </Section>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'BRANCH':
        return (
          <div className="w-full max-w-5xl animate-fade-in py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6 justify-items-center">
              {RESEARCH_BRANCHES.map((b) => (
                <CircleOption
                  key={b.id}
                  active={branch === b.id}
                  icon={BRANCH_ICONS[b.iconName] || Home}
                  label={b.label}
                  onClick={() => {
                    setValue('branch', b.id);
                    setValue('propertyType', '');
                    setValue('interlocutors', []);
                  }}
                />
              ))}
            </div>
            {errors.branch && <p className="text-red-500 text-sm text-center mt-4">{errors.branch.message}</p>}
          </div>
        );

      case 'TRANSACTION':
        return (
          <div className="w-full max-w-4xl animate-fade-in py-6 md:py-10">
            <div className="flex justify-center gap-8 md:gap-32">
              <CircleOption active={watch('transaction') === TransactionType.RENTAL} icon={Home} label={t('transactionRental')} size="lg" onClick={() => setValue('transaction', TransactionType.RENTAL)} />
              <CircleOption active={watch('transaction') === TransactionType.SALE} icon={Key} label={t('transactionSale')} size="lg" onClick={() => setValue('transaction', TransactionType.SALE)} />
            </div>
          </div>
        );

      case 'CRITERIA':
        return <div className="w-full max-w-4xl animate-fade-in space-y-10">{renderCriteriaStep()}</div>;

      case 'BUDGET':
        return <div className="w-full max-w-4xl animate-fade-in space-y-10">{renderBudgetStep()}</div>;

      case 'INTERLOCUTOR': {
        if (!branch) return null;
        const options = isResidentielAchat ? ACHAT_INTERLOCUTOR_OPTIONS : (RESEARCH_INTERLOCUTORS[branch as ResearchBranchId] || []);
        return (
          <div className="w-full max-w-2xl animate-fade-in space-y-8">
            {isResidentielAchat && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('interlocutorSituation')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SITUATION_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={watch('situation') === opt.id} label={opt.label} onChange={() => setValue('situation', opt.id as any)} />
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="h-5 w-5 text-[#00BFA6]" />
                <p className="text-gray-600 text-sm">
                  {isResidentielAchat ? t('interlocutorPreferredType') : t('interlocutorChooseWho')}
                </p>
              </div>
              {options.map((opt) => (
                <PillOption key={opt.id} checked={(watch('interlocutors') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('interlocutors', opt.id)} />
              ))}
            </div>
          </div>
        );
      }

      case 'CONTACT': {
        const showManualForm = !loggedInUser || !useMyInfo;
        return (
          <div className="w-full max-w-4xl animate-fade-in space-y-10">
            <Section title={t('contactTitle')} icon={MapPin}>
              {loggedInUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUseMyInfo(true)}
                    className={cn('p-4 rounded-xl border-2 text-left transition-all', useMyInfo ? 'border-[#00BFA6] bg-[#E6F8F6]' : 'border-gray-200 hover:border-gray-300')}
                  >
                    <div className="font-bold text-gray-900 text-sm">{t('contactUseMyInfo')}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {loggedInUser.userType === 'SOCIETE' ? loggedInUser.companyName : `${loggedInUser.firstName || ''} ${loggedInUser.lastName || ''}`.trim()} · {loggedInUser.email}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMyInfo(false)}
                    className={cn('p-4 rounded-xl border-2 text-left transition-all', !useMyInfo ? 'border-[#00BFA6] bg-[#E6F8F6]' : 'border-gray-200 hover:border-gray-300')}
                  >
                    <div className="font-bold text-gray-900 text-sm">{t('contactEnterOtherInfo')}</div>
                    <div className="text-xs text-gray-500 mt-1">{t('contactForOtherPersonOrCompany')}</div>
                  </button>
                </div>
              )}

              {showManualForm && (
                <>
                  <div className="flex justify-center gap-4 mb-2">
                    <label className="flex items-center gap-2 font-bold text-gray-900">
                      <input type="radio" {...register('userType')} value="PARTICULIER" className="accent-[#00BFA6]" /> {t('contactParticulier')}
                    </label>
                    <label className="flex items-center gap-2 font-bold text-gray-900">
                      <input type="radio" {...register('userType')} value="SOCIETE" className="accent-[#00BFA6]" /> {t('contactSociete')}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label={t('contactLastName')}><input type="text" {...register('lastName')} className={inputCls} /></Field>
                    <Field label={t('contactFirstName')}><input type="text" {...register('firstName')} className={inputCls} /></Field>
                    <Field label={t('contactEmail')}><input type="email" {...register('email')} className={inputCls} /></Field>
                    <Field label={t('contactPhone')}><input type="tel" {...register('phone')} className={inputCls} /></Field>
                    <Field label={t('contactAddress')} full><input type="text" {...register('address')} className={inputCls} /></Field>

                    {watch('userType') === 'SOCIETE' && (
                      <>
                        <Field label={t('contactCompanyName')}><input type="text" {...register('companyName')} className={inputCls} /></Field>
                        <Field label={t('contactActivity')}><input type="text" {...register('activity')} className={inputCls} /></Field>
                      </>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-3 mt-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <input type="checkbox" {...register('isDelegate')} className="h-4 w-4 accent-[#00BFA6]" />
                  {t('contactIsDelegate')}
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <input type="checkbox" {...register('receiveAlert')} className="h-4 w-4 accent-[#00BFA6]" />
                  {t('contactReceiveAlert')}
                </label>
              </div>
            </Section>
          </div>
        );
      }
    }
  };

  const isNextDisabled = currentStep === 'BRANCH' && !branch;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#00908A] h-[200px] w-full absolute top-0 left-0 z-0"></div>

      <div className="flex-1 flex flex-col items-center justify-start md:justify-center relative z-10 p-4 pt-[96px] md:pt-4">

        {/* Progress Stepper */}
        <div className="bg-white rounded-xl px-3 py-2 md:rounded-full md:px-6 md:py-3 border border-[#00BFA6]/25 shadow-lg mb-4 md:mb-8 w-full max-w-5xl flex justify-center overflow-x-auto">
          <div className="flex items-center w-full max-w-4xl">
            {steps.map((key, idx) => (
              <div key={key} className="flex items-center flex-1 min-w-0">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    idx <= currentStepIndex ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50',
                    currentStepIndex > idx ? 'bg-[#00BFA6] border-[#00BFA6] text-white' :
                    currentStepIndex === idx ? 'border-[#00BFA6] text-[#00BFA6]' : 'border-gray-400 text-gray-600'
                  )}
                  onClick={() => goToStep(idx)}
                >
                  {currentStepIndex > idx ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn('flex-1 min-w-0 h-0.5 mx-2', currentStepIndex > idx ? 'bg-[#00BFA6]' : 'bg-gray-300')}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          onKeyDown={(e) => {
            // Empêche la touche Entrée dans un champ de soumettre le formulaire (et donc de
            // sauter les étapes suivantes) : le seul bouton de soumission réel n'existe que
            // sur la toute dernière étape, mais un <form> HTML soumet quand même implicitement
            // sur Entrée si aucun bouton "submit" n'est actuellement monté.
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
              e.preventDefault();
            }
          }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-5xl overflow-visible min-h-[500px] flex flex-col"
        >
          <div className="p-4 md:p-8 border-b border-gray-100 flex items-center">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-500 hover:text-[#00BFA6] transition-colors font-medium mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                {t('back')}
              </button>
            )}
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">{STEP_LABELS[currentStep]}</h1>
          </div>

          <div className="p-6 md:p-10 flex-1 flex flex-col items-center justify-center text-left">
            {renderStep()}
          </div>

          <div className="p-6 md:p-8 border-t border-gray-100 flex justify-end items-center bg-gray-50/50 rounded-b-2xl md:rounded-b-3xl">
            {currentStepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isNextDisabled}
                className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-3 md:py-4 text-base md:text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all disabled:opacity-50"
              >
                {t('continueBtn')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-3 md:py-4 text-base md:text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all disabled:opacity-50"
              >
                {loading ? t('sending') : t('submit')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
