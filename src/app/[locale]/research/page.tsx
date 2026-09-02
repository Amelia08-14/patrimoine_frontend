'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  Home, Key, Factory, Briefcase, Trees, Hotel, Check, ArrowLeft,
  Ruler, MapPin, Handshake, Compass, Sparkles, ChevronDown, Building2, Store, Zap,
  Warehouse, Snowflake, Wrench, Users, Thermometer,
  Shield, Utensils, Wallet, CreditCard,
} from 'lucide-react';
import {
  RESEARCH_BRANCHES, RESEARCH_PROPERTY_TYPES, RESEARCH_INTERLOCUTORS,
  BUREAUX_EQUIPMENT_OPTIONS,
  HOTELIER_EQUIPMENT_OPTIONS, ResearchBranchId,
  SITUATION_OPTIONS, ACHAT_INTERLOCUTOR_OPTIONS, REALISATION_STAGE_OPTIONS,
  AIRPORT_PROXIMITY_OPTIONS, CURRENCY_OPTIONS, FINANCING_OPTIONS,
  OFFICE_SPACE_TYPE_OPTIONS, OFFICE_ENERGY_OPTIONS, GENERAL_STATE_OPTIONS, ZONE_TYPE_OPTIONS,
  VISIBILITY_OPTIONS, LOCAL_STYLE_ETAT_OPTIONS, LOCAL_ENVIRONMENT_OPTIONS, LOCAL_USAGE_OPTIONS,
  ENVIRONMENT_OPTIONS,
  RESIDENTIEL_TYPE_IDS, VILLA_LEVEL_ENTRANCE_OPTIONS,
  HANGAR_USAGE_OPTIONS, INDUSTRIAL_ZONE_OPTIONS, USINE_EQUIPMENT_OPTIONS, USINE_ACTIVITY_OPTIONS,
  CF_ACTIVITY_OPTIONS, CF_TYPE_FROID_OPTIONS, CF_MODE_GESTION_OPTIONS,
  INDUSTRIEL_LOCATION_INTERLOCUTOR_OPTIONS,
  HTL_PROFIL_GROUPE_OPTIONS, HTL_CLASSEMENT_OPTIONS, HTL_TYPE_ETABLISSEMENT_OPTIONS,
  HTL_FORMULE_OPTIONS, HTL_GAMME_CHAMBRE_OPTIONS, HTL_TYPE_COUCHAGE_OPTIONS,
  HTL_NATURE_BIEN_OPTIONS, HTL_ACCESSIBILITE_OPTIONS, HTL_AMBIANCE_OPTIONS,
  HTL_BALNEAIRE_OPTIONS, HTL_URBAIN_OPTIONS, HTL_SAHARIEN_OPTIONS, HTL_THERMAL_OPTIONS,
  HTL_CLIMATIQUE_OPTIONS, HTL_VUE_OPTIONS, HTL_SERVICES_REPAS_OPTIONS, HTL_CUISINE_OPTIONS,
  HTL_CONFORT_OPTIONS, HTL_FLUIDES_OPTIONS, HTL_LOISIRS_OPTIONS,
  HTL_PAIEMENTS_LOCAUX_OPTIONS, HTL_PAIEMENTS_INTL_OPTIONS,
  TER_AGRI_CULTURE_OPTIONS, TER_AGRI_ETAT_OPTIONS, TER_IND_ZONE_OPTIONS,
  TER_RES_ZONE_OPTIONS, TER_TOU_VOCATION_OPTIONS,
} from '@/data/researchConfig';
import { getCategoryColor } from '@/data/categoryColors';

const BRANCH_ICONS: Record<string, any> = { Home, Factory, Briefcase, Trees, Hotel };

enum TransactionType {
  RENTAL = 'RENTAL',
  SALE = 'SALE',
}

const inputCls = 'w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0094BD] outline-none transition-all bg-white font-medium text-gray-800';

// Séparateur de milliers à la saisie (budget) — n'affiche que le formatage, la valeur stockée
// dans le formulaire reste un nombre propre sans espaces.
const formatThousands = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === '') return '';
  const digits = String(value).replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('fr-FR');
};

// Pastille ronde sélectionnable (charte du dépôt d'annonce) — pour choix uniques (branche, type, transaction).
// `color` permute la teinte (hex + "R,G,B") pour les choix de catégorie — sinon bleu de marque par défaut.
const CircleOption = ({ active, onClick, icon: Icon, label, size = 'md', color }: { active: boolean; onClick: () => void; icon: any; label: string; size?: 'lg' | 'md' | 'sm'; color?: { hex: string; rgb: string } }) => {
  const [hovered, setHovered] = useState(false);
  const outer = size === 'lg' ? 'w-28 h-28 md:w-40 md:h-40' : size === 'md' ? 'w-32 h-32' : 'w-24 h-24';
  const inner = size === 'lg' ? 'w-20 h-20 md:w-32 md:h-32' : size === 'md' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'h-10 w-10 md:h-16 md:w-16' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8';
  const hex = color?.hex || '#0094BD';
  const rgb = color?.rgb || '0,148,189';
  const lit = active || hovered;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center gap-3 cursor-pointer group w-full"
    >
      <div
        className={cn(
          outer, 'rounded-full flex items-center justify-center transition-all duration-300 border-4 relative bg-white',
          active ? 'transform -translate-y-2' : hovered ? '-translate-y-1' : 'border-gray-100 shadow-[0_8px_16px_rgba(0,0,0,0.05)]'
        )}
        style={active ? { borderColor: hex, boxShadow: `0 8px 16px rgba(${rgb},0.35)` } : hovered ? { borderColor: `${hex}4D` } : undefined}
      >
        <div
          className={cn(inner, 'rounded-full flex items-center justify-center transition-colors duration-300', lit ? 'text-white' : 'bg-gray-50 text-gray-400')}
          style={lit ? { backgroundColor: active ? hex : `${hex}1A`, color: active ? '#fff' : hex } : undefined}
        >
          <Icon className={iconSize} />
        </div>
      </div>
      <span className={cn('font-bold text-center max-w-[160px] transition-colors', size === 'sm' ? 'text-sm' : 'text-base md:text-lg', !lit && 'text-gray-500')} style={lit ? { color: hex } : undefined}>
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
      checked ? 'border-[#0094BD] bg-[#0094BD]/[0.06] text-[#0094BD]' : 'border-gray-300 text-gray-900 hover:border-gray-400'
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
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#0094BD]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function OptionGroup({
  label, options, field, watch, toggle, icons = {}, gridClassName, translateNs,
}: {
  label: string;
  options: { id: string; label: string }[];
  field: any;
  watch: any;
  toggle: (field: any, value: string) => void;
  icons?: Record<string, any>;
  gridClassName?: string;
  /** Nom du groupe dans le namespace i18n ResearchOptions (ex. "ENVIRONMENT_OPTIONS") — si fourni,
      remplace `opt.label` (français en dur) par sa traduction quand elle existe. */
  translateNs?: string;
}) {
  const selected: string[] = watch(field) || [];
  const tOpt = useTranslations('ResearchOptions');
  const resolveLabel = (opt: { id: string; label: string }) => {
    if (!translateNs) return opt.label;
    const key = `${translateNs}.${opt.id}`;
    return tOpt.has(key) ? tOpt(key) : opt.label;
  };
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-3">{label}</label>
      <div className={gridClassName || 'grid grid-cols-2 md:grid-cols-3 gap-3'}>
        {options.map((opt) => (
          <PillOption key={opt.id} checked={selected.includes(opt.id)} label={resolveLabel(opt)} icon={icons[opt.id]} onChange={() => toggle(field, opt.id)} />
        ))}
      </div>
    </div>
  );
}

// Liste déroulante à choix multiple (charte du site : bordure teal au focus, coins arrondis,
// même apparence que les autres champs) — remplace le <select multiple> natif et la grille de
// pastilles, trop denses pour une liste pouvant compter plusieurs dizaines de communes.
function MultiSelectDropdown({
  options, selected, onToggle, placeholder, selectedLabel, emptyHint,
}: {
  options: { id: string | number; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  placeholder: string;
  selectedLabel: (count: number) => string;
  emptyHint?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(inputCls, 'flex items-center justify-between text-left cursor-pointer')}
      >
        <span className={selected.length > 0 ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {selected.length > 0 ? selectedLabel(selected.length) : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {options.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">{emptyHint}</p>
          ) : (
            options.map((opt) => {
              const id = String(opt.id);
              const checked = selected.includes(id);
              return (
                <label key={id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                  <input type="checkbox" checked={checked} onChange={() => onToggle(id)} className="h-4 w-4 accent-[#0094BD] rounded shrink-0" />
                  <span className={cn('text-sm', checked ? 'font-bold text-[#0094BD]' : 'font-medium text-gray-700')}>{opt.label}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function ResearchPage() {
  const t = useTranslations('Research');
  // RESEARCH_BRANCHES (data/researchConfig.ts) porte des `label` en français en dur, à ne jamais
  // rendre directement — Categories a déjà la traduction de chaque branche (mêmes ids), déjà
  // utilisée ailleurs sur le site (accueil, /announces...).
  const tc = useTranslations('Categories');
  // Les tableaux d'options de researchConfig.ts (SITUATION_OPTIONS, CURRENCY_OPTIONS...) portent un
  // `label` français en dur — ResearchOptions les traduit, converti branche par branche (Résidentiel
  // en premier) ; `.has()` retombe sur le label français tant qu'une branche n'est pas encore migrée,
  // pour ne jamais casser l'affichage d'une branche pas encore traitée.
  const tOpt = useTranslations('ResearchOptions');
  const optLabel = (ns: string, item: { id: string; label: string }) => {
    const key = `${ns}.${item.id}`;
    return tOpt.has(key) ? tOpt(key) : item.label;
  };
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

    // Industriel (Location) — fiches dédiées Hangar / Usine / Chambre Froide.
    hgUsageType: z.array(z.string()).optional(),
    hgSurfaceTerrainMin: z.coerce.number().optional(),
    hgSurfaceTerrainMax: z.coerce.number().optional(),
    hgSurfaceCouverteMin: z.coerce.number().optional(),
    hgSurfaceCouverteMax: z.coerce.number().optional(),
    hgHauteurMin: z.coerce.number().optional(),
    hgHauteurMax: z.coerce.number().optional(),
    hgZone: z.array(z.string()).optional(),
    hgEnergie: z.array(z.string()).optional(),

    usNature: z.array(z.string()).optional(),
    usNatureOther: z.string().optional(),
    usEquipement: z.array(z.string()).optional(),
    usSurfaceTerrainMin: z.coerce.number().optional(),
    usSurfaceTerrainMax: z.coerce.number().optional(),
    usSurfaceBatieMin: z.coerce.number().optional(),
    usSurfaceBatieMax: z.coerce.number().optional(),
    usZone: z.array(z.string()).optional(),
    usEnergie: z.array(z.string()).optional(),

    cfActivite: z.array(z.string()).optional(),
    cfActiviteOther: z.string().optional(),
    cfCapaciteMin: z.coerce.number().optional(),
    cfCapaciteMax: z.coerce.number().optional(),
    cfTypeFroidChoices: z.array(z.string()).optional(),
    cfModeGestionChoices: z.array(z.string()).optional(),

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

    // Fiche "Confier votre recherche — Hébergement et Séjour"
    htlProfilGroupe: z.string().optional(),
    htlGarantieDocs: z.boolean().optional(),
    htlStatutHebergeur: z.enum(['PARTICULIER', 'PROFESSIONNEL']).optional(),
    htlClassement: z.array(z.string()).optional(),
    htlTypeEtablissement: z.array(z.string()).optional(),
    htlFormule: z.string().optional(),
    htlGammeChambre: z.string().optional(),
    htlTypeCouchage: z.array(z.string()).optional(),
    htlNatureBien: z.array(z.string()).optional(),
    htlSurfaceMin: z.coerce.number().optional(),
    htlNbChambresMin: z.string().optional(),
    htlNbSalonsMin: z.string().optional(),
    htlNbSdbMin: z.string().optional(),
    htlSuiteParentale: z.enum(['OUI', 'NON']).optional(),
    htlAccessibilite: z.string().optional(),
    htlAmbiances: z.array(z.string()).optional(),
    htlBalneaire: z.string().optional(),
    htlUrbain: z.array(z.string()).optional(),
    htlSaharien: z.array(z.string()).optional(),
    htlThermal: z.array(z.string()).optional(),
    htlClimatique: z.array(z.string()).optional(),
    htlVue: z.array(z.string()).optional(),
    htlServicesRepas: z.array(z.string()).optional(),
    htlCuisine: z.array(z.string()).optional(),
    htlConfort: z.array(z.string()).optional(),
    htlFluides: z.array(z.string()).optional(),
    htlLoisirs: z.array(z.string()).optional(),
    htlBudgetMaxNuit: z.coerce.number().optional(),
    htlDevise: z.enum(['DZD', 'ETRANGERE']).optional(),
    htlAnnulation: z.enum(['FLEXIBLE', 'NON_REMBOURSABLE']).optional(),
    htlPaiementsLocaux: z.array(z.string()).optional(),
    htlPaiementsIntl: z.array(z.string()).optional(),

    // Fiches "Confier votre recherche — Terrains et Foncier" (4 fiches dédiées, même concept
    // que Bureaux/Industriel). Surface partagée (minSurface/maxSurface/surfaceUnit) avec le reste
    // de l'app ; façades partagé entre les 4 fiches.
    terrainSearchScope: z.enum(['AGRICOLE', 'INDUSTRIEL', 'RESIDENTIEL', 'TOURISTIQUE']).optional(),
    facadesMin: z.string().optional(),
    facadesMax: z.string().optional(),
    terAgriAltitudeMin: z.string().optional(),
    terAgriAltitudeMax: z.string().optional(),
    terAgriCulture: z.array(z.string()).optional(),
    terAgriEtat: z.array(z.string()).optional(),
    terIndZone: z.array(z.string()).optional(),
    terResZone: z.array(z.string()).optional(),
    terTouZet: z.enum(['OUI', 'NON']).optional(),
    terTouVocation: z.array(z.string()).optional(),
    terAgriCultureOther: z.string().optional(),
    terTouVocationOther: z.string().optional(),

    interlocutors: z.array(z.string()).optional(),

    cityId: z.coerce.number().optional(),
    cityIds: z.array(z.string()).optional(),
    towns: z.array(z.string()).optional(),

    minBudget: z.coerce.number().optional(),
    maxBudget: z.coerce.number().optional(),
    currency: z.enum(['DA', 'EUR', 'USD']).optional(),
    budgetUnit: z.enum(['DA', 'DA_M2', 'MILLION', 'MILLION_M2', 'MILLIARD']).optional(),
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

    // Fiche détaillée Résidentiel — Location / Achat
    resPropertyTypes: z.array(z.string()).optional(),
    villaLevelEntrance: z.enum(['SEPAREE', 'COMMUNE']).optional(),
    typologyMin: z.string().optional(),
    typologyMax: z.string().optional(),
    floorMin: z.string().optional(),
    floorMax: z.string().optional(),

    // Résidentiel — choix entre fiche "Recherche Groupée" (ci-dessus) et fiche dédiée à la
    // recherche d'un immeuble d'appartements entier (ci-dessous).
    searchScope: z.enum(['GROUPEE', 'IMMEUBLE']).optional(),
    // Type(s) d'immeuble recherché — choix multiple entre "typologies similaires" et "typologies
    // différentes" ; chacun a ses propres champs Typologie/Surface, Étage et Budget étant partagés.
    buildingTypeChoices: z.array(z.enum(['SIMILAIRES', 'DIFFERENTES'])).optional(),
    buildingTypologySimilaire: z.string().optional(),
    buildingSurfaceSimilaireMin: z.coerce.number().optional(),
    buildingSurfaceSimilaireMax: z.coerce.number().optional(),
    buildingTypologyMin: z.string().optional(),
    buildingTypologyMax: z.string().optional(),
    buildingFloorsMin: z.string().optional(),
    buildingFloorsMax: z.string().optional(),
    buildingSurfaceMin: z.coerce.number().optional(),
    buildingSurfaceMax: z.coerce.number().optional(),

    // Bureaux et Commerces — choix entre 3 fiches dédiées (même concept que Résidentiel).
    bureauxSearchScope: z.enum(['GROUPEE', 'IMMEUBLE', 'BLOC_ADMINISTRATIF', 'BLOC_COMMERCIAL', 'LOCAL_COMMERCIAL']).optional(),
    baSpaceTypes: z.array(z.string()).optional(),
    baEnergie: z.array(z.string()).optional(),
    bcEtatGeneral: z.array(z.string()).optional(),
    bcZoneType: z.array(z.string()).optional(),
    bcVisibilite: z.array(z.string()).optional(),
    lcStyleEtat: z.array(z.string()).optional(),
    lcEnvironnement: z.array(z.string()).optional(),
    lcUsage: z.array(z.string()).optional(),
    lcEnvironnementOther: z.string().optional(),
    lcUsageOther: z.string().optional(),

    // Industriel — choix entre 3 catégories (même concept que Bureaux et Commerces), fiche de
    // critères identique pour les 3 pour le moment.
    industrielSearchScope: z.enum(['HANGAR', 'USINE', 'CHAMBRE_FROIDE']).optional(),

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

  // Ordre : Transaction (Location/Achat) d'abord, puis catégorie d'annonce (Branche) — l'inverse
  // de l'ordre initial.
  const STEP_KEYS = ['TRANSACTION', 'BRANCH', 'RES_SEARCH_SCOPE', 'BUR_SEARCH_SCOPE', 'IND_SEARCH_SCOPE', 'TER_SEARCH_SCOPE', 'CRITERIA', 'BUDGET', 'INTERLOCUTOR', 'CONTACT'] as const;
  type StepKey = typeof STEP_KEYS[number];
  // Étapes à choix unique et immédiat (une grande pastille) : on avance dès le clic, sans passer
  // par le bouton "Continuer" — contrairement au dépôt d'annonces.
  const AUTO_ADVANCE_STEPS: StepKey[] = ['BRANCH', 'TRANSACTION', 'RES_SEARCH_SCOPE', 'BUR_SEARCH_SCOPE', 'IND_SEARCH_SCOPE', 'TER_SEARCH_SCOPE'];

  const STEP_LABELS: Record<StepKey, string> = {
    BRANCH: t('stepBranch'),
    TRANSACTION: t('stepTransaction'),
    RES_SEARCH_SCOPE: t('stepSearchScope'),
    BUR_SEARCH_SCOPE: t('stepSearchScope'),
    IND_SEARCH_SCOPE: t('stepSearchScope'),
    TER_SEARCH_SCOPE: t('stepSearchScope'),
    CRITERIA: t('stepCriteria'),
    BUDGET: t('stepBudget'),
    INTERLOCUTOR: t('stepInterlocutor'),
    CONTACT: t('stepContact'),
  };

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ResearchFormInput, any, ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      branch: '',
      outdoorSpaces: [],
      proximity: [],
      bureauxEquipments: [],
      viabilisation: [],
      hotelierEquipments: [],
      htlClassement: [],
      htlTypeEtablissement: [],
      htlTypeCouchage: [],
      htlNatureBien: [],
      htlAmbiances: [],
      htlUrbain: [],
      htlSaharien: [],
      htlThermal: [],
      htlClimatique: [],
      htlVue: [],
      htlServicesRepas: [],
      htlCuisine: [],
      htlConfort: [],
      htlFluides: [],
      htlLoisirs: [],
      htlPaiementsLocaux: [],
      htlPaiementsIntl: [],
      terAgriCulture: [],
      terAgriEtat: [],
      terIndZone: [],
      terResZone: [],
      terTouVocation: [],
      interlocutors: [],
      towns: [],
      userType: 'PARTICULIER',
      surfaceUnit: 'M2',
      currency: 'DA',
      budgetUnit: 'DA',
      views: [],
      environment: [],
      residenceAmenities: [],
      security: [],
      connectivity: [],
      resPropertyTypes: [],
      cityIds: [],
      buildingTypeChoices: [],
      baSpaceTypes: [],
      baEnergie: [],
      bcEtatGeneral: [],
      bcZoneType: [],
      bcVisibilite: [],
      lcStyleEtat: [],
      lcEnvironnement: [],
      lcUsage: [],
      hgUsageType: [],
      hgZone: [],
      hgEnergie: [],
      usNature: [],
      usEquipement: [],
      usZone: [],
      usEnergie: [],
      cfActivite: [],
      cfTypeFroidChoices: [],
      cfModeGestionChoices: [],
    },
  });

  // Brouillon auto-enregistré — si l'utilisateur quitte accidentellement (fermeture d'onglet,
  // coupure réseau...), il retrouve sa saisie en revenant sur la page. Stocké localement
  // (aucune pièce jointe ici, donc rien d'impossible à sérialiser), expire après 7 jours.
  const DRAFT_KEY = 'research-draft-v1';
  const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const [draftAvailable, setDraftAvailable] = useState<{ savedAt: number } | null>(null);
  const draftCheckedRef = useRef(false);

  useEffect(() => {
    if (draftCheckedRef.current) return;
    draftCheckedRef.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      setDraftAvailable({ savedAt: parsed.savedAt });
    } catch { /* brouillon corrompu — on l'ignore silencieusement */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = watch((values) => {
      const timeout = setTimeout(() => {
        try {
          // Rien de saisi (juste les valeurs par défaut) : inutile d'enregistrer un brouillon vide.
          if (!values.branch) return;
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step: currentStepIndex, savedAt: Date.now() }));
        } catch { /* quota localStorage dépassé ou navigation privée — on ignore */ }
      }, 800);
      return () => clearTimeout(timeout);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, currentStepIndex]);

  const resumeDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      reset(parsed.values);
      if (typeof parsed.step === 'number') setCurrentStepIndex(parsed.step);
    } catch { /* ignore */ }
    setDraftAvailable(null);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftAvailable(null);
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  };

  const branch = watch('branch') as ResearchBranchId | '';
  const isResidentielAchat = branch === 'RESIDENTIEL' && watch('transaction') === TransactionType.SALE;
  const isResidentielLocation = branch === 'RESIDENTIEL' && watch('transaction') === TransactionType.RENTAL;
  const selectedResPropertyTypes: string[] = watch('resPropertyTypes') || [];

  const isBureauxCommerces = branch === 'BUREAUX_COMMERCES';
  const isIndustriel = branch === 'INDUSTRIEL';
  // Les 3 fiches dédiées (Hangar/Usine/Chambre Froide) n'existent pour l'instant qu'en Location —
  // en Achat, l'ancien formulaire générique (avec Budget/Interlocuteur en étapes à part) reste
  // utilisé, donc le parcours court ne s'applique qu'à la Location.
  const isIndustrielLocation = isIndustriel && watch('transaction') === TransactionType.RENTAL;
  const isHotelier = branch === 'HOTELIER';
  const isTerrain = branch === 'TERRAIN_FONCIER';

  // Résidentiel (Location/Achat), Bureaux et Commerces, Industriel Location, Hébergement et
  // Séjour et Terrains et Foncier : fiche unique dédiée (critères + localisation + message) et
  // contact direct. Industriel Achat et les autres branches gardent le parcours complet
  // (Budget/Interlocuteur en étapes à part).
  const steps: StepKey[] = (isResidentielLocation || isResidentielAchat)
    ? ['TRANSACTION', 'BRANCH', 'RES_SEARCH_SCOPE', 'CRITERIA', 'CONTACT']
    : isBureauxCommerces
    ? ['TRANSACTION', 'BRANCH', 'BUR_SEARCH_SCOPE', 'CRITERIA', 'CONTACT']
    : isIndustrielLocation
    ? ['TRANSACTION', 'BRANCH', 'IND_SEARCH_SCOPE', 'CRITERIA', 'CONTACT']
    : isIndustriel
    ? ['TRANSACTION', 'BRANCH', 'IND_SEARCH_SCOPE', 'CRITERIA', 'BUDGET', 'INTERLOCUTOR', 'CONTACT']
    : isHotelier
    ? ['TRANSACTION', 'BRANCH', 'CRITERIA', 'CONTACT']
    : isTerrain
    ? ['TRANSACTION', 'BRANCH', 'TER_SEARCH_SCOPE', 'CRITERIA', 'CONTACT']
    : STEP_KEYS.filter((s) => s !== 'RES_SEARCH_SCOPE' && s !== 'BUR_SEARCH_SCOPE' && s !== 'IND_SEARCH_SCOPE' && s !== 'TER_SEARCH_SCOPE');
  const currentStep = steps[currentStepIndex];

  // Si le parcours se raccourcit (ex: on vient de choisir Résidentiel + Location) alors qu'on
  // était déjà plus loin dans l'ancien parcours plus long, on ramène l'index dans les clous.
  useEffect(() => {
    if (currentStepIndex > steps.length - 1) setCurrentStepIndex(steps.length - 1);
  }, [steps.length, currentStepIndex]);

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

  // Communes rattachées à la/les wilaya(s) sélectionnée(s) — une seule wilaya (cityId) sur le
  // parcours générique, plusieurs (cityIds) sur la fiche Résidentiel Location.
  const selectedCityId = watch('cityId');
  const selectedCityIds: string[] = watch('cityIds') || [];
  useEffect(() => {
    const ids = isResidentielLocation ? selectedCityIds : (selectedCityId ? [String(selectedCityId)] : []);
    if (ids.length === 0) { setTowns([]); return; }
    Promise.all(ids.map((id) => axios.get(`${apiUrl}/cities/${id}/towns`).then((res) => res.data).catch(() => [])))
      .then((results) => setTowns(results.flat()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResidentielLocation, selectedCityId, selectedCityIds.join(',')]);

  // Étape Contact : les champs restent toujours visibles/modifiables (plus de bloc masqué quand
  // on est connecté) — "Utiliser mes informations" les pré-remplit juste, pour laisser le temps
  // de les relire/ajuster avant l'envoi plutôt que de foncer droit sur le bouton "Envoyer".
  useEffect(() => {
    if (useMyInfo && loggedInUser) {
      setValue('lastName', loggedInUser.lastName || '');
      setValue('firstName', loggedInUser.firstName || '');
      setValue('email', loggedInUser.email || '');
      setValue('phone', loggedInUser.phone || '');
      setValue('address', loggedInUser.address || '');
      setValue('companyName', loggedInUser.companyName || '');
      setValue('activity', loggedInUser.activity || '');
      setValue('userType', loggedInUser.userType === 'SOCIETE' ? 'SOCIETE' : 'PARTICULIER');
    }
  }, [useMyInfo, loggedInUser, setValue]);

  // Le critère "type d'entrée" n'a de sens que si "Niveau de Villa" fait partie des types
  // recherchés — on l'efface dès qu'il est décoché pour ne pas envoyer une valeur orpheline.
  useEffect(() => {
    if (!selectedResPropertyTypes.includes('NIVEAU_VILLA')) {
      setValue('villaLevelEntrance', undefined as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResPropertyTypes.join('|')]);

  const toggleArrayValue = (field: keyof ResearchFormValues, value: string) => {
    const current = (watch(field) as string[]) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field as any, next as any);
  };

  // La fiche Résidentiel Location est longue (plusieurs sections) — sans ce reset, avancer
  // depuis le bas de cette page laisse le scroll où il était : l'étape Contact, bien plus
  // courte, se retrouve alors affichée hors-écran (on ne voit plus que le bouton du bas, déjà
  // passé de "Continuer" à "Envoyer") et on a l'impression que la recherche part toute seule.
  const scrollFormToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const nextStep = () => { setCurrentStepIndex((p) => Math.min(p + 1, steps.length - 1)); scrollFormToTop(); };
  const prevStep = () => { setCurrentStepIndex((p) => Math.max(p - 1, 0)); scrollFormToTop(); };
  const goToStep = (index: number) => {
    if (index <= currentStepIndex) { setCurrentStepIndex(index); scrollFormToTop(); }
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
          amenities.residentiel = { outdoorSpaces: data.outdoorSpaces, proximity: data.proximity, searchScope: data.searchScope || 'GROUPEE' };
          if (data.searchScope === 'IMMEUBLE') {
            amenities.residentiel.immeuble = {
              typeChoices: data.buildingTypeChoices || [],
              similaire: (data.buildingTypeChoices || []).includes('SIMILAIRES') ? {
                typology: data.buildingTypologySimilaire,
                surfaceMin: data.buildingSurfaceSimilaireMin,
                surfaceMax: data.buildingSurfaceSimilaireMax,
              } : undefined,
              differente: (data.buildingTypeChoices || []).includes('DIFFERENTES') ? {
                typologyMin: data.buildingTypologyMin,
                typologyMax: data.buildingTypologyMax,
                surfaceMin: data.buildingSurfaceMin,
                surfaceMax: data.buildingSurfaceMax,
              } : undefined,
              floorsMin: data.buildingFloorsMin,
              floorsMax: data.buildingFloorsMax,
              cityIds: data.cityIds || [],
              environment: data.environment,
              realisationStage: data.transaction === TransactionType.SALE ? data.realisationStage : undefined,
            };
            break;
          }
          if (data.transaction === TransactionType.RENTAL) {
            amenities.residentiel.location = {
              propertyTypes: data.resPropertyTypes || [],
              villaLevelEntrance: data.villaLevelEntrance,
              typologyMin: data.typologyMin,
              typologyMax: data.typologyMax,
              floorMin: data.floorMin,
              floorMax: data.floorMax,
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              budgetUnit: data.budgetUnit,
              cityIds: data.cityIds || [],
              environment: data.environment,
            };
          }
          if (data.transaction === TransactionType.SALE) {
            amenities.residentiel.achatHabitation = {
              // Mêmes champs que la fiche Location (mêmes composants) — seul ajout propre à
              // l'achat : l'état de réalisation.
              propertyTypes: data.resPropertyTypes || [],
              villaLevelEntrance: data.villaLevelEntrance,
              typologyMin: data.typologyMin,
              typologyMax: data.typologyMax,
              floorMin: data.floorMin,
              floorMax: data.floorMax,
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              budgetUnit: data.budgetUnit,
              cityIds: data.cityIds || [],
              environment: data.environment,
              realisationStage: data.realisationStage,
            };
          }
          break;
        case 'INDUSTRIEL':
          if (data.transaction === TransactionType.RENTAL) {
            amenities.industriel = { searchScope: data.industrielSearchScope };
            if (data.industrielSearchScope === 'USINE') {
              amenities.industriel.usine = {
                nature: data.usNature || [],
                natureOther: data.usNatureOther,
                equipement: data.usEquipement || [],
                surfaceTerrainMin: data.usSurfaceTerrainMin,
                surfaceTerrainMax: data.usSurfaceTerrainMax,
                surfaceBatieMin: data.usSurfaceBatieMin,
                surfaceBatieMax: data.usSurfaceBatieMax,
                zone: data.usZone || [],
                energie: data.usEnergie || [],
                cityIds: data.cityIds || [],
              };
            } else if (data.industrielSearchScope === 'CHAMBRE_FROIDE') {
              amenities.industriel.chambreFroide = {
                activite: data.cfActivite || [],
                activiteOther: data.cfActiviteOther,
                capaciteMin: data.cfCapaciteMin,
                capaciteMax: data.cfCapaciteMax,
                typeFroid: data.cfTypeFroidChoices || [],
                modeGestion: data.cfModeGestionChoices || [],
                cityIds: data.cityIds || [],
              };
            } else {
              amenities.industriel.hangar = {
                usageType: data.hgUsageType || [],
                surfaceTerrainMin: data.hgSurfaceTerrainMin,
                surfaceTerrainMax: data.hgSurfaceTerrainMax,
                surfaceCouverteMin: data.hgSurfaceCouverteMin,
                surfaceCouverteMax: data.hgSurfaceCouverteMax,
                hauteurMin: data.hgHauteurMin,
                hauteurMax: data.hgHauteurMax,
                zone: data.hgZone || [],
                energie: data.hgEnergie || [],
                cityIds: data.cityIds || [],
              };
            }
          } else {
            amenities.industriel = {
              storageSurfaceMin: data.storageSurfaceMin,
              storageSurfaceMax: data.storageSurfaceMax,
              ceilingHeight: data.ceilingHeight,
              truckAccess: !!data.truckAccess,
              technicalSpecs: data.technicalSpecs,
            };
          }
          break;
        case 'BUREAUX_COMMERCES':
          amenities.bureaux = { searchScope: data.bureauxSearchScope };
          if (data.bureauxSearchScope === 'GROUPEE') {
            // Fiche "Recherche Groupée" identique à celle du Résidentiel (mêmes champs, réutilisés
            // tels quels), simplement stockée sous amenities.bureaux.groupee.
            amenities.bureaux.groupee = {
              propertyTypes: data.resPropertyTypes || [],
              villaLevelEntrance: data.villaLevelEntrance,
              typologyMin: data.typologyMin,
              typologyMax: data.typologyMax,
              floorMin: data.floorMin,
              floorMax: data.floorMax,
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              budgetUnit: data.budgetUnit,
              cityIds: data.cityIds || [],
              environment: data.environment,
            };
          } else if (data.bureauxSearchScope === 'IMMEUBLE') {
            // Fiche "Recherche Immeuble" identique à celle du Résidentiel (mêmes champs, réutilisés
            // tels quels), simplement stockée sous amenities.bureaux.immeuble.
            amenities.bureaux.immeuble = {
              typeChoices: data.buildingTypeChoices || [],
              similaire: (data.buildingTypeChoices || []).includes('SIMILAIRES') ? {
                typology: data.buildingTypologySimilaire,
                surfaceMin: data.buildingSurfaceSimilaireMin,
                surfaceMax: data.buildingSurfaceSimilaireMax,
              } : undefined,
              differente: (data.buildingTypeChoices || []).includes('DIFFERENTES') ? {
                typologyMin: data.buildingTypologyMin,
                typologyMax: data.buildingTypologyMax,
                surfaceMin: data.buildingSurfaceMin,
                surfaceMax: data.buildingSurfaceMax,
              } : undefined,
              floorsMin: data.buildingFloorsMin,
              floorsMax: data.buildingFloorsMax,
              cityIds: data.cityIds || [],
              environment: data.environment,
            };
          } else if (data.bureauxSearchScope === 'BLOC_COMMERCIAL') {
            amenities.bureaux.blocCommercial = {
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              etatGeneral: data.bcEtatGeneral || [],
              zoneType: data.bcZoneType || [],
              visibilite: data.bcVisibilite || [],
              cityIds: data.cityIds || [],
            };
          } else if (data.bureauxSearchScope === 'LOCAL_COMMERCIAL') {
            amenities.bureaux.localCommercial = {
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              floorMin: data.floorMin,
              floorMax: data.floorMax,
              styleEtat: data.lcStyleEtat || [],
              environnement: data.lcEnvironnement || [],
              environnementOther: (data.lcEnvironnement || []).includes('AUTRE') ? data.lcEnvironnementOther : undefined,
              usage: data.lcUsage || [],
              usageOther: (data.lcUsage || []).includes('AUTRE') ? data.lcUsageOther : undefined,
              cityIds: data.cityIds || [],
            };
          } else {
            amenities.bureaux.blocAdministratif = {
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              floorMin: data.floorMin,
              floorMax: data.floorMax,
              budgetUnit: data.budgetUnit,
              spaceTypes: data.baSpaceTypes || [],
              energie: data.baEnergie || [],
              cityIds: data.cityIds || [],
            };
          }
          break;
        case 'TERRAIN_FONCIER':
          amenities.terrain = { searchScope: data.terrainSearchScope || 'AGRICOLE', surfaceUnit: data.surfaceUnit, facadesMin: data.facadesMin, facadesMax: data.facadesMax };
          if (data.terrainSearchScope === 'INDUSTRIEL') {
            amenities.terrain.industriel = { zone: data.terIndZone || [] };
          } else if (data.terrainSearchScope === 'RESIDENTIEL') {
            amenities.terrain.residentiel = { zone: data.terResZone || [] };
          } else if (data.terrainSearchScope === 'TOURISTIQUE') {
            amenities.terrain.touristique = {
              zet: data.terTouZet,
              vocation: data.terTouVocation || [],
              vocationOther: (data.terTouVocation || []).includes('AUTRE') ? data.terTouVocationOther : undefined,
            };
          } else {
            amenities.terrain.agricole = {
              altitudeMin: data.terAgriAltitudeMin,
              altitudeMax: data.terAgriAltitudeMax,
              culture: data.terAgriCulture || [],
              cultureOther: (data.terAgriCulture || []).includes('AUTRE') ? data.terAgriCultureOther : undefined,
              etat: data.terAgriEtat || [],
            };
          }
          break;
        case 'HOTELIER':
          amenities.hotelier = {
            profilGroupe: data.htlProfilGroupe,
            garantieDocs: !!data.htlGarantieDocs,
            statutHebergeur: data.htlStatutHebergeur,
            classement: data.htlStatutHebergeur === 'PROFESSIONNEL' ? (data.htlClassement || []) : undefined,
            typeEtablissement: data.htlStatutHebergeur === 'PROFESSIONNEL' ? (data.htlTypeEtablissement || []) : undefined,
            formule: data.htlFormule,
            gammeChambre: data.htlFormule === 'CHAMBRE_PRIVEE' ? data.htlGammeChambre : undefined,
            typeCouchage: data.htlFormule === 'A_LA_PLACE' ? (data.htlTypeCouchage || []) : undefined,
            natureBien: data.htlNatureBien || [],
            exigences: {
              surfaceMin: data.htlSurfaceMin,
              nbChambresMin: data.htlNbChambresMin,
              nbSalonsMin: data.htlNbSalonsMin,
              nbSdbMin: data.htlNbSdbMin,
              suiteParentale: data.htlSuiteParentale,
              accessibilite: data.htlAccessibilite,
            },
            ambiances: data.htlAmbiances || [],
            balneaire: data.htlBalneaire,
            urbain: data.htlUrbain || [],
            saharien: data.htlSaharien || [],
            thermal: data.htlThermal || [],
            climatique: data.htlClimatique || [],
            vue: data.htlVue || [],
            servicesRepas: data.htlServicesRepas || [],
            cuisine: data.htlCuisine || [],
            confort: data.htlConfort || [],
            fluides: data.htlFluides || [],
            loisirs: data.htlLoisirs || [],
            budgetMaxNuit: data.htlBudgetMaxNuit,
            devise: data.htlDevise,
            annulation: data.htlAnnulation,
            paiementsLocaux: data.htlPaiementsLocaux || [],
            paiementsIntl: data.htlPaiementsIntl || [],
            cityIds: data.cityIds || [],
          };
          break;
      }

      // Les champs restent toujours visibles/modifiables sur l'étape Contact (pré-remplis depuis
      // le profil si "Utiliser mes informations" est choisi) — on envoie donc ce qui est
      // effectivement affiché, pour respecter d'éventuelles corrections de dernière minute.
      const contact = {
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
        // Résidentiel Location permet plusieurs wilayas (cityIds) — la première sert de wilaya
        // "principale" pour l'affichage existant, la liste complète part dans `amenities`.
        cityId: data.cityId || (data.cityIds && data.cityIds.length > 0 ? Number(data.cityIds[0]) : undefined),
        towns: JSON.stringify(data.towns || []),
        comment: data.comment,
        ...contact,
        userId: loggedInUser?.id,
        realEstateType: data.branch,
        // Fiche Résidentiel Location : choix multiple — on le reflète aussi dans le champ plat
        // `propertyType` (comme du temps du choix unique) pour que /demandes et l'admin restent
        // cohérents, en plus du détail complet dans `amenities`.
        propertyType: (data.resPropertyTypes && data.resPropertyTypes.length > 0) ? data.resPropertyTypes.join(',') : data.propertyType,
        amenities: JSON.stringify(amenities),
      };

      await axios.post(`${apiUrl}/entrusted-research`, payload);
      clearDraft();
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
      // Le commentaire vit sur l'étape Budget dans le parcours complet, mais sur la fiche
      // Critères pour Résidentiel Location (parcours raccourci sans étape Budget dédiée).
      const idx = steps.includes('BUDGET') ? steps.indexOf('BUDGET') : steps.indexOf('CRITERIA');
      if (idx !== -1) setCurrentStepIndex(idx);
      alert(t('alertCommentRequired'));
      return;
    }
    // Repli : au lieu d'un message générique qui ne dit rien, on liste précisément le(s) champ(s)
    // en cause — un champ à choix (enum) rempli avec une valeur inattendue lève une erreur ici
    // même s'il est "optionnel", et le message générique masquait totalement ce genre de cas.
    const lines = Object.entries(formErrors).map(([key, err]: [string, any]) => {
      const message = err?.message
        || err?.root?.message
        || (Array.isArray(err) ? err.find((e: any) => e?.message)?.message : undefined)
        || 'Valeur invalide';
      return `- ${key}: ${message}`;
    });
    const idx = steps.includes('BUDGET') ? steps.indexOf('BUDGET') : steps.indexOf('CRITERIA');
    if (idx !== -1) setCurrentStepIndex(idx);
    alert(`${t('alertCheckInfo')}\n${lines.join('\n')}`);
  };

  const renderResidentielAchatCriteria = () => {
    return (
      <>
        {renderPropertyTypeSection()}
        {renderTypologyFloorSurfaceBudgetSection()}
        {renderEnvironmentSection()}

        {/* Seul ajout propre à l'achat par rapport à la fiche Location : l'état de réalisation,
            sur une seule ligne, sans texte de description. */}
        <Section title={t('sqRealisationStage')} icon={Sparkles}>
          <div className="flex flex-wrap gap-3">
            {REALISATION_STAGE_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={watch('realisationStage') === opt.id} label={optLabel('REALISATION_STAGE_OPTIONS', opt)} onChange={() => setValue('realisationStage', opt.id as any)} />
            ))}
          </div>
        </Section>

        {renderLocalisationSection({ hideDate: true })}
        {renderSharedInterlocutorSection()}
        {renderCommentSection()}
      </>
    );
  };

  // Fiche résidentiel — Location : types de bien en choix multiple (studio → villa, avec le
  // critère "type d'entrée" spécifique au Niveau de Villa), typologie/étage/surface exprimés
  // en "jusqu'à", et cadre/environnement en choix multiple.
  // Ligne compacte "De [x] à [y]" réutilisée pour typologie / étage / surface / budget — même
  // gabarit visuel partout (titre au-dessus, chip d'unité collé au champ).
  const renderRangeRow = (
    minField: 'typologyMin' | 'typologyMax' | 'floorMin' | 'floorMax' | 'minSurface' | 'maxSurface' | 'minBudget' | 'maxBudget',
    maxField: typeof minField,
    opts?: { unit?: string; unitPosition?: 'prefix' | 'suffix'; width?: string; useMinMaxLabels?: boolean },
  ) => {
    const unit = opts?.unit;
    const unitPosition = opts?.unitPosition || 'prefix';
    const width = opts?.width || 'w-16';
    const fromLabel = opts?.useMinMaxLabels ? t('resLocMin') : t('resLocTypologyFrom');
    const toLabel = opts?.useMinMaxLabels ? t('resLocMax') : t('resLocTypologyTo');
    const chip = unit ? (
      <span className={cn(
        'h-11 flex items-center justify-center font-black text-gray-400 text-xs bg-gray-100 whitespace-nowrap px-1.5',
        unitPosition === 'prefix' ? 'border-r-2 border-gray-300' : 'border-l-2 border-gray-300'
      )}>
        {unit}
      </span>
    ) : null;
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-sm font-bold text-gray-700 shrink-0">{fromLabel}</span>
        <div className="flex items-center rounded-xl border-2 border-gray-300 bg-gray-50 overflow-hidden shrink-0">
          {unitPosition === 'prefix' && chip}
          <input type="number" inputMode="numeric" {...register(minField)} className={cn(width, 'h-11 px-2 text-center font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#0094BD]')} />
          {unitPosition === 'suffix' && chip}
        </div>
        <span className="text-sm font-bold text-gray-700 shrink-0">{toLabel}</span>
        <div className="flex items-center rounded-xl border-2 border-gray-300 bg-gray-50 overflow-hidden shrink-0">
          {unitPosition === 'prefix' && chip}
          <input type="number" inputMode="numeric" {...register(maxField)} className={cn(width, 'h-11 px-2 text-center font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#0094BD]')} />
          {unitPosition === 'suffix' && chip}
        </div>
      </div>
    );
  };

  // --- Blocs partagés entre "Résidentiel Location" et "Résidentiel Achat" (même fiche, mêmes
  // champs pour tout ce qui est commun aux deux transactions). ---

  const renderPropertyTypeSection = () => {
    const hasNiveauVilla = selectedResPropertyTypes.includes('NIVEAU_VILLA');
    return (
      <Section title={t('resLocTypeSectionTitle')} icon={Home}>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">{t('resLocPropertyTypeSought')}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {RESEARCH_PROPERTY_TYPES.RESIDENTIEL.filter((rt) => (RESIDENTIEL_TYPE_IDS as readonly string[]).includes(rt.id)).map((rt) => (
              <PillOption key={rt.id} checked={selectedResPropertyTypes.includes(rt.id)} label={optLabel('RESEARCH_PROPERTY_TYPES.RESIDENTIEL', rt)} onChange={() => toggleArrayValue('resPropertyTypes', rt.id)} />
            ))}
          </div>
        </div>
        {hasNiveauVilla && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('resLocVillaEntrance')}</label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {VILLA_LEVEL_ENTRANCE_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('villaLevelEntrance') === opt.id} label={optLabel('VILLA_LEVEL_ENTRANCE_OPTIONS', opt)} onChange={() => setValue('villaLevelEntrance', opt.id as any)} />
              ))}
            </div>
          </div>
        )}
      </Section>
    );
  };

  // Ligne "Min [x] Max [y] [unité DA/m²/Millions...]" réutilisée partout où un budget est demandé.
  const renderBudgetInputs = () => (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-bold text-gray-700 shrink-0">{t('resLocMin')}</span>
      <input
        type="text" inputMode="numeric"
        value={formatThousands(watch('minBudget') as any)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, '');
          setValue('minBudget', (digits ? Number(digits) : undefined) as any);
        }}
        className="w-32 h-11 px-3 text-center font-bold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0094BD]"
      />
      <span className="text-sm font-bold text-gray-700 shrink-0">{t('resLocMax')}</span>
      <input
        type="text" inputMode="numeric"
        value={formatThousands(watch('maxBudget') as any)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, '');
          setValue('maxBudget', (digits ? Number(digits) : undefined) as any);
        }}
        className="w-32 h-11 px-3 text-center font-bold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0094BD]"
      />
      <select
        {...register('budgetUnit')}
        className="h-11 px-3 rounded-xl border-2 border-gray-300 bg-gray-100 font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#0094BD] cursor-pointer"
      >
        <option value="DA">DA</option>
        <option value="DA_M2">DA / m²</option>
        <option value="MILLION">Millions</option>
        <option value="MILLION_M2">Millions / m²</option>
        <option value="MILLIARD">Milliards</option>
      </select>
    </div>
  );

  // Interlocuteur — mêmes 3 options réutilisées partout (Résidentiel Location, Bureaux et
  // Commerces...) : Promoteur immobilier / Agence immobilière / Propriétaire particulier.
  const renderSharedInterlocutorSection = () => {
    const interlocutorOptions = RESEARCH_INTERLOCUTORS.RESIDENTIEL;
    return (
      <Section title={t('stepInterlocutor')} icon={Handshake}>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{t('interlocutorChooseWho')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {interlocutorOptions.map((opt) => (
              <PillOption key={opt.id} checked={(watch('interlocutors') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('interlocutors', opt.id)} />
            ))}
          </div>
        </div>
      </Section>
    );
  };

  // Interlocuteur — seulement 2 choix (Agence immobilière / Particulier) pour les fiches
  // Industriel Location (Hangar/Usine/Chambre Froide), contrairement aux 3 choix du Résidentiel.
  const renderIndustrielLocationInterlocutorSection = () => (
    <Section title={t('stepInterlocutor')} icon={Handshake}>
      <div className="space-y-3">
        <p className="text-sm text-gray-500">{t('interlocutorChooseWho')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          {INDUSTRIEL_LOCATION_INTERLOCUTOR_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('interlocutors') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('interlocutors', opt.id)} />
          ))}
        </div>
      </div>
    </Section>
  );

  // Champ "boxé" façon création d'annonce (label en gras au-dessus, encadré gris, "Ex:" en
  // placeholder) réutilisé pour Typologie/Surface/Étage — deux entrées (de/à) dans le même
  // encadré au lieu de la pastille grise compacte utilisée ailleurs sur la fiche.
  const renderBoxedRange = (
    label: string,
    minField: 'typologyMin' | 'floorMin' | 'minSurface'
      | 'buildingTypologyMin' | 'buildingFloorsMin' | 'buildingSurfaceMin' | 'buildingSurfaceSimilaireMin'
      | 'hgSurfaceTerrainMin' | 'hgSurfaceCouverteMin' | 'hgHauteurMin'
      | 'usSurfaceTerrainMin' | 'usSurfaceBatieMin' | 'cfCapaciteMin'
      | 'facadesMin' | 'terAgriAltitudeMin',
    maxField: 'typologyMax' | 'floorMax' | 'maxSurface'
      | 'buildingTypologyMax' | 'buildingFloorsMax' | 'buildingSurfaceMax' | 'buildingSurfaceSimilaireMax'
      | 'hgSurfaceTerrainMax' | 'hgSurfaceCouverteMax' | 'hgHauteurMax'
      | 'usSurfaceTerrainMax' | 'usSurfaceBatieMax' | 'cfCapaciteMax'
      | 'facadesMax' | 'terAgriAltitudeMax',
    opts?: { unit?: string; unitPosition?: 'prefix' | 'suffix'; placeholderMin?: string; placeholderMax?: string },
  ) => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <div className="flex items-center gap-1.5">
        {opts?.unit && opts.unitPosition !== 'suffix' && <span className="font-bold text-gray-700 text-base shrink-0">{opts.unit}</span>}
        <input
          type="number" inputMode="numeric" {...register(minField)}
          placeholder={opts?.placeholderMin}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        {opts?.unit && opts.unitPosition === 'suffix' && <span className="font-bold text-gray-500 text-xs shrink-0">{opts.unit}</span>}
        <span className="text-xs font-bold text-gray-400 shrink-0">{t('resLocTypologyTo')}</span>
        <input
          type="number" inputMode="numeric" {...register(maxField)}
          placeholder={opts?.placeholderMax}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        {opts?.unit && opts.unitPosition === 'suffix' && <span className="font-bold text-gray-500 text-xs shrink-0">{opts.unit}</span>}
      </div>
    </div>
  );

  // Variante à une seule valeur (pas de "de/à") — Typologie unique pour "typologies similaires".
  const renderBoxedSingle = (
    label: string,
    field: 'buildingTypologySimilaire',
    opts?: { unit?: string; unitPosition?: 'prefix' | 'suffix'; placeholder?: string },
  ) => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <div className="flex items-center gap-1.5">
        {opts?.unit && opts.unitPosition !== 'suffix' && <span className="font-bold text-gray-700 text-base shrink-0">{opts.unit}</span>}
        <input
          type="number" inputMode="numeric" {...register(field)}
          placeholder={opts?.placeholder}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        {opts?.unit && opts.unitPosition === 'suffix' && <span className="font-bold text-gray-500 text-xs shrink-0">{opts.unit}</span>}
      </div>
    </div>
  );

  // Champ "boxé" façon création d'annonce pour un montant unique (Budget min / Budget max).
  // L'unité (DA / m² / Millions...) est repliée dans le champ Budget Max lui-même (chip collée à
  // droite, dans le même encadré) au lieu d'une colonne "Devise" à part — gagne une colonne.
  const renderBoxedBudgetField = (label: string, field: 'minBudget' | 'maxBudget', opts?: { withUnit?: boolean }) => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <div className="flex items-center rounded-lg border-2 border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#0094BD] focus-within:border-[#0094BD] transition-all">
        <input
          type="text" inputMode="numeric"
          value={formatThousands(watch(field) as any)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '');
            setValue(field, (digits ? Number(digits) : undefined) as any);
          }}
          className="w-full min-w-0 p-2 outline-none bg-transparent font-medium text-gray-900 text-base text-center"
        />
        {opts?.withUnit && (
          <select
            {...register('budgetUnit')}
            className="h-full shrink-0 pl-1.5 pr-1 border-l-2 border-gray-300 bg-gray-100 font-bold text-[11px] text-gray-700 outline-none cursor-pointer"
          >
            <option value="DA">DA</option>
            <option value="DA_M2">DA/m²</option>
            <option value="MILLION">M DA</option>
            <option value="MILLION_M2">M/m²</option>
            <option value="MILLIARD">Md DA</option>
          </select>
        )}
      </div>
    </div>
  );

  // Caractéristiques et Budget — sur deux lignes pour laisser de la place à chaque champ :
  // Typologie / Surface / Étage sur la première, Budget min / Budget max sur la seconde (plus
  // large), design aligné sur les champs de la création d'annonce (encadré gris, label en gras
  // au-dessus) plutôt que la pastille compacte grise.
  const renderTypologyFloorSurfaceBudgetSection = () => (
    <Section title={t('resLocTypologyTitle')} icon={Ruler}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {renderBoxedRange(t('resLocTypologyRange'), 'typologyMin', 'typologyMax', { unit: 'F', unitPosition: 'prefix', placeholderMin: 'Ex: 3', placeholderMax: 'Ex: 5' })}
          {renderBoxedRange(t('resLocSurfaceMax'), 'minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 80', placeholderMax: 'Ex: 120' })}
          {renderBoxedRange(t('resLocFloorMax'), 'floorMin', 'floorMax', { placeholderMin: 'Ex: 0', placeholderMax: 'Ex: 4' })}
        </div>
        {/* Date d'installation envisagée — sur la même ligne que le budget, après Budget Min/Max
            (elle vivait avant dans la section Localisation, sous le nom "Date souhaitée"). */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {renderBoxedBudgetField(t('budgetMin'), 'minBudget')}
          {renderBoxedBudgetField(t('budgetMax'), 'maxBudget', { withUnit: true })}
          <div className="min-w-0">
            <label className="block text-sm font-bold text-gray-900 mb-2">{t('resLocInstallationDateTitle')}</label>
            <input
              type="date" {...register('installationDate')}
              className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base"
            />
          </div>
        </div>
      </div>
    </Section>
  );

  const renderLocalisationSection = (opts?: { showAirportProximity?: boolean; hideDate?: boolean }) => (
    <Section title={t('resLocLocalisationTitle')} icon={MapPin}>
      {/* Wilaya(s) - Commune(s) - Date souhaitée. Sur la fiche Résidentiel (Location/Achat, donc
          aussi Bureaux "Recherche Groupée" qui réutilise la même fiche), la date est déplacée dans
          la section Caractéristiques et Budget (hideDate) — les autres fiches (Immeuble, Bloc
          Administratif, Bloc Commercial, Local Commercial) gardent la date ici. */}
      <div className={cn('grid grid-cols-1 gap-6', opts?.hideDate ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
        <Field label={t('budgetCity')}>
          <MultiSelectDropdown
            options={cities.map((c) => ({ id: c.id, label: c.nameFr || c.name }))}
            selected={watch('cityIds') || []}
            onToggle={(id) => toggleArrayValue('cityIds', id)}
            placeholder={t('optSelect')}
            selectedLabel={(count) => t('wilayasSelectedCount', { count })}
          />
        </Field>
        <Field label={t('budgetTowns')}>
          <MultiSelectDropdown
            options={towns.map((tw) => ({ id: tw.id, label: tw.nameFr || tw.name }))}
            selected={watch('towns') || []}
            onToggle={(id) => toggleArrayValue('towns', id)}
            placeholder={t('optSelect')}
            selectedLabel={(count) => t('townsSelectedCount', { count })}
            emptyHint={t('budgetTownsHint')}
          />
        </Field>
        {!opts?.hideDate && (
          <Field label={t('budgetDesiredDate')}>
            <input type="date" {...register('installationDate')} className={inputCls} />
          </Field>
        )}
      </div>
      {opts?.showAirportProximity && (
        <div className="mt-6">
          <label className="block text-sm font-bold text-gray-900 mb-3">{t('budgetAirportProximity')}</label>
          <div className="flex flex-wrap gap-3">
            {AIRPORT_PROXIMITY_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={watch('airportProximity') === opt.id} label={optLabel('AIRPORT_PROXIMITY_OPTIONS', opt)} onChange={() => setValue('airportProximity', opt.id)} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );

  const renderEnvironmentSection = () => (
    <Section title={t('resLocEnvironmentTitle')} icon={Compass}>
      <OptionGroup label={t('resLocEnvironment')} options={ENVIRONMENT_OPTIONS} field="environment" watch={watch} toggle={toggleArrayValue} translateNs="ENVIRONMENT_OPTIONS" />
    </Section>
  );

  const renderCommentSection = () => (
    <Section title={t('resLocCommentTitle')} icon={Sparkles}>
      <textarea {...register('comment')} rows={3} className={inputCls} placeholder={t('resLocCommentPlaceholder')}></textarea>
      {errors.comment && <span className="text-red-500 text-sm">{errors.comment.message}</span>}
    </Section>
  );

  // Fiche "Recherche Immeuble d'appartements" — alternative à la fiche Résidentiel classique
  // quand on cherche l'immeuble entier plutôt qu'un lot précis. Localisation/date/commentaire
  // restent les mêmes blocs partagés que les autres fiches.
  // Ligne partagée Étage (uniquement si un seul type est choisi — sinon il est déjà affiché comme
  // "commun aux deux") / Budget min / Budget max / Date — jamais dupliquée même si les deux types
  // d'immeuble sont cochés à la fois.
  const renderImmeubleSharedRow = (includeFloor: boolean) => (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-5', includeFloor ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
      {includeFloor && renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: 'Ex: 0', placeholderMax: 'Ex: 4' })}
      {renderBoxedBudgetField(t('budgetMin'), 'minBudget')}
      {renderBoxedBudgetField(t('budgetMax'), 'maxBudget', { withUnit: true })}
      <div className="min-w-0">
        <label className="block text-sm font-bold text-gray-900 mb-2">{t('resLocInstallationDateTitle')}</label>
        <input
          type="date" {...register('installationDate')}
          className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base"
        />
      </div>
    </div>
  );

  const renderImmeubleCriteria = () => {
    const typeChoices: string[] = watch('buildingTypeChoices') || [];
    const hasSimilaires = typeChoices.includes('SIMILAIRES');
    const hasDifferentes = typeChoices.includes('DIFFERENTES');
    const hasBoth = hasSimilaires && hasDifferentes;

    return (
      <>
        {/* Type d'immeuble recherché — choix multiple, détermine les champs Typologie/Surface
            affichés juste en dessous (Étage/Budget/Date restent communs, jamais dupliqués). */}
        <Section title={t('immeubleTypeSectionTitle')} icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PillOption checked={hasSimilaires} label={t('immeubleTypeSimilaires')} onChange={() => toggleArrayValue('buildingTypeChoices', 'SIMILAIRES')} />
            <PillOption checked={hasDifferentes} label={t('immeubleTypeDifferentes')} onChange={() => toggleArrayValue('buildingTypeChoices', 'DIFFERENTES')} />
          </div>
        </Section>

        {(hasSimilaires || hasDifferentes) && (
          <Section title={t('resLocTypologyTitle')} icon={Ruler}>
            <div className="space-y-5">
              {hasBoth ? (
                <>
                  <div>
                    <h3 className="text-sm font-black text-gray-700 mb-3">{t('immeubleCaracSimilairesTitle')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                      {renderBoxedSingle(t('resLocTypologyRange'), 'buildingTypologySimilaire', { unit: 'F', unitPosition: 'prefix', placeholder: 'Ex: 3' })}
                      {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceSimilaireMin', 'buildingSurfaceSimilaireMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 80', placeholderMax: 'Ex: 120' })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-700 mb-3">{t('immeubleCaracDifferentesTitle')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {renderBoxedRange(t('resLocTypologyRange'), 'buildingTypologyMin', 'buildingTypologyMax', { unit: 'F', unitPosition: 'prefix', placeholderMin: 'Ex: 3', placeholderMax: 'Ex: 5' })}
                      {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceMin', 'buildingSurfaceMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 80', placeholderMax: 'Ex: 120' })}
                      {renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: 'Ex: 0', placeholderMax: 'Ex: 4' })}
                    </div>
                  </div>
                  {renderImmeubleSharedRow(false)}
                </>
              ) : hasSimilaires ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {renderBoxedSingle(t('resLocTypologyRange'), 'buildingTypologySimilaire', { unit: 'F', unitPosition: 'prefix', placeholder: 'Ex: 3' })}
                    {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceSimilaireMin', 'buildingSurfaceSimilaireMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 80', placeholderMax: 'Ex: 120' })}
                    {renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: 'Ex: 0', placeholderMax: 'Ex: 4' })}
                  </div>
                  {renderImmeubleSharedRow(false)}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {renderBoxedRange(t('resLocTypologyRange'), 'buildingTypologyMin', 'buildingTypologyMax', { unit: 'F', unitPosition: 'prefix', placeholderMin: 'Ex: 3', placeholderMax: 'Ex: 5' })}
                    {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceMin', 'buildingSurfaceMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 80', placeholderMax: 'Ex: 120' })}
                    {renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: 'Ex: 0', placeholderMax: 'Ex: 4' })}
                  </div>
                  {renderImmeubleSharedRow(false)}
                </>
              )}
            </div>
          </Section>
        )}

        {/* Localisation / Cadre de vie et Environnement / Interlocuteur / Message — exactement les
            mêmes blocs partagés que la fiche "Recherche Appartement, Villa, Niveau de Villa". */}
        {renderLocalisationSection({ hideDate: true })}
        {renderEnvironmentSection()}
        {renderSharedInterlocutorSection()}

        {/* Stade de réalisation — uniquement pour l'achat d'un immeuble (une location d'immeuble
            entier ne se conçoit pas "sur plan"). */}
        {isResidentielAchat && (
          <Section title={t('sqRealisationStage')} icon={Sparkles}>
            <div className="flex flex-wrap gap-3">
              {REALISATION_STAGE_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('realisationStage') === opt.id} label={opt.label} onChange={() => setValue('realisationStage', opt.id as any)} />
              ))}
            </div>
          </Section>
        )}

        {renderCommentSection()}
      </>
    );
  };

  const renderResidentielLocationCriteria = () => {
    return (
      <>
        {renderPropertyTypeSection()}
        {renderTypologyFloorSurfaceBudgetSection()}
        {renderLocalisationSection({ hideDate: true })}
        {renderEnvironmentSection()}
        {renderSharedInterlocutorSection()}
        {renderCommentSection()}
      </>
    );
  };

  // --- Bureaux et Commerces : fiches "Bloc Administratif" / "Bloc Commercial" / "Local
  // Commercial" (même concept que Résidentiel — choix de fiche puis critères + localisation +
  // interlocuteur + commentaire). Pour le moment, même fiche en Location et en Achat. ---

  const renderBlocAdministratifCriteria = () => (
    <>
      <Section title={t('burBlocAdminSectionTitle')} icon={Briefcase}>
        <div className="space-y-3">
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('burSurfaceRange')}</label>
              {renderRangeRow('minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', width: 'w-20' })}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('immeubleFloorsRange')}</label>
              {renderRangeRow('floorMin', 'floorMax', { width: 'w-20' })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('resLocBudgetRangeTitle')}</label>
            {renderBudgetInputs()}
          </div>
        </div>
      </Section>

      <Section title={t('burSpaceTypeTitle')} icon={Home}>
        <OptionGroup label={t('burSpaceTypeLabel')} options={OFFICE_SPACE_TYPE_OPTIONS} field="baSpaceTypes" watch={watch} toggle={toggleArrayValue} />
      </Section>

      <Section title={t('burEnergyTitle')} icon={Zap}>
        <OptionGroup label={t('burEnergyLabel')} options={OFFICE_ENERGY_OPTIONS} field="baEnergie" watch={watch} toggle={toggleArrayValue} />
      </Section>

      {renderLocalisationSection()}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  const renderBlocCommercialCriteria = () => (
    <>
      <Section title={t('burBlocCommSectionTitle')} icon={Building2}>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('burSurfaceRange')}</label>
          {renderRangeRow('minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', width: 'w-20' })}
        </div>
      </Section>

      <Section title={t('burEtatGeneralTitle')} icon={Sparkles}>
        <div className="flex flex-wrap gap-3">
          {GENERAL_STATE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('bcEtatGeneral') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('bcEtatGeneral', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('burZoneTypeTitle')} icon={Compass}>
        <div className="flex flex-wrap gap-3">
          {ZONE_TYPE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('bcZoneType') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('bcZoneType', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('burVisibiliteTitle')} icon={Store}>
        <div className="flex flex-wrap gap-3">
          {VISIBILITY_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('bcVisibilite') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('bcVisibilite', opt.id)} />
          ))}
        </div>
      </Section>

      {renderLocalisationSection()}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  const renderLocalCommercialCriteria = () => (
    <>
      <Section title={t('burLocalCommSectionTitle')} icon={Store}>
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('burSurfaceRange')}</label>
            {renderRangeRow('minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', width: 'w-20' })}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('immeubleFloorsRange')}</label>
            {renderRangeRow('floorMin', 'floorMax', { width: 'w-20' })}
          </div>
        </div>
      </Section>

      <Section title={t('burStyleEtatTitle')} icon={Sparkles}>
        <div className="flex flex-wrap gap-3">
          {LOCAL_STYLE_ETAT_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('lcStyleEtat') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('lcStyleEtat', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('burLocalEnvironmentTitle')} icon={Compass}>
        <div className="space-y-3">
          <OptionGroup label={t('burLocalEnvironmentLabel')} options={LOCAL_ENVIRONMENT_OPTIONS} field="lcEnvironnement" watch={watch} toggle={toggleArrayValue} />
          {(watch('lcEnvironnement') || []).includes('AUTRE') && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('autrePrecisezLabel')}</label>
              <input type="text" {...register('lcEnvironnementOther')} className={inputCls} placeholder={t('autrePrecisezPlaceholder')} />
            </div>
          )}
        </div>
      </Section>

      <Section title={t('burLocalUsageTitle')} icon={Briefcase}>
        <div className="space-y-3">
          <OptionGroup label={t('burLocalUsageLabel')} options={LOCAL_USAGE_OPTIONS} field="lcUsage" watch={watch} toggle={toggleArrayValue} />
          {(watch('lcUsage') || []).includes('AUTRE') && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('autrePrecisezLabel')}</label>
              <input type="text" {...register('lcUsageOther')} className={inputCls} placeholder={t('autrePrecisezPlaceholder')} />
            </div>
          )}
        </div>
      </Section>

      {renderLocalisationSection()}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  // --- Industriel (Location) — fiches "Hangar" / "Usine" / "Chambre Froide" (même concept que
  // Bureaux et Commerces). Interlocuteur réduit à 2 choix (Agence/Particulier), spécifique à ces
  // 3 fiches. Budget/Date sur une ligne partagée, comme partout ailleurs sur ce formulaire. ---

  const renderIndustrielBudgetDateRow = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {renderBoxedBudgetField(t('budgetMin'), 'minBudget')}
      {renderBoxedBudgetField(t('budgetMax'), 'maxBudget', { withUnit: true })}
      <div className="min-w-0">
        <label className="block text-sm font-bold text-gray-900 mb-2">{t('indLocDateTitle')}</label>
        <input
          type="date" {...register('installationDate')}
          className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base"
        />
      </div>
    </div>
  );

  const renderHangarLocationCriteria = () => (
    <>
      <Section title={t('hgUsageTitle')} icon={Warehouse}>
        <div className="flex flex-wrap gap-3">
          {HANGAR_USAGE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('hgUsageType') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('hgUsageType', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('resLocTypologyTitle')} icon={Ruler}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {renderBoxedRange(t('hgSurfaceTerrainLabel'), 'hgSurfaceTerrainMin', 'hgSurfaceTerrainMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 500', placeholderMax: 'Ex: 1000' })}
            {renderBoxedRange(t('hgSurfaceCouverteLabel'), 'hgSurfaceCouverteMin', 'hgSurfaceCouverteMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 300', placeholderMax: 'Ex: 800' })}
            {renderBoxedRange(t('hgHauteurLabel'), 'hgHauteurMin', 'hgHauteurMax', { unit: 'm', unitPosition: 'suffix', placeholderMin: 'Ex: 5', placeholderMax: 'Ex: 8' })}
          </div>
          {renderIndustrielBudgetDateRow()}
        </div>
      </Section>

      <Section title={t('indEmplacementTitle')} icon={Compass}>
        <div className="flex flex-wrap gap-3">
          {INDUSTRIAL_ZONE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('hgZone') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('hgZone', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('burEnergyTitle')} icon={Zap}>
        <OptionGroup label={t('burEnergyLabel')} options={OFFICE_ENERGY_OPTIONS} field="hgEnergie" watch={watch} toggle={toggleArrayValue} gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-3" />
      </Section>

      {renderLocalisationSection({ hideDate: true })}
      {renderIndustrielLocationInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  const renderUsineLocationCriteria = () => {
    const natureList: string[] = watch('usNature') || [];
    return (
      <>
        <Section title={t('usNatureTitle')} icon={Factory}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {USINE_ACTIVITY_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={natureList.includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('usNature', opt.id)} />
              ))}
            </div>
            {natureList.includes('AUTRE_ACTIVITE') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">{t('usNatureOtherLabel')}</label>
                <input type="text" {...register('usNatureOther')} className={inputCls} placeholder={t('usNatureOtherPlaceholder')} />
              </div>
            )}
          </div>
        </Section>

        <Section title={t('usEquipmentTitle')} icon={Wrench}>
          <div className="flex flex-wrap gap-3">
            {USINE_EQUIPMENT_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={(watch('usEquipement') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('usEquipement', opt.id)} />
            ))}
          </div>
        </Section>

        <Section title={t('resLocTypologyTitle')} icon={Ruler}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
              {renderBoxedRange(t('usSurfaceTerrainLabel'), 'usSurfaceTerrainMin', 'usSurfaceTerrainMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 500', placeholderMax: 'Ex: 1500' })}
              {renderBoxedRange(t('usSurfaceBatieLabel'), 'usSurfaceBatieMin', 'usSurfaceBatieMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 300', placeholderMax: 'Ex: 1000' })}
            </div>
            {renderIndustrielBudgetDateRow()}
          </div>
        </Section>

        <Section title={t('indEmplacementTitle')} icon={Compass}>
          <div className="flex flex-wrap gap-3">
            {INDUSTRIAL_ZONE_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={(watch('usZone') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('usZone', opt.id)} />
            ))}
          </div>
        </Section>

        <Section title={t('burEnergyTitle')} icon={Zap}>
          <OptionGroup label={t('burEnergyLabel')} options={OFFICE_ENERGY_OPTIONS} field="usEnergie" watch={watch} toggle={toggleArrayValue} gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-3" />
        </Section>

        {renderLocalisationSection({ hideDate: true })}
        {renderIndustrielLocationInterlocutorSection()}
        {renderCommentSection()}
      </>
    );
  };

  const renderChambreFroideLocationCriteria = () => {
    const activiteList: string[] = watch('cfActivite') || [];
    return (
      <>
        <Section title={t('cfActiviteTitle')} icon={Snowflake}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CF_ACTIVITY_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={activiteList.includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('cfActivite', opt.id)} />
              ))}
            </div>
            {activiteList.includes('AUTRE_CF') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">{t('cfActiviteOtherLabel')}</label>
                <input type="text" {...register('cfActiviteOther')} className={inputCls} placeholder={t('cfActiviteOtherPlaceholder')} />
              </div>
            )}
          </div>
        </Section>

        <Section title={t('cfInfraTitle')} icon={Ruler}>
          <div className="space-y-5">
            <div className="max-w-xs">
              {renderBoxedRange(t('cfCapaciteLabel'), 'cfCapaciteMin', 'cfCapaciteMax', { unit: 'm³', unitPosition: 'suffix', placeholderMin: 'Ex: 50', placeholderMax: 'Ex: 200' })}
            </div>
            {renderIndustrielBudgetDateRow()}
          </div>
        </Section>

        <Section title={t('cfTypeFroidTitle')} icon={Thermometer}>
          <div className="flex flex-wrap gap-3">
            {CF_TYPE_FROID_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={(watch('cfTypeFroidChoices') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('cfTypeFroidChoices', opt.id)} />
            ))}
          </div>
        </Section>

        <Section title={t('cfModeGestionTitle')} icon={Users}>
          <div className="flex flex-wrap gap-3">
            {CF_MODE_GESTION_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={(watch('cfModeGestionChoices') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('cfModeGestionChoices', opt.id)} />
            ))}
          </div>
        </Section>

        {renderLocalisationSection({ hideDate: true })}
        {renderIndustrielLocationInterlocutorSection()}
        {renderCommentSection()}
      </>
    );
  };

  // Champ boxé générique à valeur unique (même style que renderBoxedRange/renderBoxedSingle mais
  // pas lié à un champ typé précis) — réutilisé pour les quelques champs numériques uniques de la
  // fiche Hébergement et Séjour (surface min, budget max/nuitée...).
  const renderHtlBoxedNumber = (label: string, field: any, opts?: { unit?: string; placeholder?: string }) => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <div className="flex items-center rounded-lg border-2 border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#0094BD] focus-within:border-[#0094BD] transition-all">
        <input
          type="number" inputMode="numeric" {...register(field)}
          placeholder={opts?.placeholder}
          className="w-full min-w-0 p-2 outline-none bg-transparent font-medium text-gray-900 text-base text-center"
        />
        {opts?.unit && <span className="h-full flex items-center px-2 border-l-2 border-gray-300 bg-gray-100 font-bold text-gray-500 text-xs shrink-0">{opts.unit}</span>}
      </div>
    </div>
  );

  // Fiche "Confier votre recherche — Hébergement et Séjour" : profil du demandeur, statut légal
  // de l'hébergeur souhaité (particulier déclaré vs établissement classé), formule et type de
  // bien, cadre/ambiance/vue, équipements & services, puis budget et modalités de paiement.
  const renderHotelierCriteria = () => {
    const statutHebergeur = watch('htlStatutHebergeur');
    const formule = watch('htlFormule');
    const ambiances: string[] = watch('htlAmbiances') || [];
    return (
      <>
        {/* 1. Profil du Demandeur & Validité Civile */}
        <Section title={t('htlProfilTitle')} icon={Users}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlProfilGroupeLabel')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {HTL_PROFIL_GROUPE_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={watch('htlProfilGroupe') === opt.id} label={opt.label} onChange={() => setValue('htlProfilGroupe', opt.id as any)} />
                ))}
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300">
              <input type="checkbox" {...register('htlGarantieDocs')} className="mt-0.5 h-4 w-4 accent-[#0094BD] shrink-0" />
              <span className="text-sm font-medium text-gray-700">{t('htlGarantieDocsLabel')}</span>
            </label>
          </div>
        </Section>

        {/* 2. Statut Légal de l'Hébergeur Souhaité */}
        <Section title={t('htlStatutTitle')} icon={Shield}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PillOption checked={statutHebergeur === 'PARTICULIER'} label={t('htlStatutParticulierLabel')} onChange={() => setValue('htlStatutHebergeur', 'PARTICULIER')} />
              <PillOption checked={statutHebergeur === 'PROFESSIONNEL'} label={t('htlStatutProLabel')} onChange={() => setValue('htlStatutHebergeur', 'PROFESSIONNEL')} />
            </div>
            {statutHebergeur === 'PROFESSIONNEL' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlClassementLabel')}</label>
                  <div className="flex flex-wrap gap-3">
                    {HTL_CLASSEMENT_OPTIONS.map((opt) => (
                      <PillOption key={opt.id} checked={(watch('htlClassement') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlClassement', opt.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlTypeEtablissementLabel')}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {HTL_TYPE_ETABLISSEMENT_OPTIONS.map((opt) => (
                      <PillOption key={opt.id} checked={(watch('htlTypeEtablissement') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlTypeEtablissement', opt.id)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* 3. Formule de Location & Type de Structure Souhaitée */}
        <Section title={t('htlFormuleSectionTitle')} icon={Home}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlFormuleLabel')}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HTL_FORMULE_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={formule === opt.id} label={opt.label} onChange={() => setValue('htlFormule', opt.id as any)} />
                ))}
              </div>
            </div>

            {formule === 'CHAMBRE_PRIVEE' && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlGammeChambreLabel')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_GAMME_CHAMBRE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={watch('htlGammeChambre') === opt.id} label={opt.label} onChange={() => setValue('htlGammeChambre', opt.id as any)} />
                  ))}
                </div>
              </div>
            )}

            {formule === 'A_LA_PLACE' && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlTypeCouchageLabel')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_TYPE_COUCHAGE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlTypeCouchage') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlTypeCouchage', opt.id)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlNatureBienLabel')}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HTL_NATURE_BIEN_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={(watch('htlNatureBien') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlNatureBien', opt.id)} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900">{t('htlExigencesTitle')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {renderHtlBoxedNumber(t('htlSurfaceMinLabel'), 'htlSurfaceMin', { unit: 'm²', placeholder: 'Ex: 60' })}
                {renderHtlBoxedNumber(t('htlNbChambresMinLabel'), 'htlNbChambresMin', { placeholder: 'Ex: 2' })}
                {renderHtlBoxedNumber(t('htlNbSalonsMinLabel'), 'htlNbSalonsMin', { placeholder: 'Ex: 1' })}
                {renderHtlBoxedNumber(t('htlNbSdbMinLabel'), 'htlNbSdbMin', { placeholder: 'Ex: 1' })}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlSuiteParentaleLabel')}</label>
                <div className="flex gap-3">
                  <PillOption checked={watch('htlSuiteParentale') === 'OUI'} label={t('optYes')} onChange={() => setValue('htlSuiteParentale', 'OUI')} />
                  <PillOption checked={watch('htlSuiteParentale') === 'NON'} label={t('optNo')} onChange={() => setValue('htlSuiteParentale', 'NON')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlAccessibiliteLabel')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_ACCESSIBILITE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={watch('htlAccessibilite') === opt.id} label={opt.label} onChange={() => setValue('htlAccessibilite', opt.id as any)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Cadre, Ambiance & Attractions de Proximité */}
        <Section title={t('htlCadreTitle')} icon={Compass}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlAmbianceLabel')}</label>
              <div className="flex flex-wrap gap-3">
                {HTL_AMBIANCE_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={ambiances.includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlAmbiances', opt.id)} />
                ))}
              </div>
            </div>

            {ambiances.includes('BALNEAIRE') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlBalneaireTitle')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_BALNEAIRE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={watch('htlBalneaire') === opt.id} label={opt.label} onChange={() => setValue('htlBalneaire', opt.id as any)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('URBAIN') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlUrbainTitle')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_URBAIN_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlUrbain') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlUrbain', opt.id)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('SAHARIEN') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlSaharienTitle')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_SAHARIEN_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlSaharien') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlSaharien', opt.id)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('THERMAL') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlThermalTitle')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_THERMAL_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlThermal') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlThermal', opt.id)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('CLIMATIQUE') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlClimatiqueTitle')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_CLIMATIQUE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlClimatique') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlClimatique', opt.id)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlVueLabel')}</label>
              <div className="flex flex-wrap gap-3">
                {HTL_VUE_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={(watch('htlVue') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlVue', opt.id)} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 5. Équipements, Services & Secours Autonome */}
        <Section title={t('htlEquipementsTitle')} icon={Utensils}>
          <div className="space-y-4">
            <OptionGroup label={t('htlServicesRepasLabel')} options={HTL_SERVICES_REPAS_OPTIONS} field="htlServicesRepas" watch={watch} toggle={toggleArrayValue} />
            <OptionGroup label={t('htlCuisineLabel')} options={HTL_CUISINE_OPTIONS} field="htlCuisine" watch={watch} toggle={toggleArrayValue} gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-3" />
            <OptionGroup label={t('htlConfortLabel')} options={HTL_CONFORT_OPTIONS} field="htlConfort" watch={watch} toggle={toggleArrayValue} gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-3" />
            <OptionGroup label={t('htlFluidesLabel')} options={HTL_FLUIDES_OPTIONS} field="htlFluides" watch={watch} toggle={toggleArrayValue} />
            <OptionGroup label={t('htlLoisirsLabel')} options={HTL_LOISIRS_OPTIONS} field="htlLoisirs" watch={watch} toggle={toggleArrayValue} />
          </div>
        </Section>

        {/* 6. Budget, Modalités Financières & Paiement */}
        <Section title={t('htlBudgetSectionTitle')} icon={Wallet}>
          <div className="space-y-5">
            <div className="max-w-xs">
              {renderHtlBoxedNumber(t('htlBudgetMaxNuitLabel'), 'htlBudgetMaxNuit', { unit: 'DZD', placeholder: 'Ex: 8000' })}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlDeviseLabel')}</label>
              <div className="flex flex-wrap gap-3">
                <PillOption checked={watch('htlDevise') === 'DZD'} label={t('htlDeviseDzd')} onChange={() => setValue('htlDevise', 'DZD')} />
                <PillOption checked={watch('htlDevise') === 'ETRANGERE'} label={t('htlDeviseEtrangere')} onChange={() => setValue('htlDevise', 'ETRANGERE')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlAnnulationLabel')}</label>
              <div className="flex flex-wrap gap-3">
                <PillOption checked={watch('htlAnnulation') === 'FLEXIBLE'} label={t('htlAnnulationFlexible')} onChange={() => setValue('htlAnnulation', 'FLEXIBLE')} />
                <PillOption checked={watch('htlAnnulation') === 'NON_REMBOURSABLE'} label={t('htlAnnulationNonRemb')} onChange={() => setValue('htlAnnulation', 'NON_REMBOURSABLE')} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#0094BD]" /> {t('htlPaiementsLocauxLabel')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_PAIEMENTS_LOCAUX_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlPaiementsLocaux') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlPaiementsLocaux', opt.id)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#0094BD]" /> {t('htlPaiementsIntlLabel')}</label>
                <div className="flex flex-wrap gap-3">
                  {HTL_PAIEMENTS_INTL_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlPaiementsIntl') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('htlPaiementsIntl', opt.id)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {renderLocalisationSection()}
        {renderCommentSection()}
      </>
    );
  };

  // --- Terrains et Foncier : fiches "Terrain Agricole" / "Terrain Industriel" / "Terrain
  // Résidentiel" / "Terrain Touristique" (même concept que Bureaux/Industriel). Surface et
  // façades sont des champs génériques partagés entre les 4 fiches. ---

  const renderTerSurfaceWithUnit = () => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-2">{t('terSurfaceLabel')}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" inputMode="numeric" {...register('minSurface')}
          placeholder="Ex: 500"
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        <span className="text-xs font-bold text-gray-400 shrink-0">{t('resLocTypologyTo')}</span>
        <input
          type="number" inputMode="numeric" {...register('maxSurface')}
          placeholder="Ex: 2000"
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        <select
          {...register('surfaceUnit')}
          className="h-[42px] shrink-0 px-2 border-2 border-gray-300 rounded-lg bg-gray-100 font-bold text-xs text-gray-700 outline-none cursor-pointer"
        >
          <option value="M2">m²</option>
          <option value="HA">{t('optHectares')}</option>
        </select>
      </div>
    </div>
  );

  const renderTerrainAgricoleCriteria = () => (
    <>
      <Section title={t('terSurfaceDimensionTitle')} icon={Ruler}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {renderTerSurfaceWithUnit()}
          {renderBoxedRange(t('terAltitudeLabel'), 'terAgriAltitudeMin', 'terAgriAltitudeMax', { unit: 'm', unitPosition: 'suffix', placeholderMin: 'Ex: 100', placeholderMax: 'Ex: 500' })}
          {renderBoxedRange(t('terFacadesLabel'), 'facadesMin', 'facadesMax', { placeholderMin: 'Ex: 1', placeholderMax: 'Ex: 2' })}
        </div>
      </Section>

      <Section title={t('terAgriCultureTitle')} icon={Trees}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {TER_AGRI_CULTURE_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={(watch('terAgriCulture') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('terAgriCulture', opt.id)} />
            ))}
          </div>
          {(watch('terAgriCulture') || []).includes('AUTRE') && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('autrePrecisezLabel')}</label>
              <input type="text" {...register('terAgriCultureOther')} className={inputCls} placeholder={t('autrePrecisezPlaceholder')} />
            </div>
          )}
        </div>
      </Section>

      <Section title={t('terAgriEtatTitle')} icon={Sparkles}>
        <div className="flex flex-wrap gap-3">
          {TER_AGRI_ETAT_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('terAgriEtat') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('terAgriEtat', opt.id)} />
          ))}
        </div>
      </Section>

      {renderIndustrielBudgetDateRow()}
      {renderLocalisationSection({ hideDate: true })}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  const renderTerrainIndustrielCriteria = () => (
    <>
      <Section title={t('terSurfaceDimensionTitle')} icon={Ruler}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {renderBoxedRange(t('terSurfaceLabel'), 'minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 500', placeholderMax: 'Ex: 2000' })}
          {renderBoxedRange(t('terFacadesLabel'), 'facadesMin', 'facadesMax', { placeholderMin: 'Ex: 1', placeholderMax: 'Ex: 2' })}
        </div>
      </Section>

      <Section title={t('terIndZoneTitle')} icon={Compass}>
        <div className="flex flex-wrap gap-3">
          {TER_IND_ZONE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('terIndZone') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('terIndZone', opt.id)} />
          ))}
        </div>
      </Section>

      {renderIndustrielBudgetDateRow()}
      {renderLocalisationSection({ hideDate: true })}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  const renderTerrainResidentielCriteria = () => (
    <>
      <Section title={t('terSurfaceDimensionTitle')} icon={Ruler}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {renderBoxedRange(t('terSurfaceLabel'), 'minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', placeholderMin: 'Ex: 200', placeholderMax: 'Ex: 600' })}
          {renderBoxedRange(t('terFacadesLabel'), 'facadesMin', 'facadesMax', { placeholderMin: 'Ex: 1', placeholderMax: 'Ex: 2' })}
        </div>
      </Section>

      <Section title={t('terResZoneTitle')} icon={Compass}>
        <div className="flex flex-wrap gap-3">
          {TER_RES_ZONE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('terResZone') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('terResZone', opt.id)} />
          ))}
        </div>
      </Section>

      {renderIndustrielBudgetDateRow()}
      {renderLocalisationSection({ hideDate: true })}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  const renderTerrainTouristiqueCriteria = () => (
    <>
      <Section title={t('terSurfaceDimensionTitle')} icon={Ruler}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {renderTerSurfaceWithUnit()}
          {renderBoxedRange(t('terFacadesLabel'), 'facadesMin', 'facadesMax', { placeholderMin: 'Ex: 1', placeholderMax: 'Ex: 2' })}
        </div>
      </Section>

      <Section title={t('terTouZetTitle')} icon={Sparkles}>
        <div className="flex gap-3">
          <PillOption checked={watch('terTouZet') === 'OUI'} label={t('optYes')} onChange={() => setValue('terTouZet', 'OUI')} />
          <PillOption checked={watch('terTouZet') === 'NON'} label={t('optNo')} onChange={() => setValue('terTouZet', 'NON')} />
        </div>
      </Section>

      <Section title={t('terTouVocationTitle')} icon={Compass}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {TER_TOU_VOCATION_OPTIONS.map((opt) => (
              <PillOption key={opt.id} checked={(watch('terTouVocation') || []).includes(opt.id)} label={opt.label} onChange={() => toggleArrayValue('terTouVocation', opt.id)} />
            ))}
          </div>
          {(watch('terTouVocation') || []).includes('AUTRE') && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('autrePrecisezLabel')}</label>
              <input type="text" {...register('terTouVocationOther')} className={inputCls} placeholder={t('autrePrecisezPlaceholder')} />
            </div>
          )}
        </div>
      </Section>

      {renderIndustrielBudgetDateRow()}
      {renderLocalisationSection({ hideDate: true })}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  const renderCriteriaStep = () => {
    switch (branch) {
      case 'RESIDENTIEL':
        if (watch('searchScope') === 'IMMEUBLE') return renderImmeubleCriteria();
        if (isResidentielAchat) return renderResidentielAchatCriteria();
        return renderResidentielLocationCriteria();

      case 'INDUSTRIEL':
        // Fiches dédiées (Hangar/Usine/Chambre Froide) uniquement en Location pour le moment —
        // l'Achat garde l'ancien formulaire générique en attendant une spécification dédiée.
        if (watch('transaction') === TransactionType.RENTAL) {
          switch (watch('industrielSearchScope')) {
            case 'USINE': return renderUsineLocationCriteria();
            case 'CHAMBRE_FROIDE': return renderChambreFroideLocationCriteria();
            case 'HANGAR':
            default:
              return renderHangarLocationCriteria();
          }
        }
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
              <input type="checkbox" {...register('truckAccess')} className="h-4 w-4 accent-[#0094BD]" />
              {t('indTruckAccess')}
            </label>
          </Section>
        );

      case 'BUREAUX_COMMERCES':
        switch (watch('bureauxSearchScope')) {
          // Mêmes fiches que "Confier votre recherche Résidentiel" (Recherche Groupée / Recherche
          // Immeuble d'appartements), littéralement réutilisées telles quelles pour Bureaux et
          // Commerces, en plus des 3 fiches spécifiques ci-dessous.
          case 'GROUPEE': return renderResidentielLocationCriteria();
          case 'IMMEUBLE': return renderImmeubleCriteria();
          case 'BLOC_COMMERCIAL': return renderBlocCommercialCriteria();
          case 'LOCAL_COMMERCIAL': return renderLocalCommercialCriteria();
          case 'BLOC_ADMINISTRATIF':
          default:
            return renderBlocAdministratifCriteria();
        }

      case 'TERRAIN_FONCIER':
        switch (watch('terrainSearchScope')) {
          case 'INDUSTRIEL': return renderTerrainIndustrielCriteria();
          case 'RESIDENTIEL': return renderTerrainResidentielCriteria();
          case 'TOURISTIQUE': return renderTerrainTouristiqueCriteria();
          case 'AGRICOLE':
          default:
            return renderTerrainAgricoleCriteria();
        }

      case 'HOTELIER':
        return renderHotelierCriteria();

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

        <Field label={t('budgetDesiredDate')}>
          <input type="date" {...register('installationDate')} className={inputCls} />
        </Field>

        <Field label={t('budgetTowns')} full>
          <MultiSelectDropdown
            options={towns.map((tw) => ({ id: tw.id, label: tw.nameFr || tw.name }))}
            selected={watch('towns') || []}
            onToggle={(id) => toggleArrayValue('towns', id)}
            placeholder={t('optSelect')}
            selectedLabel={(count) => t('townsSelectedCount', { count })}
            emptyHint={t('budgetTownsHint')}
          />
        </Field>

        {isResidentielAchat && (
          <Field label={t('budgetAirportProximity')} full>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AIRPORT_PROXIMITY_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('airportProximity') === opt.id} label={optLabel('AIRPORT_PROXIMITY_OPTIONS', opt)} onChange={() => setValue('airportProximity', opt.id)} />
              ))}
            </div>
          </Field>
        )}

        {/* Budget — la devise est une unité affichée à part (pastilles), pas un champ séparé */}
        <Field label={t('budgetMin')}>
          <input type="number" {...register('minBudget')} className={inputCls} />
        </Field>
        <Field label={t('budgetMax')}>
          <input type="number" {...register('maxBudget')} className={inputCls} />
        </Field>
        <Field label={t('budgetCurrency')} full>
          <div className="flex gap-3">
            {CURRENCY_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setValue('currency', c.id as any)}
                className={cn(
                  'h-11 px-6 rounded-xl border-2 font-black text-sm transition-all',
                  watch('currency') === c.id ? 'border-[#0094BD] bg-[#0094BD]/[0.06] text-[#0094BD]' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-gray-50'
                )}
              >
                {optLabel('CURRENCY_OPTIONS', c)}
              </button>
            ))}
          </div>
        </Field>

        {isResidentielAchat && (
          <Field label={t('budgetFinancingMode')}>
            <div className="grid grid-cols-1 gap-3">
              {FINANCING_OPTIONS.map((opt) => (
                <PillOption key={opt.id} checked={watch('financingMode') === opt.id} label={optLabel('FINANCING_OPTIONS', opt)} onChange={() => setValue('financingMode', opt.id as any)} />
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
                  label={tc(b.id)}
                  color={getCategoryColor(b.id)}
                  onClick={() => {
                    setValue('branch', b.id);
                    setValue('propertyType', '');
                    setValue('resPropertyTypes', []);
                    setValue('interlocutors', []);
                    setValue('searchScope', undefined as any);
                    setValue('bureauxSearchScope', undefined as any);
                    setValue('industrielSearchScope', undefined as any);
                    setValue('terrainSearchScope', undefined as any);
                    // Fluide comme une sélection de carte : on avance directement à l'étape
                    // suivante au clic, pas besoin du bouton "Continuer" (contrairement au dépôt
                    // d'annonces) pour un choix aussi simple.
                    nextStep();
                  }}
                />
              ))}
            </div>
            {errors.branch && <p className="text-red-500 text-sm text-center mt-4">{errors.branch.message}</p>}
          </div>
        );

      case 'TRANSACTION':
        return (
          <div className="w-full max-w-sm md:max-w-md mx-auto animate-fade-in py-4 md:py-6">
            <div className="flex justify-center gap-8 md:gap-14">
              <CircleOption active={watch('transaction') === TransactionType.RENTAL} icon={Home} label={t('transactionRental')} size="lg" onClick={() => { setValue('transaction', TransactionType.RENTAL); nextStep(); }} />
              <CircleOption active={watch('transaction') === TransactionType.SALE} icon={Key} label={t('transactionSale')} size="lg" onClick={() => { setValue('transaction', TransactionType.SALE); nextStep(); }} />
            </div>
          </div>
        );

      case 'RES_SEARCH_SCOPE':
        return (
          <div className="w-full max-w-sm md:max-w-md mx-auto animate-fade-in py-4 md:py-6">
            {/* Pas de flex-wrap : sur une pastille "w-full", ça repasse les deux options en
                colonne dès que le conteneur autorise le retour à la ligne — comme pour l'étape
                Transaction, elles doivent rester côte à côte sur une seule ligne. */}
            <div className="flex justify-center gap-8 md:gap-14">
              <CircleOption
                active={watch('searchScope') === 'GROUPEE'}
                icon={Home}
                label={t('resSearchScopeGroupee')}
                size="lg"
                onClick={() => { setValue('searchScope', 'GROUPEE'); nextStep(); }}
              />
              <CircleOption
                active={watch('searchScope') === 'IMMEUBLE'}
                icon={Building2}
                label={t('resSearchScopeImmeuble')}
                size="lg"
                onClick={() => { setValue('searchScope', 'IMMEUBLE'); nextStep(); }}
              />
            </div>
          </div>
        );

      case 'BUR_SEARCH_SCOPE':
        return (
          <div className="w-full max-w-5xl animate-fade-in py-6 md:py-10">
            {/* 5 pastilles : grille (comme l'étape Branche) plutôt qu'une rangée flex, sinon le
                w-full interne de CircleOption les fait repasser en colonne dès que ça déborde. */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-6 justify-items-center">
              <CircleOption
                active={watch('bureauxSearchScope') === 'GROUPEE'}
                icon={Home}
                label={t('resSearchScopeGroupee')}
                size="md"
                onClick={() => { setValue('bureauxSearchScope', 'GROUPEE'); nextStep(); }}
              />
              <CircleOption
                active={watch('bureauxSearchScope') === 'IMMEUBLE'}
                icon={Building2}
                label={t('resSearchScopeImmeuble')}
                size="md"
                onClick={() => { setValue('bureauxSearchScope', 'IMMEUBLE'); nextStep(); }}
              />
              <CircleOption
                active={watch('bureauxSearchScope') === 'BLOC_ADMINISTRATIF'}
                icon={Briefcase}
                label={t('burScopeBlocAdmin')}
                size="md"
                onClick={() => { setValue('bureauxSearchScope', 'BLOC_ADMINISTRATIF'); nextStep(); }}
              />
              <CircleOption
                active={watch('bureauxSearchScope') === 'BLOC_COMMERCIAL'}
                icon={Building2}
                label={t('burScopeBlocCommercial')}
                size="md"
                onClick={() => { setValue('bureauxSearchScope', 'BLOC_COMMERCIAL'); nextStep(); }}
              />
              <CircleOption
                active={watch('bureauxSearchScope') === 'LOCAL_COMMERCIAL'}
                icon={Store}
                label={t('burScopeLocalCommercial')}
                size="md"
                onClick={() => { setValue('bureauxSearchScope', 'LOCAL_COMMERCIAL'); nextStep(); }}
              />
            </div>
          </div>
        );

      case 'IND_SEARCH_SCOPE':
        return (
          <div className="w-full max-w-4xl animate-fade-in py-6 md:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 gap-x-6 justify-items-center">
              <CircleOption
                active={watch('industrielSearchScope') === 'HANGAR'}
                icon={Warehouse}
                label={t('indScopeHangar')}
                size="md"
                onClick={() => { setValue('industrielSearchScope', 'HANGAR'); nextStep(); }}
              />
              <CircleOption
                active={watch('industrielSearchScope') === 'USINE'}
                icon={Factory}
                label={t('indScopeUsine')}
                size="md"
                onClick={() => { setValue('industrielSearchScope', 'USINE'); nextStep(); }}
              />
              <CircleOption
                active={watch('industrielSearchScope') === 'CHAMBRE_FROIDE'}
                icon={Snowflake}
                label={t('indScopeChambreFroide')}
                size="md"
                onClick={() => { setValue('industrielSearchScope', 'CHAMBRE_FROIDE'); nextStep(); }}
              />
            </div>
          </div>
        );

      case 'TER_SEARCH_SCOPE':
        return (
          <div className="w-full max-w-4xl animate-fade-in py-6 md:py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-6 justify-items-center">
              <CircleOption
                active={watch('terrainSearchScope') === 'AGRICOLE'}
                icon={Trees}
                label={t('terScopeAgricole')}
                size="md"
                onClick={() => { setValue('terrainSearchScope', 'AGRICOLE'); nextStep(); }}
              />
              <CircleOption
                active={watch('terrainSearchScope') === 'INDUSTRIEL'}
                icon={Factory}
                label={t('terScopeIndustriel')}
                size="md"
                onClick={() => { setValue('terrainSearchScope', 'INDUSTRIEL'); nextStep(); }}
              />
              <CircleOption
                active={watch('terrainSearchScope') === 'RESIDENTIEL'}
                icon={Home}
                label={t('terScopeResidentiel')}
                size="md"
                onClick={() => { setValue('terrainSearchScope', 'RESIDENTIEL'); nextStep(); }}
              />
              <CircleOption
                active={watch('terrainSearchScope') === 'TOURISTIQUE'}
                icon={Hotel}
                label={t('terScopeTouristique')}
                size="md"
                onClick={() => { setValue('terrainSearchScope', 'TOURISTIQUE'); nextStep(); }}
              />
            </div>
          </div>
        );

      case 'CRITERIA':
        return <div className="w-full max-w-4xl animate-fade-in space-y-6">{renderCriteriaStep()}</div>;

      case 'BUDGET':
        return <div className="w-full max-w-4xl animate-fade-in space-y-10">{renderBudgetStep()}</div>;

      case 'INTERLOCUTOR': {
        if (!branch) return null;
        const options = isResidentielAchat ? ACHAT_INTERLOCUTOR_OPTIONS : (RESEARCH_INTERLOCUTORS[branch as ResearchBranchId] || []);
        const optionsNs = isResidentielAchat ? 'ACHAT_INTERLOCUTOR_OPTIONS' : `RESEARCH_INTERLOCUTORS.${branch}`;
        return (
          <div className="w-full max-w-2xl animate-fade-in space-y-8">
            {isResidentielAchat && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('interlocutorSituation')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SITUATION_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={watch('situation') === opt.id} label={optLabel('SITUATION_OPTIONS', opt)} onChange={() => setValue('situation', opt.id as any)} />
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="h-5 w-5 text-[#0094BD]" />
                <p className="text-gray-600 text-sm">
                  {isResidentielAchat ? t('interlocutorPreferredType') : t('interlocutorChooseWho')}
                </p>
              </div>
              {options.map((opt) => (
                <PillOption key={opt.id} checked={(watch('interlocutors') || []).includes(opt.id)} label={optLabel(optionsNs, opt)} onChange={() => toggleArrayValue('interlocutors', opt.id)} />
              ))}
            </div>
          </div>
        );
      }

      case 'CONTACT': {
        // Champs masqués quand "Utiliser mes informations" est choisi (déjà pré-remplis en
        // silence par l'effet ci-dessus, inutile de les réafficher) — visibles seulement pour
        // saisir les coordonnées d'une autre personne/société.
        const showManualForm = !loggedInUser || !useMyInfo;
        return (
          <div className="w-full max-w-4xl animate-fade-in space-y-10">
            <Section title={t('contactTitle')} icon={MapPin}>
              {loggedInUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUseMyInfo(true)}
                    className={cn('p-4 rounded-xl border-2 text-left transition-all', useMyInfo ? 'border-[#0094BD] bg-[#E6F8F6]' : 'border-gray-200 hover:border-gray-300')}
                  >
                    <div className="font-bold text-gray-900 text-sm">{t('contactUseMyInfo')}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {loggedInUser.userType === 'SOCIETE' ? loggedInUser.companyName : `${loggedInUser.firstName || ''} ${loggedInUser.lastName || ''}`.trim()} · {loggedInUser.email}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMyInfo(false)}
                    className={cn('p-4 rounded-xl border-2 text-left transition-all', !useMyInfo ? 'border-[#0094BD] bg-[#E6F8F6]' : 'border-gray-200 hover:border-gray-300')}
                  >
                    <div className="font-bold text-gray-900 text-sm">{t('contactEnterOtherInfo')}</div>
                    <div className="text-xs text-gray-500 mt-1">{t('contactForOtherPersonOrCompany')}</div>
                  </button>
                </div>
              )}

              {/* Récapitulatif lisible de ce qui sera envoyé quand on utilise son propre profil —
                  pas un formulaire à remplir, mais un vrai contenu à relire avant "Envoyer" (pas
                  juste 2 boutons puis le bouton d'envoi). */}
              {!showManualForm && (
                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{t('contactLastName')} / {t('contactFirstName')}</div>
                    <div className="font-bold text-gray-900">{`${loggedInUser?.firstName || ''} ${loggedInUser?.lastName || ''}`.trim() || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{t('contactEmail')}</div>
                    <div className="font-bold text-gray-900">{loggedInUser?.email || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{t('contactPhone')}</div>
                    <div className="font-bold text-gray-900">{loggedInUser?.phone || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{t('contactAddress')}</div>
                    <div className="font-bold text-gray-900">{loggedInUser?.address || '—'}</div>
                  </div>
                  {loggedInUser?.userType === 'SOCIETE' && loggedInUser?.companyName && (
                    <div className="sm:col-span-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{t('contactCompanyName')}</div>
                      <div className="font-bold text-gray-900">{loggedInUser.companyName}</div>
                    </div>
                  )}
                </div>
              )}

              {showManualForm && (
                <>
                  <div className="flex justify-center gap-4 mb-2">
                    <label className="flex items-center gap-2 font-bold text-gray-900">
                      <input type="radio" {...register('userType')} value="PARTICULIER" className="accent-[#0094BD]" /> {t('contactParticulier')}
                    </label>
                    <label className="flex items-center gap-2 font-bold text-gray-900">
                      <input type="radio" {...register('userType')} value="SOCIETE" className="accent-[#0094BD]" /> {t('contactSociete')}
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
                  <input type="checkbox" {...register('isDelegate')} className="h-4 w-4 accent-[#0094BD]" />
                  {t('contactIsDelegate')}
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <input type="checkbox" {...register('receiveAlert')} className="h-4 w-4 accent-[#0094BD]" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#022229] flex flex-col">
      <div className="h-[220px] w-full absolute top-0 left-0 z-0 overflow-hidden bg-[#003B4A]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04566B] via-[#003B4A] to-[#00181E]" />
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/[0.06] blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start md:justify-center relative z-10 p-4 pt-[96px] md:pt-4">

        {draftAvailable && (
          <div className="w-full max-w-5xl mb-4 md:mb-6 bg-white border-2 border-[#0094BD]/30 rounded-2xl shadow-lg px-4 py-3 md:px-6 md:py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-[#0094BD]/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-[#0094BD]" />
              </span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t('draftFoundTitle')}</p>
                <p className="text-xs text-gray-500">{t('draftFoundDesc', { time: new Date(draftAvailable.savedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={discardDraft} className="text-sm font-bold text-gray-500 hover:text-gray-700 px-3 py-2">
                {t('draftDiscard')}
              </button>
              <button type="button" onClick={resumeDraft} className="bg-[#0094BD] hover:bg-[#003B4A] text-white rounded-full px-5 py-2 text-sm font-bold transition-all">
                {t('draftResume')}
              </button>
            </div>
          </div>
        )}

        {/* Progress Stepper */}
        <div className="bg-white rounded-xl px-3 py-2 md:rounded-full md:px-6 md:py-3 border border-[#0094BD]/25 shadow-lg mb-4 md:mb-8 w-full max-w-5xl flex justify-center overflow-x-auto">
          <div className="flex items-center w-full max-w-4xl">
            {steps.map((key, idx) => (
              <div key={key} className="flex items-center flex-1 min-w-0">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    idx <= currentStepIndex ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50',
                    currentStepIndex > idx ? 'bg-[#0094BD] border-[#0094BD] text-white' :
                    currentStepIndex === idx ? 'border-[#0094BD] text-[#0094BD]' : 'border-gray-400 text-gray-600'
                  )}
                  onClick={() => goToStep(idx)}
                >
                  {currentStepIndex > idx ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn('flex-1 min-w-0 h-0.5 mx-2', currentStepIndex > idx ? 'bg-[#0094BD]' : 'bg-gray-300')}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <form
          onSubmit={(e) => {
            // Verrou dur : quelle que soit la cause d'un événement submit (Entrée dans un champ,
            // clic hasardeux, bouton mal typé...), on refuse d'envoyer tant qu'on n'est pas
            // effectivement sur la toute dernière étape. C'est ça qui empêchait "Continuer"
            // d'envoyer la recherche à la place de faire avancer l'étape.
            if (currentStepIndex !== steps.length - 1) {
              e.preventDefault();
              return;
            }
            handleSubmit(onSubmit, onInvalid)(e);
          }}
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
                className="flex items-center gap-2 text-gray-500 hover:text-[#0094BD] transition-colors font-medium mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                {t('back')}
              </button>
            )}
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">{STEP_LABELS[currentStep]}</h1>
          </div>

          {/* Repère de contexte — rappelle catégorie/transaction en cours pour ne pas se perdre
              dans un parcours à plusieurs étapes ; n'apparaît qu'une fois la branche choisie. */}
          {branch && (
            <div className="px-4 md:px-8 pt-4 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${getCategoryColor(branch).hex}14`, color: getCategoryColor(branch).hex }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(branch).hex }} />
                {tc(branch)}
              </span>
              {watch('transaction') && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-xs font-bold text-gray-500 px-3 py-1.5 rounded-full bg-gray-100">
                    {watch('transaction') === TransactionType.RENTAL ? t('transactionRental') : t('transactionSale')}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="p-6 md:p-10 flex-1 flex flex-col items-center justify-center text-left">
            {renderStep()}
          </div>

          {!AUTO_ADVANCE_STEPS.includes(currentStep) && (
            <div className="p-6 md:p-8 border-t border-gray-100 flex justify-end items-center bg-gray-50/50 rounded-b-2xl md:rounded-b-3xl">
              {currentStepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isNextDisabled}
                  className="bg-[#0094BD] hover:bg-[#003B4A] text-white rounded-full px-8 py-3 md:py-4 text-base md:text-lg font-bold shadow-lg shadow-[#0094BD]/20 transition-all disabled:opacity-50"
                >
                  {t('continueBtn')}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0094BD] hover:bg-[#003B4A] text-white rounded-full px-8 py-3 md:py-4 text-base md:text-lg font-bold shadow-lg shadow-[#0094BD]/20 transition-all disabled:opacity-50"
                >
                  {loading ? t('sending') : t('submit')}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
