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
  Shield, Utensils, Wallet, CreditCard, FileCheck, Truck, Tent, Palmtree, BedDouble,
  Sun, LifeBuoy, Dumbbell, Flame, Layers, Wind, Fan, Ban, Video, Lock, Wifi, Phone, Network, Droplet, Flower2, Cog,
  LayoutGrid, CookingPot, Waves, Siren, Navigation, Leaf, FileText, Info,
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
  RES_EXTERIOR_OPTIONS, RES_HEATING_OPTIONS, RES_AC_OPTIONS, RES_SECURITY_OPTIONS, RES_CONNECTIVITY_OPTIONS,
  RES_KITCHEN_TYPES, RES_KITCHEN_EQUIPMENT_OPTIONS,
  HANGAR_USAGE_OPTIONS, INDUSTRIAL_ZONE_OPTIONS, USINE_EQUIPMENT_OPTIONS, USINE_ACTIVITY_OPTIONS,
  CF_ACTIVITY_OPTIONS, CF_TYPE_FROID_OPTIONS, CF_MODE_GESTION_OPTIONS,
  CF_STRUCTURE_TYPES, INDUSTRIAL_ACCESS_TRANSPORT, LEGAL_DOCUMENTS_SALE,
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
import { HEBERGEMENT_SEJOUR_TYPES } from '@/data/hebergementSejourTypes';
import { isLockedCategory, isLockedPropertyType } from '@/data/lockedCategories';
import {
  INDUSTRIAL_SITUATIONS, INDUSTRIAL_ACCESS_TRANSPORT as DEP_INDUSTRIAL_ACCESS_TRANSPORT, INDUSTRIAL_SOCIAL_LOCALES, INDUSTRIAL_HEBERGEMENT,
  INDUSTRIAL_SECURITY, INDUSTRIAL_WATER_SOURCES, INDUSTRIAL_FIRE_NETWORK, INDUSTRIAL_FIRE_EQUIPMENT,
  CF_ZONE_DECHARGEMENT, CF_TECHNIQUE_FROID, CF_MODE_DIFFUSION, TERRAIN_RACCORDEMENTS, TERRAIN_AGRICOLE_RESSOURCES_EAU,
  TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE, TERRAIN_AGRICOLE_ACCES, TERRAIN_AGRICOLE_ACCES_LOURDS, TERRAIN_AGRICOLE_CONSTRUCTIONS,
  TERRAIN_AGRICOLE_CLOTURE, TERRAIN_TOURISTIQUE_PAT, SHOWROOM_STYLE, SHOWROOM_STRUCTURE,
} from '@/data/industrialTerrainOptions';
import { useLocalizedPlaceName } from '@/lib/typeLabels';

const BRANCH_ICONS: Record<string, any> = { Home, Factory, Briefcase, Trees, Hotel };
// Icônes des structures d'accueil « Hébergement & Séjour » (location)
const HS_ICONS: Record<string, any> = {
  HOTEL: Hotel, COMPLEXE_TOURISTIQUE: Palmtree, VILLAGE_VACANCES: Tent, APPART_HOTEL: Building2,
  RESIDENCE_HOTELIERE: BedDouble, MOTEL: Store, RELAIS_ROUTIER: Truck, CAMPING_TOURISTIQUE: Tent, AUTRES_STRUCTURES: Home,
};

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
// `lockedBadge` : choix visible mais verrouillé (grisé, non cliquable, badge "Bientôt disponible"),
// même rendu que les catégories en attente du dépôt d'annonce.
const CircleOption = ({ active, onClick, icon: Icon, label, size = 'md', color, lockedBadge }: { active: boolean; onClick: () => void; icon: any; label: string; size?: 'lg' | 'md' | 'sm'; color?: { hex: string; rgb: string }; lockedBadge?: string }) => {
  const [hoveredRaw, setHovered] = useState(false);
  const hovered = hoveredRaw && !lockedBadge;
  const outer = size === 'lg' ? 'w-28 h-28 md:w-40 md:h-40' : size === 'md' ? 'w-32 h-32' : 'w-24 h-24';
  const inner = size === 'lg' ? 'w-20 h-20 md:w-32 md:h-32' : size === 'md' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'h-10 w-10 md:h-16 md:w-16' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8';
  const hex = color?.hex || '#0094BD';
  const rgb = color?.rgb || '0,148,189';
  const lit = active || hovered;
  return (
    <div
      onClick={lockedBadge ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-disabled={!!lockedBadge}
      className={cn('flex flex-col items-center gap-3 group w-full', lockedBadge ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
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
      {lockedBadge && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{lockedBadge}</span>}
    </div>
  );
};

// Bouton de choix PLEINE LARGEUR (charte « Type de cuisine » du dépôt d'annonce) — utilisé pour TOUS
// les choix du formulaire (demande client du 06/11/2026 : « boutons pleine largeur, exactement comme
// créer une annonce ») : s'étire pour remplir sa ligne (flex-1) ou sa cellule de grille, rond visible
// pour un choix unique (`type="radio"`), case pour un choix multiple, libellé centré, sans ombre.
const PillOption = ({ checked, onChange, label, icon: Icon, type = 'checkbox' }: { checked: boolean; onChange: () => void; label: string; icon?: any; type?: 'radio' | 'checkbox' }) => (
  <label className="cursor-pointer flex-1 min-w-[140px] block">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
    <div className={cn(
      'h-full min-h-[52px] flex items-center justify-center gap-2.5 px-4 py-3 border-2 rounded-xl bg-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#0094BD] peer-focus-visible:ring-offset-2',
      checked ? 'border-[#0094BD] bg-[#0094BD]/[0.06]' : 'border-gray-200 hover:border-[#0094BD]'
    )}>
      <span className={cn(
        'h-4 w-4 shrink-0 border-2 flex items-center justify-center transition-colors',
        type === 'radio' ? 'rounded-full' : 'rounded',
        checked ? (type === 'radio' ? 'border-[#0094BD]' : 'border-[#0094BD] bg-[#0094BD]') : 'border-gray-400'
      )}>
        {checked && (type === 'radio' ? <span className="h-2 w-2 rounded-full bg-[#0094BD]" /> : <Check className="h-3 w-3 text-white" strokeWidth={3} />)}
      </span>
      {Icon && <Icon className={cn('h-4 w-4 shrink-0', checked ? 'text-[#0094BD]' : 'text-gray-400')} />}
      <span className={cn('text-sm font-bold leading-snug text-center', checked ? 'text-[#0094BD]' : 'text-gray-900')}>{label}</span>
    </div>
  </label>
);

// Carte de choix de même largeur que ses voisines (charte du dépôt : bloc "Type de cuisine") —
// indicateur radio/case visible, libellé centré, info-bulle facultative. Pour les petits groupes de
// 2 à 4 choix qui doivent remplir la ligne (type de cuisine, cadre de vie), là où les pastilles à
// largeur de contenu paraissaient étriquées (retour client du 25/10/2026).
const ChoiceCard = ({ checked, onChange, label, type = 'radio', info }: { checked: boolean; onChange: () => void; label: string; type?: 'radio' | 'checkbox'; info?: string }) => (
  <label className="cursor-pointer flex-1 min-w-[140px] block">
    <input type={type} checked={checked} onChange={onChange} className="peer sr-only" />
    <div className={cn(
      'h-full flex items-center justify-center gap-2 p-3 border-2 rounded-xl bg-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#0094BD] peer-focus-visible:ring-offset-2',
      checked ? 'border-[#0094BD] bg-[#0094BD]/[0.06]' : 'border-gray-200 hover:border-[#0094BD]'
    )}>
      <span className={cn(
        'h-4 w-4 shrink-0 border-2 flex items-center justify-center transition-colors',
        type === 'radio' ? 'rounded-full' : 'rounded',
        checked ? (type === 'radio' ? 'border-[#0094BD]' : 'border-[#0094BD] bg-[#0094BD]') : 'border-gray-400'
      )}>
        {checked && (type === 'radio' ? <span className="h-2 w-2 rounded-full bg-[#0094BD]" /> : <Check className="h-3 w-3 text-white" strokeWidth={3} />)}
      </span>
      <span className={cn('text-sm font-bold text-center', checked ? 'text-[#0094BD]' : 'text-gray-900')}>{label}</span>
      {info && (
        <span className="relative group/info ms-1">
          <Info className="h-4 w-4 text-gray-400 hover:text-[#0094BD]" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 font-normal text-start">
            {info}
          </span>
        </span>
      )}
    </div>
  </label>
);

// Tuile à icône (charte du dépôt d'annonce : icône au-dessus, libellé centré, bordure qui s'active à
// la coche) — pour les équipements, commodités, énergies… Remplace la pastille texte seule.
const OPTION_ICONS: Record<string, any> = {
  // Extérieurs
  garden: Trees, terrace: Sun, balcony: Home, pool: LifeBuoy, playground: Dumbbell, barbecue: Flame, elevator: Layers,
  // Chauffage / climatisation
  CENTRAL: Wind, SOL: Thermometer, GAZ: Flame, SPLIT: Fan, SANS: Ban,
  // Sécurité / connectivité
  cameras: Video, alarm: Lock, guardian: Shield, fiber: Wifi, adsl: Network, phone_line: Phone,
  // Usine / énergies
  MURS_NUS: Ban, EQUIPEE: Cog, ELECTRICITE: Zap, EAU: Droplet, ASSAINISSEMENT: Droplet,
  // Cuisine (équipements)
  plates: LayoutGrid, oven: CookingPot, hood: Fan, dishwasher: Droplet, microwave: Zap, fridge: Snowflake, washing_machine: Waves, no_appliances: Ban,
};

const IconTile = ({ checked, onChange, label, optionId, type = 'checkbox', size = 'md' }: { checked: boolean; onChange: () => void; label: string; optionId: string; type?: 'checkbox' | 'radio'; size?: 'sm' | 'md' }) => {
  const Icon = OPTION_ICONS[optionId] || Flower2;
  return (
    <label className="cursor-pointer block group">
      <input type={type} checked={checked} onChange={onChange} className="peer sr-only" />
      <div className={cn(
        // min-h (pas h fixe) : un libellé un peu long ("Machine à laver", "Gardiennage 24/7"...)
        // ne doit jamais déborder d'une hauteur figée et casser l'alignement de la grille (retour
        // client du 17/10/2026 : "cuisine et équipement extérieurs non aligner").
        // 'sm' = gabarit des équipements de cuisine du dépôt (8 par ligne, h-20, icône h-5).
        'flex flex-col items-center justify-center border-2 rounded-xl transition-all h-full bg-white',
        size === 'sm' ? 'gap-1 p-2 min-h-20' : 'gap-2 p-3 min-h-24',
        checked ? 'border-[#0094BD] bg-[#0094BD]/[0.06] text-[#0094BD]' : 'border-gray-200 text-gray-700 hover:border-[#0094BD]'
      )}>
        <Icon className={cn(size === 'sm' ? 'h-5 w-5' : 'h-6 w-6', checked ? 'text-[#0094BD]' : 'text-gray-400 group-hover:text-gray-600')} />
        <span className="text-xs font-bold text-center leading-tight">{label}</span>
      </div>
    </label>
  );
};

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
  label, options, field, watch, toggle, icons = {}, gridClassName, translateNs, tiles,
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
  /** Affiche chaque option en tuile à icône (équipements, énergies…). */
  tiles?: boolean;
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
      <div className={tiles ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3' : (gridClassName || 'grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3')}>
        {options.map((opt) => tiles ? (
          <IconTile key={opt.id} optionId={opt.id} checked={selected.includes(opt.id)} label={resolveLabel(opt)} onChange={() => toggle(field, opt.id)} />
        ) : (
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
  const tpt = useTranslations('PropertyTypes');
  const [hsType, setHsType] = useState<string>('');
  // Les tableaux d'options de researchConfig.ts (SITUATION_OPTIONS, CURRENCY_OPTIONS...) portent un
  // `label` français en dur — ResearchOptions les traduit, converti branche par branche (Résidentiel
  // en premier) ; `.has()` retombe sur le label français tant qu'une branche n'est pas encore migrée,
  // pour ne jamais casser l'affichage d'une branche pas encore traitée.
  const tOpt = useTranslations('ResearchOptions');
  // Sections "cadre & commodités" clonées des fiches annonce Industriel/Terrain : mêmes intitulés
  // (namespace Deposit, clés fXXX) et mêmes libellés d'options (DepositOptions) que le dépôt, déjà
  // traduits en fr/en/ar — aucune traduction dupliquée.
  const tDep = useTranslations('Deposit');
  const tDepOpt = useTranslations('DepositOptions');
  const depOpt = (group: string, item: { id: string; label: string }) => {
    if (!group) return item.label;
    const nested = `${group}.${item.id}.label`;
    const flat = `${group}.${item.id}`;
    return tDepOpt.has(nested) ? tDepOpt(nested) : tDepOpt.has(flat) ? tDepOpt(flat) : item.label;
  };
  const place = useLocalizedPlaceName();
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

    // Industriel (Location ET Achat depuis cette phase) — fiches dédiées Hangar / Usine / Chambre Froide.
    hgUsageType: z.array(z.string()).optional(),
    hgSurfaceTerrainMin: z.coerce.number().optional(),
    hgSurfaceTerrainMax: z.coerce.number().optional(),
    hgSurfaceCouverteMin: z.coerce.number().optional(),
    hgSurfaceCouverteMax: z.coerce.number().optional(),
    hgHauteurMin: z.coerce.number().optional(),
    hgHauteurMax: z.coerce.number().optional(),
    hgZone: z.array(z.string()).optional(),
    hgEnergie: z.array(z.string()).optional(),
    hgAccesTransport: z.array(z.string()).optional(),

    usNature: z.array(z.string()).optional(),
    usNatureOther: z.string().optional(),
    usEquipement: z.array(z.string()).optional(),
    usSurfaceTerrainMin: z.coerce.number().optional(),
    usSurfaceTerrainMax: z.coerce.number().optional(),
    usSurfaceBatieMin: z.coerce.number().optional(),
    usSurfaceBatieMax: z.coerce.number().optional(),
    usZone: z.array(z.string()).optional(),
    usEnergie: z.array(z.string()).optional(),
    usAccesTransport: z.array(z.string()).optional(),

    cfActivite: z.array(z.string()).optional(),
    cfActiviteOther: z.string().optional(),
    cfCapaciteMin: z.coerce.number().optional(),
    cfCapaciteMax: z.coerce.number().optional(),
    cfTypeFroidChoices: z.array(z.string()).optional(),
    cfModeGestionChoices: z.array(z.string()).optional(),
    cfStructureType: z.enum(['CELLULE_UNIQUE', 'COMPLEXE_FRIGORIFIQUE']).optional(),

    // Cadre & commodités clonés des fiches annonce Industriel (/deposit, 25/10/2026) — `ind*` est
    // commun à Hangar / Usine / Chambre froide (une seule fiche active à la fois), `cf*` propre à la
    // Chambre froide. Mêmes listes d'options que le dépôt (data/industrialTerrainOptions.ts).
    indOffices: z.enum(['OUI', 'NON']).optional(),
    indOfficesAreaMin: z.coerce.number().optional(),
    indSocialLocales: z.array(z.string()).optional(),
    indHebergement: z.array(z.string()).optional(),
    indSecurity: z.array(z.string()).optional(),
    indKvaMin: z.coerce.number().optional(),
    indForceMotrice: z.boolean().optional(),
    indGas: z.array(z.string()).optional(),
    indWaterSources: z.array(z.string()).optional(),
    indSanitation: z.array(z.string()).optional(),
    indFireNetwork: z.array(z.string()).optional(),
    indFireEquipment: z.array(z.string()).optional(),
    indFireWaterReserveMin: z.coerce.number().optional(),
    cfLocalisation: z.array(z.string()).optional(),
    cfConfiguration: z.array(z.string()).optional(),
    cfFloorsMin: z.coerce.number().optional(),
    cfLogistiqueVerticale: z.array(z.string()).optional(),
    cfMonteChargeCapacityMin: z.coerce.number().optional(),
    cfAccessibilite: z.array(z.string()).optional(),
    cfZoneDechargement: z.array(z.string()).optional(),
    cfGenerateur: z.boolean().optional(),
    cfGenerateurKvaMin: z.coerce.number().optional(),
    cfTechniqueFroid: z.array(z.string()).optional(),
    cfModeDiffusion: z.array(z.string()).optional(),

    // Cadre & commodités clonés des fiches annonce Terrain (/deposit, 25/10/2026).
    terViabilise: z.enum(['OUI', 'NON']).optional(),
    terRaccordements: z.array(z.string()).optional(),
    terAgriRessourcesEau: z.array(z.string()).optional(),
    terAgriDebitForageMin: z.coerce.number().optional(),
    terAgriEquipementHydro: z.array(z.string()).optional(),
    terAgriAcces: z.array(z.string()).optional(),
    terAgriAccesLourds: z.array(z.string()).optional(),
    terAgriConstructions: z.array(z.string()).optional(),
    terAgriCloture: z.array(z.string()).optional(),
    terTouPat: z.array(z.string()).optional(),

    // Documents pour la vente — uniquement proposés quand transaction === SALE, communs aux 3
    // fiches Industriel (une seule est active à la fois via industrielSearchScope).
    indLegalDocuments: z.array(z.string()).optional(),

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
    title: z.string().max(120).optional(),
    comment: z.string().min(10, t('zodCommentRequired')).max(5000),

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

    // Critères espace extérieur / chauffage / climatisation / sécurité / connectivité — mêmes
    // champs que la fiche Résidentiel de /deposit (VILLA_EQUIPMENTS.exterior/security/
    // connectivity + HEATING_TYPES/AC_TYPES), absents de /research jusqu'à cette phase.
    resExterior: z.array(z.string()).optional(),
    resHeating: z.string().optional(),
    resAc: z.string().optional(),
    resSecurity: z.array(z.string()).optional(),
    resConnectivity: z.array(z.string()).optional(),

    // Cuisine et équipements + Énergie/Eau/Technique — mêmes champs que la fiche Résidentiel de
    // /deposit (KITCHEN_TYPES, VILLA_EQUIPMENTS.kitchen, waterCounter/elecCounter/gasCounter),
    // demandés par le client le 15/10/2026 en duplication identique sur /research.
    resKitchenType: z.string().optional(),
    resKitchenEquipment: z.array(z.string()).optional(),
    resWaterCounter: z.string().optional(),
    resElecCounter: z.string().optional(),
    resGasCounter: z.string().optional(),

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
    bureauxSearchScope: z.enum(['GROUPEE', 'IMMEUBLE', 'BLOC_ADMINISTRATIF', 'BLOC_COMMERCIAL', 'LOCAL_COMMERCIAL', 'SHOWROOM']).optional(),
    // Fiche « Showroom » (Bureaux & Commerces, 08/11/2026) — rubriques de la fiche annonce Showroom du dépôt.
    srSurfaceTerrainMin: z.coerce.number().optional(),
    srSurfaceTerrainMax: z.coerce.number().optional(),
    srSurfaceBatieMin: z.coerce.number().optional(),
    srSurfaceBatieMax: z.coerce.number().optional(),
    srNiveauxMin: z.coerce.number().optional(),
    srNiveauxMax: z.coerce.number().optional(),
    srStyle: z.array(z.string()).optional(),
    srStructure: z.array(z.string()).optional(),
    srStructureOther: z.string().optional(),
    srVisibiliteAutoroute: z.enum(['OUI', 'NON']).optional(),
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
    // Consentement obligatoire — tout l'intérêt de "Confier votre recherche" repose sur ce choix
    // explicite ; jusqu'ici la case n'était jamais vérifiée et l'envoi passait sans qu'elle soit
    // cochée (retour client du 15/10/2026 : "il valide directe sans me donner la main de choisir").
    isDelegate: z.boolean({ error: "Vous devez cocher cette case pour confier votre recherche à Patrimoine Immobilier." })
      .refine((v) => v === true, { message: "Vous devez cocher cette case pour confier votre recherche à Patrimoine Immobilier." }),
    receiveAlert: z.boolean().optional(),
  });

  type ResearchFormInput = z.input<typeof researchSchema>;
  type ResearchFormValues = z.output<typeof researchSchema>;

  // Ordre : Transaction (Location/Achat) d'abord, puis catégorie d'annonce (Branche) — l'inverse
  // de l'ordre initial.
  const STEP_KEYS = ['TRANSACTION', 'BRANCH', 'RES_SEARCH_SCOPE', 'BUR_SEARCH_SCOPE', 'IND_SEARCH_SCOPE', 'TER_SEARCH_SCOPE', 'HS_TYPE', 'CRITERIA', 'BUDGET', 'INTERLOCUTOR', 'CONTACT'] as const;
  type StepKey = typeof STEP_KEYS[number];
  // Étapes à choix unique et immédiat (une grande pastille) : on avance dès le clic, sans passer
  // par le bouton "Continuer" — contrairement au dépôt d'annonces.
  const AUTO_ADVANCE_STEPS: StepKey[] = ['BRANCH', 'TRANSACTION', 'RES_SEARCH_SCOPE', 'BUR_SEARCH_SCOPE', 'IND_SEARCH_SCOPE', 'TER_SEARCH_SCOPE', 'HS_TYPE'];

  const STEP_LABELS: Record<StepKey, string> = {
    BRANCH: t('stepBranch'),
    TRANSACTION: t('stepTransaction'),
    RES_SEARCH_SCOPE: t('stepSearchScope'),
    BUR_SEARCH_SCOPE: t('stepSearchScope'),
    IND_SEARCH_SCOPE: t('stepSearchScope'),
    TER_SEARCH_SCOPE: t('stepSearchScope'),
    HS_TYPE: t('stepHsType'),
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
      resExterior: [],
      resSecurity: [],
      resConnectivity: [],
      resKitchenEquipment: [],
      hgUsageType: [],
      hgZone: [],
      hgEnergie: [],
      hgAccesTransport: [],
      usNature: [],
      usEquipement: [],
      usZone: [],
      usEnergie: [],
      usAccesTransport: [],
      cfActivite: [],
      cfTypeFroidChoices: [],
      cfModeGestionChoices: [],
      indLegalDocuments: [],
      indSocialLocales: [], indHebergement: [], indSecurity: [], indGas: [], indWaterSources: [], indSanitation: [],
      indFireNetwork: [], indFireEquipment: [],
      cfLocalisation: [], cfConfiguration: [], cfLogistiqueVerticale: [], cfAccessibilite: [], cfZoneDechargement: [],
      cfTechniqueFroid: [], cfModeDiffusion: [],
      terRaccordements: [], terAgriRessourcesEau: [], terAgriEquipementHydro: [], terAgriAcces: [], terAgriAccesLourds: [],
      terAgriConstructions: [], terAgriCloture: [], terTouPat: [],
      srStyle: [], srStructure: [],
      isDelegate: false,
      receiveAlert: false,
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
      // Brouillon d'une catégorie verrouillée depuis (Hébergement & Séjour) : on garde la transaction
      // et on renvoie au choix de catégorie (étape 2 dans tous les parcours).
      if (isLockedCategory(parsed.values?.branch)) {
        if (parsed.values?.transaction) setValue('transaction', parsed.values.transaction);
        setCurrentStepIndex(parsed.values?.transaction ? 1 : 0);
        setDraftAvailable(null);
        return;
      }
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
  // Les 3 fiches dédiées (Hangar/Usine/Chambre Froide) couvrent maintenant Location ET Achat —
  // elles n'étaient dédiées qu'à la Location avant cette phase (l'Achat retombait sur l'ancien
  // formulaire générique avec Budget/Interlocuteur en étapes à part, resté ci-dessous en filet de
  // sécurité tant que `transaction` n'a pas encore été choisi).
  const isIndustrielFiche = isIndustriel && (watch('transaction') === TransactionType.RENTAL || watch('transaction') === TransactionType.SALE);
  const isIndustrielAchat = isIndustrielFiche && watch('transaction') === TransactionType.SALE;
  const isHotelier = branch === 'HOTELIER';
  const isTerrain = branch === 'TERRAIN_FONCIER';

  // Résidentiel (Location/Achat), Bureaux et Commerces, Industriel (Location/Achat), Hébergement
  // et Séjour et Terrains et Foncier : fiche unique dédiée (critères + localisation + message).
  // Plus d'étape « Informations et Contact » séparée (retour client du 08/11/2026) : options de la
  // recherche + coordonnées sont à la FIN de la page qui porte l'interlocuteur et le titre/message
  // (INTERLOCUTOR pour le Résidentiel, CRITERIA pour les autres fiches) — cf. renderContactSection,
  // ajouté par renderStep à la dernière étape du parcours.
  const steps: StepKey[] = (isResidentielLocation || isResidentielAchat)
    ? ['TRANSACTION', 'BRANCH', 'RES_SEARCH_SCOPE', 'CRITERIA', 'INTERLOCUTOR']
    : isBureauxCommerces
    ? ['TRANSACTION', 'BRANCH', 'BUR_SEARCH_SCOPE', 'CRITERIA']
    : isIndustrielFiche
    ? ['TRANSACTION', 'BRANCH', 'IND_SEARCH_SCOPE', 'CRITERIA']
    : isIndustriel
    ? ['TRANSACTION', 'BRANCH', 'IND_SEARCH_SCOPE', 'CRITERIA', 'BUDGET', 'INTERLOCUTOR']
    : isHotelier
    ? ['TRANSACTION', 'BRANCH', 'HS_TYPE']
    : isTerrain
    ? ['TRANSACTION', 'BRANCH', 'TER_SEARCH_SCOPE', 'CRITERIA']
    : STEP_KEYS.filter((s) => s !== 'RES_SEARCH_SCOPE' && s !== 'BUR_SEARCH_SCOPE' && s !== 'IND_SEARCH_SCOPE' && s !== 'TER_SEARCH_SCOPE' && s !== 'HS_TYPE' && s !== 'CONTACT');
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
    // Toutes les fiches : wilaya(s) du champ multiple (cityIds) ET/OU wilaya unique du parcours générique
    // (cityId) — avant, seules les fiches Résidentiel Location chargeaient les communes de cityIds, donc
    // la liste « Communes » restait vide partout ailleurs.
    const ids = Array.from(new Set([
      ...selectedCityIds.map(String),
      ...(selectedCityId ? [String(selectedCityId)] : []),
    ]));
    if (ids.length === 0) { setTowns([]); return; }
    // `ids` peut contenir plusieurs wilayas (Résidentiel Location) — chaque fetch tourne en
    // parallèle et deux résolutions peuvent s'entrecroiser si l'utilisateur re-coche vite. Le
    // flag `cancelled` ne garde que la résolution du DERNIER appel, et le dédoublonnage par `id`
    // couvre le cas où une même commune reviendrait deux fois dans les résultats fusionnés
    // (bug remonté par le client : communes dupliquées plusieurs fois en sélection multiple).
    let cancelled = false;
    Promise.all(ids.map((id) => axios.get(`${apiUrl}/cities/${id}/towns`).then((res) => res.data).catch(() => [])))
      .then((results) => {
        if (cancelled) return;
        // Dédoublonnage : par id, puis par nom normalisé (sans accents/casse, tirets = espaces — « Alger
        // Centre » = « Alger-Centre »), puis on écarte un nom générique qui n'est que le début d'un autre
        // de la même wilaya (« Alger » à côté de « Alger Centre »).
        const norm = (tw: any) => String(tw.nameFr || tw.name || tw.nameAr || '')
          .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, ' ').trim();
        const seen = new Set<string>();
        const unique = results.flat().filter((tw: any) => {
          const keys = [`id:${tw.id}`, `n:${tw.cityId ?? ''}:${norm(tw)}`];
          if (keys.some((k) => seen.has(k))) return false;
          keys.forEach((k) => seen.add(k));
          return true;
        });
        const deduped = unique.filter((tw: any) => {
          const n = norm(tw);
          return !n || !unique.some((o: any) => o !== tw && (o.cityId ?? '') === (tw.cityId ?? '') && norm(o).startsWith(n + ' '));
        });
        setTowns(deduped);
      });
    return () => { cancelled = true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId, selectedCityIds.join(',')]);

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

  // Options « rien » exclusives, comme au dépôt d'annonce (retour client du 08/11/2026 : cocher « Vide »
  // dans les équipements de cuisine doit décocher les autres) : cocher l'option exclusive vide le reste,
  // cocher une autre option retire l'option exclusive.
  const EXCLUSIVE_OPTIONS: Partial<Record<keyof ResearchFormValues, string>> = {
    resKitchenEquipment: 'no_appliances',
    indGas: 'AUCUN',
    cfLogistiqueVerticale: 'AUCUN',
    terAgriConstructions: 'AUCUNE',
  };

  const toggleArrayValue = (field: keyof ResearchFormValues, value: string) => {
    const current = (watch(field) as string[]) || [];
    const exclusive = EXCLUSIVE_OPTIONS[field];
    let next: string[];
    if (current.includes(value)) next = current.filter((v) => v !== value);
    else if (exclusive && value === exclusive) next = [value];
    else next = [...current.filter((v) => v !== exclusive), value];
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
      // Extérieur / chauffage / climatisation / sécurité / connectivité / cuisine / énergie-eau
      // — mêmes champs que /deposit, communs à toutes les fiches de bâti (Résidentiel, Immeuble,
      // Bureaux et Commerces).
      const resEquipments = {
        exterior: data.resExterior || [],
        heating: data.resHeating,
        ac: data.resAc,
        security: data.resSecurity || [],
        connectivity: data.resConnectivity || [],
        kitchen: { type: data.resKitchenType, equipment: data.resKitchenEquipment || [] },
        energy: { water: data.resWaterCounter, elec: data.resElecCounter, gas: data.resGasCounter },
      };
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
              equipments: resEquipments,
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
              equipments: resEquipments,
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
              equipments: resEquipments,
            };
          }
          break;
        case 'INDUSTRIEL':
          if (data.transaction === TransactionType.RENTAL || data.transaction === TransactionType.SALE) {
            amenities.industriel = { searchScope: data.industrielSearchScope };
            // Cadre & commodités clonés de la fiche annonce (communs aux 3 fiches pour les annexes).
            const indAnnexes = {
              offices: data.indOffices,
              officesAreaMin: data.indOffices === 'OUI' ? data.indOfficesAreaMin : undefined,
              socialLocales: data.indSocialLocales || [],
              hebergement: data.indHebergement || [],
              security: data.indSecurity || [],
            };
            const indEnergy = {
              kvaMin: data.indKvaMin,
              forceMotrice: !!data.indForceMotrice,
              gas: data.indGas || [],
              waterSources: data.indWaterSources || [],
              sanitation: data.indSanitation || [],
            };
            const indFire = {
              network: data.indFireNetwork || [],
              equipment: data.indFireEquipment || [],
              waterReserveMin: (data.indFireEquipment || []).includes('BACHE_EAU') ? data.indFireWaterReserveMin : undefined,
            };
            // Documents attendus pour la vente — communs aux 3 fiches, seulement en Achat.
            if (data.transaction === TransactionType.SALE) {
              amenities.industriel.legalDocuments = data.indLegalDocuments || [];
            }
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
                accesTransport: data.usAccesTransport || [],
                annexes: indAnnexes,
                energy: indEnergy,
                fire: indFire,
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
                structureType: data.cfStructureType,
                annexes: indAnnexes,
                configuration: {
                  localisation: data.cfLocalisation || [],
                  configuration: data.cfConfiguration || [],
                  floorsMin: (data.cfConfiguration || []).includes('ETAGES') ? data.cfFloorsMin : undefined,
                  logistiqueVerticale: data.cfLogistiqueVerticale || [],
                  monteChargeCapacityMin: (data.cfLogistiqueVerticale || []).includes('MONTE_CHARGE') ? data.cfMonteChargeCapacityMin : undefined,
                  accessibilite: data.cfAccessibilite || [],
                  zoneDechargement: data.cfZoneDechargement || [],
                },
                equipment: {
                  generateur: !!data.cfGenerateur,
                  generateurKvaMin: data.cfGenerateur ? data.cfGenerateurKvaMin : undefined,
                  techniqueFroid: data.cfTechniqueFroid || [],
                  modeDiffusion: data.cfModeDiffusion || [],
                },
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
                accesTransport: data.hgAccesTransport || [],
                annexes: indAnnexes,
                energy: indEnergy,
                fire: indFire,
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
              equipments: resEquipments,
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
              equipments: resEquipments,
            };
          } else if (data.bureauxSearchScope === 'BLOC_COMMERCIAL') {
            amenities.bureaux.blocCommercial = {
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              etatGeneral: data.bcEtatGeneral || [],
              zoneType: data.bcZoneType || [],
              visibilite: data.bcVisibilite || [],
              cityIds: data.cityIds || [],
              environment: data.environment,
              equipments: resEquipments,
            };
          } else if (data.bureauxSearchScope === 'SHOWROOM') {
            amenities.bureaux.showroom = {
              surfaceTerrainMin: data.srSurfaceTerrainMin,
              surfaceTerrainMax: data.srSurfaceTerrainMax,
              surfaceBatieMin: data.srSurfaceBatieMin,
              surfaceBatieMax: data.srSurfaceBatieMax,
              niveauxMin: data.srNiveauxMin,
              niveauxMax: data.srNiveauxMax,
              style: data.srStyle || [],
              structure: data.srStructure || [],
              structureOther: (data.srStructure || []).includes('AUTRE') ? data.srStructureOther : undefined,
              visibiliteAutoroute: data.srVisibiliteAutoroute,
              cityIds: data.cityIds || [],
              environment: data.environment,
              equipments: resEquipments,
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
              environment: data.environment,
              equipments: resEquipments,
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
              environment: data.environment,
              // Pas de compteurs eau/élec/gaz sur cette fiche (elle a sa section "Énergie et fluide").
              equipments: { ...resEquipments, energy: undefined },
            };
          }
          break;
        case 'TERRAIN_FONCIER':
          amenities.terrain = {
            searchScope: data.terrainSearchScope || 'AGRICOLE', surfaceUnit: data.surfaceUnit, facadesMin: data.facadesMin, facadesMax: data.facadesMax,
            // Viabilisation clonée de la fiche annonce (toutes les fiches Terrain) ; raccordements à
            // proximité seulement pour Industriel / Résidentiel non viabilisé, comme au dépôt.
            viabilise: data.terViabilise,
          };
          const terRaccordements = data.terViabilise === 'NON' ? (data.terRaccordements || []) : [];
          if (data.terrainSearchScope === 'INDUSTRIEL') {
            amenities.terrain.industriel = { zone: data.terIndZone || [], raccordements: terRaccordements };
          } else if (data.terrainSearchScope === 'RESIDENTIEL') {
            amenities.terrain.residentiel = { zone: data.terResZone || [], raccordements: terRaccordements };
          } else if (data.terrainSearchScope === 'TOURISTIQUE') {
            amenities.terrain.touristique = {
              zet: data.terTouZet,
              vocation: data.terTouVocation || [],
              vocationOther: (data.terTouVocation || []).includes('AUTRE') ? data.terTouVocationOther : undefined,
              pat: data.terTouPat || [],
            };
          } else {
            amenities.terrain.agricole = {
              altitudeMin: data.terAgriAltitudeMin,
              altitudeMax: data.terAgriAltitudeMax,
              culture: data.terAgriCulture || [],
              cultureOther: (data.terAgriCulture || []).includes('AUTRE') ? data.terAgriCultureOther : undefined,
              etat: data.terAgriEtat || [],
              ressourcesEau: data.terAgriRessourcesEau || [],
              debitForageMin: (data.terAgriRessourcesEau || []).includes('FORAGE') ? data.terAgriDebitForageMin : undefined,
              equipementHydro: data.terAgriEquipementHydro || [],
              acces: data.terAgriAcces || [],
              accesLourds: data.terAgriAccesLourds || [],
              constructions: data.terAgriConstructions || [],
              cloture: data.terAgriCloture || [],
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
        title: data.title?.trim() || undefined,
        comment: data.comment,
        ...contact,
        userId: loggedInUser?.id,
        realEstateType: data.branch,
        // Fiche Résidentiel Location : choix multiple — on le reflète aussi dans le champ plat
        // `propertyType` (comme du temps du choix unique) pour que /demandes et l'admin restent
        // cohérents, en plus du détail complet dans `amenities`.
        // Fiche Showroom : type de bien explicite, affiché sur la carte /demandes comme pour une annonce.
        propertyType: (data.branch === 'BUREAUX_COMMERCES' && data.bureauxSearchScope === 'SHOWROOM')
          ? 'SHOWROOM'
          : (data.resPropertyTypes && data.resPropertyTypes.length > 0) ? data.resPropertyTypes.join(',') : data.propertyType,
        amenities: JSON.stringify(amenities),
      };

      await axios.post(`${apiUrl}/entrusted-research`, payload);
      clearDraft();
      // La recherche part EN ATTENTE de validation par l'administration (08/11/2026) : elle n'est pas
      // encore dans /demandes — un utilisateur connecté est donc renvoyé vers « Mes recherches », où il
      // en voit le statut.
      alert(t('alertSuccessPending'));
      router.push(loggedInUser ? '/profile/researches' : '/demandes');
    } catch (err: any) {
      console.error(err);
      // Compte en attente de validation admin (nouveau compte ou profil modifié) : l'API refuse.
      alert(err?.response?.data?.code === 'ACCOUNT_PENDING_VALIDATION' ? t('alertAccountPending') : t('alertGenericError'));
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
    if (formErrors.isDelegate) {
      // La case de consentement vit à la fin de la dernière étape du parcours (bloc contact). Message
      // du schéma zod (module-level, donc en français en dur comme les ~35 autres messages de
      // validation de ce fichier — cf. CLAUDE.md).
      setCurrentStepIndex(steps.length - 1);
      alert(formErrors.isDelegate.message);
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
        {renderResidentielEquipmentsSection()}

        {/* Seul ajout propre à l'achat par rapport à la fiche Location : l'état de réalisation,
            sur une seule ligne, sans texte de description. */}
        <Section title={t('sqRealisationStage')} icon={Sparkles}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            {REALISATION_STAGE_OPTIONS.map((opt) => (
              <PillOption type="radio" key={opt.id} checked={watch('realisationStage') === opt.id} label={optLabel('REALISATION_STAGE_OPTIONS', opt)} onChange={() => setValue('realisationStage', opt.id as any)} />
            ))}
          </div>
        </Section>

        {/* Interlocuteur souhaité + message explicatif : page 2 du parcours (étape INTERLOCUTOR),
            cf. steps array plus bas — demande client du 15/10/2026. */}
        {renderLocalisationSection({ hideDate: true })}
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
      <div className="flex items-center gap-1.5 flex-wrap" dir="ltr">
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
                <PillOption type="radio" key={opt.id} checked={watch('villaLevelEntrance') === opt.id} label={optLabel('VILLA_LEVEL_ENTRANCE_OPTIONS', opt)} onChange={() => setValue('villaLevelEntrance', opt.id as any)} />
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
        <option value="DA">{t('curDA')}</option>
        <option value="DA_M2">{t('curDAM2')}</option>
        <option value="MILLION">{t('curMillions')}</option>
        <option value="MILLION_M2">{t('curMillionsM2')}</option>
        <option value="MILLIARD">{t('curMilliards')}</option>
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
              <PillOption key={opt.id} checked={(watch('interlocutors') || []).includes(opt.id)} label={optLabel('RESEARCH_INTERLOCUTORS.RESIDENTIEL', opt)} onChange={() => toggleArrayValue('interlocutors', opt.id)} />
            ))}
          </div>
        </div>
      </Section>
    );
  };

  // Interlocuteur — seulement 2 choix (Agence immobilière / Particulier) pour les fiches
  // Industriel Location (Hangar/Usine/Chambre Froide), contrairement aux 3 choix du Résidentiel.
  const renderIndustrielLocationInterlocutorSection = (warehousing: 'SOCIETE_ENTREPOSAGE' | 'SOCIETE_ENTREPOSAGE_FRIGO') => (
    <Section title={t('stepInterlocutor')} icon={Handshake}>
      <div className="space-y-3">
        <p className="text-sm text-gray-500">{t('interlocutorChooseWho')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...INDUSTRIEL_LOCATION_INTERLOCUTOR_OPTIONS, { id: warehousing, label: warehousing === 'SOCIETE_ENTREPOSAGE' ? "Société d'entreposage" : "Société d'entreposage frigorifique" }].map((opt) => (
            <PillOption key={opt.id} checked={(watch('interlocutors') || []).includes(opt.id)} label={optLabel('INDUSTRIEL_LOCATION_INTERLOCUTOR_OPTIONS', opt)} onChange={() => toggleArrayValue('interlocutors', opt.id)} />
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
      | 'facadesMin' | 'terAgriAltitudeMin'
      | 'srSurfaceTerrainMin' | 'srSurfaceBatieMin' | 'srNiveauxMin',
    maxField: 'typologyMax' | 'floorMax' | 'maxSurface'
      | 'buildingTypologyMax' | 'buildingFloorsMax' | 'buildingSurfaceMax' | 'buildingSurfaceSimilaireMax'
      | 'hgSurfaceTerrainMax' | 'hgSurfaceCouverteMax' | 'hgHauteurMax'
      | 'usSurfaceTerrainMax' | 'usSurfaceBatieMax' | 'cfCapaciteMax'
      | 'facadesMax' | 'terAgriAltitudeMax'
      | 'srSurfaceTerrainMax' | 'srSurfaceBatieMax' | 'srNiveauxMax',
    opts?: { unit?: string; unitPosition?: 'prefix' | 'suffix'; placeholderMin?: string; placeholderMax?: string },
  ) => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <div className="flex items-center gap-1.5" dir="ltr">
        {opts?.unit && opts.unitPosition !== 'suffix' && <span className="font-bold text-gray-700 text-base shrink-0">{opts.unit}</span>}
        <input
          type="number" inputMode="numeric" {...register(minField)}
          placeholder={opts?.placeholderMin}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        {opts?.unit && opts.unitPosition === 'suffix' && <span className="font-bold text-gray-500 text-xs shrink-0">{opts.unit}</span>}
        <span className="text-xs font-bold text-gray-400 shrink-0">{t('resLocTypologyTo')}</span>
        <input
          type="number" inputMode="numeric" {...register(maxField)}
          placeholder={opts?.placeholderMax}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
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
      <div className="flex items-center gap-1.5" dir="ltr">
        {opts?.unit && opts.unitPosition !== 'suffix' && <span className="font-bold text-gray-700 text-base shrink-0">{opts.unit}</span>}
        <input
          type="number" inputMode="numeric" {...register(field)}
          placeholder={opts?.placeholder}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        {opts?.unit && opts.unitPosition === 'suffix' && <span className="font-bold text-gray-500 text-xs shrink-0">{opts.unit}</span>}
      </div>
    </div>
  );

  // Champ "boxé" façon création d'annonce pour un montant unique (Budget min / Budget max).
  // L'unité (DA / DA-m² / Millions / Millions-m² / Milliards) est de nouveau un vrai sélecteur —
  // retour client du 17/10/2026 ("confier recherche manque unité ... million milliards dinars") :
  // la tentative précédente de la fixer à "DA" seul (15/10/2026) est revenue en arrière. Même
  // 5 choix que `renderBudgetInputs` juste au-dessus, pour rester cohérent dans tout le fichier.
  // La saisie garde son séparateur de milliers ; c'est l'affichage (cartes /demandes) qui doit
  // interpréter `budgetUnit` pour rendre un montant lisible "comme sur une annonce", pas ce champ.
  const renderBoxedBudgetField = (label: string, field: 'minBudget' | 'maxBudget', opts?: { withUnit?: boolean }) => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <div className="flex items-center rounded-xl border-2 border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#0094BD] focus-within:border-[#0094BD] transition-all" dir="ltr">
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
            className="h-full shrink-0 ps-1.5 pe-1 border-s-2 border-gray-300 bg-gray-100 font-bold text-[11px] text-gray-700 outline-none cursor-pointer"
          >
            <option value="DA">{t('curDA')}</option>
            <option value="DA_M2">{t('curDAM2')}</option>
            <option value="MILLION">{t('curMillions')}</option>
            <option value="MILLION_M2">{t('curMillionsM2')}</option>
            <option value="MILLIARD">{t('curMilliards')}</option>
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
          {renderBoxedRange(t('resLocTypologyRange'), 'typologyMin', 'typologyMax', { unit: 'F', unitPosition: 'prefix', placeholderMin: t('exVal', { v: '3' }), placeholderMax: t('exVal', { v: '5' }) })}
          {renderBoxedRange(t('resLocSurfaceMax'), 'minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '80' }), placeholderMax: t('exVal', { v: '120' }) })}
          {renderBoxedRange(t('resLocFloorMax'), 'floorMin', 'floorMax', { placeholderMin: t('exVal', { v: '0' }), placeholderMax: t('exVal', { v: '4' }) })}
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
              className="w-full p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base"
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
          {/* Wilaya en choix unique (demande client du 15/10/2026) — stockée comme tableau à un
              seul élément pour ne rien changer au reste (effet de chargement des communes, payload
              de soumission), qui lisent déjà `cityIds` comme un tableau. */}
          <select
            value={(watch('cityIds') || [])[0] ?? ''}
            onChange={(e) => setValue('cityIds', e.target.value ? [e.target.value as any] : [])}
            className={inputCls}
          >
            <option value="">{t('optSelect')}</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.code ? `${c.code} - ${place.city(c)}` : place.city(c)}</option>)}
          </select>
        </Field>
        <Field label={t('budgetTowns')}>
          <MultiSelectDropdown
            options={towns.map((tw) => ({ id: tw.id, label: place.town(tw) }))}
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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            {AIRPORT_PROXIMITY_OPTIONS.map((opt) => (
              <PillOption type="radio" key={opt.id} checked={watch('airportProximity') === opt.id} label={optLabel('AIRPORT_PROXIMITY_OPTIONS', opt)} onChange={() => setValue('airportProximity', opt.id)} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );

  // Cartes de même largeur à case visible (ChoiceCard), comme le "Type de cuisine" du dépôt — ni la
  // grille de grosses pastilles d'origine, ni les pastilles étriquées à largeur de contenu (retours
  // client du 25/10/2026).
  const renderEnvironmentSection = () => (
    <Section title={t('resLocEnvironmentTitle')} icon={Compass}>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">{t('resLocEnvironment')}</label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {ENVIRONMENT_OPTIONS.map((opt) => (
            <ChoiceCard key={opt.id} type="checkbox" checked={(watch('environment') || []).includes(opt.id)} label={optLabel('ENVIRONMENT_OPTIONS', opt)} onChange={() => toggleArrayValue('environment', opt.id)} />
          ))}
        </div>
      </div>
    </Section>
  );

  // Cuisine et équipements / Extérieurs & Commodités / Énergie, Eau & Technique — dupliqués
  // identiquement depuis la fiche Résidentiel de /deposit (même ordre, mêmes champs, mêmes libellés
  // de section), demande client du 15/10/2026. Sécurité et Connectivité sont côte à côte (face à
  // face) comme dans l'affichage de la fiche annonce (/announces/[id]).
  // Depuis le 25/10/2026, affiché sur toutes les fiches de bâti (Résidentiel, Immeuble, Bureaux et
  // Commerces) et calé sur les dimensions du dépôt : équipements de cuisine en 8 tuiles compactes
  // par ligne, extérieurs en 6, commodités séparées par un filet comme au dépôt.
  // `withEnergy: false` pour les fiches qui ont déjà leur propre section "Énergie et fluide".
  const renderResidentielEquipmentsSection = (opts?: { withEnergy?: boolean }) => (
    <>
      <Section title={t('resKitchenTitle')} icon={Utensils}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('resKitchenTypeLabel')}</label>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              {RES_KITCHEN_TYPES.map((opt) => (
                <ChoiceCard
                  key={opt.id}
                  checked={watch('resKitchenType') === opt.id}
                  label={optLabel('RES_KITCHEN_TYPES', opt)}
                  // Même description que l'info-bulle du dépôt (mêmes ids, déjà traduite).
                  info={tDepOpt.has(`KITCHEN_TYPES.${opt.id}.description`) ? tDepOpt(`KITCHEN_TYPES.${opt.id}.description`) : undefined}
                  onChange={() => setValue('resKitchenType', opt.id as any)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('resKitchenEquipmentLabel')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {RES_KITCHEN_EQUIPMENT_OPTIONS.map((opt) => (
                <IconTile key={opt.id} size="sm" optionId={opt.id} checked={(watch('resKitchenEquipment') || []).includes(opt.id)} label={optLabel('RES_KITCHEN_EQUIPMENT_OPTIONS', opt)} onChange={() => toggleArrayValue('resKitchenEquipment', opt.id)} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title={t('resExteriorCommoditiesTitle')} icon={Trees}>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">{t('resExteriorLabel')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {RES_EXTERIOR_OPTIONS.map((opt) => (
              <IconTile key={opt.id} optionId={opt.id} checked={(watch('resExterior') || []).includes(opt.id)} label={optLabel('RES_EXTERIOR_OPTIONS', opt)} onChange={() => toggleArrayValue('resExterior', opt.id)} />
            ))}
          </div>
        </div>
        <div className="space-y-8 border-t border-gray-100 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('resHeatingLabel')}</label>
              <div className="grid grid-cols-3 gap-3">
                {RES_HEATING_OPTIONS.map((opt) => (
                  <IconTile key={opt.id} optionId={opt.id} type="radio" checked={watch('resHeating') === opt.id} label={optLabel('RES_HEATING_OPTIONS', opt)} onChange={() => setValue('resHeating', opt.id as any)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('resAcLabel')}</label>
              <div className="grid grid-cols-3 gap-3">
                {RES_AC_OPTIONS.map((opt) => (
                  <IconTile key={opt.id} optionId={opt.id} type="radio" checked={watch('resAc') === opt.id} label={optLabel('RES_AC_OPTIONS', opt)} onChange={() => setValue('resAc', opt.id as any)} />
                ))}
              </div>
            </div>
          </div>
          {/* Sécurité et Connectivité face à face — même disposition que /announces/[id] */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('resSecurityLabel')}</label>
              <div className="grid grid-cols-3 gap-3">
                {RES_SECURITY_OPTIONS.map((opt) => (
                  <IconTile key={opt.id} optionId={opt.id} checked={(watch('resSecurity') || []).includes(opt.id)} label={optLabel('RES_SECURITY_OPTIONS', opt)} onChange={() => toggleArrayValue('resSecurity', opt.id)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('resConnectivityLabel')}</label>
              <div className="grid grid-cols-3 gap-3">
                {RES_CONNECTIVITY_OPTIONS.map((opt) => (
                  <IconTile key={opt.id} optionId={opt.id} checked={(watch('resConnectivity') || []).includes(opt.id)} label={optLabel('RES_CONNECTIVITY_OPTIONS', opt)} onChange={() => toggleArrayValue('resConnectivity', opt.id)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {opts?.withEnergy !== false && (
      <Section title={t('resEnergyTitle')} icon={Zap}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([
            ['resWaterLabel', 'resWaterCounter', Droplet, 'text-blue-500'],
            ['resElecLabel', 'resElecCounter', Zap, 'text-yellow-500'],
            ['resGasLabel', 'resGasCounter', Flame, 'text-orange-500'],
          ] as const).map(([labelKey, field, Icon, colorCls]) => (
            <div key={field} className="bg-white border-2 border-gray-200 p-4 rounded-xl">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Icon className={cn('w-4 h-4', colorCls)} />{t(labelKey)}</h4>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  <input type="radio" value="INDIVIDUEL" checked={watch(field) === 'INDIVIDUEL'} onChange={() => setValue(field, 'INDIVIDUEL' as any)} className="accent-[#0094BD] w-4 h-4" />{t('resCounterIndividuel')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  <input type="radio" value="COMMUN" checked={watch(field) === 'COMMUN'} onChange={() => setValue(field, 'COMMUN' as any)} className="accent-[#0094BD] w-4 h-4" />{t('resCounterCommun')}
                </label>
              </div>
            </div>
          ))}
        </div>
      </Section>
      )}
    </>
  );

  const renderCommentSection = () => (
    <Section title={t('resLocCommentTitle')} icon={Sparkles}>
      <Field label={t('searchTitleLabel')}>
        <input type="text" {...register('title')} maxLength={120} className={inputCls} placeholder={t('searchTitlePlaceholder')} />
      </Field>
      <textarea {...register('comment')} rows={3} maxLength={5000} className={inputCls} placeholder={t('resLocCommentPlaceholder')}></textarea>
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
      {includeFloor && renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: t('exVal', { v: '0' }), placeholderMax: t('exVal', { v: '4' }) })}
      {renderBoxedBudgetField(t('budgetMin'), 'minBudget')}
      {renderBoxedBudgetField(t('budgetMax'), 'maxBudget', { withUnit: true })}
      <div className="min-w-0">
        <label className="block text-sm font-bold text-gray-900 mb-2">{t('resLocInstallationDateTitle')}</label>
        <input
          type="date" {...register('installationDate')}
          className="w-full p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base"
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
                      {renderBoxedSingle(t('resLocTypologyRange'), 'buildingTypologySimilaire', { unit: 'F', unitPosition: 'prefix', placeholder: t('exVal', { v: '3' }) })}
                      {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceSimilaireMin', 'buildingSurfaceSimilaireMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '80' }), placeholderMax: t('exVal', { v: '120' }) })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-700 mb-3">{t('immeubleCaracDifferentesTitle')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {renderBoxedRange(t('resLocTypologyRange'), 'buildingTypologyMin', 'buildingTypologyMax', { unit: 'F', unitPosition: 'prefix', placeholderMin: t('exVal', { v: '3' }), placeholderMax: t('exVal', { v: '5' }) })}
                      {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceMin', 'buildingSurfaceMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '80' }), placeholderMax: t('exVal', { v: '120' }) })}
                      {renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: t('exVal', { v: '0' }), placeholderMax: t('exVal', { v: '4' }) })}
                    </div>
                  </div>
                  {renderImmeubleSharedRow(false)}
                </>
              ) : hasSimilaires ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {renderBoxedSingle(t('resLocTypologyRange'), 'buildingTypologySimilaire', { unit: 'F', unitPosition: 'prefix', placeholder: t('exVal', { v: '3' }) })}
                    {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceSimilaireMin', 'buildingSurfaceSimilaireMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '80' }), placeholderMax: t('exVal', { v: '120' }) })}
                    {renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: t('exVal', { v: '0' }), placeholderMax: t('exVal', { v: '4' }) })}
                  </div>
                  {renderImmeubleSharedRow(false)}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {renderBoxedRange(t('resLocTypologyRange'), 'buildingTypologyMin', 'buildingTypologyMax', { unit: 'F', unitPosition: 'prefix', placeholderMin: t('exVal', { v: '3' }), placeholderMax: t('exVal', { v: '5' }) })}
                    {renderBoxedRange(t('resLocSurfaceMax'), 'buildingSurfaceMin', 'buildingSurfaceMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '80' }), placeholderMax: t('exVal', { v: '120' }) })}
                    {renderBoxedRange(t('resLocFloorMax'), 'buildingFloorsMin', 'buildingFloorsMax', { placeholderMin: t('exVal', { v: '0' }), placeholderMax: t('exVal', { v: '4' }) })}
                  </div>
                  {renderImmeubleSharedRow(false)}
                </>
              )}
            </div>
          </Section>
        )}

        {/* Localisation / Cadre de vie et Environnement — exactement les mêmes blocs partagés que
            la fiche "Recherche Appartement, Villa, Niveau de Villa". Interlocuteur souhaité +
            message explicatif : page 2 du parcours (étape INTERLOCUTOR, commune à tout le branche
            Résidentiel) — demande client du 15/10/2026. */}
        {renderLocalisationSection({ hideDate: true })}
        {renderEnvironmentSection()}
        {renderResidentielEquipmentsSection()}

        {/* Stade de réalisation — uniquement pour l'achat d'un immeuble (une location d'immeuble
            entier ne se conçoit pas "sur plan"). */}
        {isResidentielAchat && (
          <Section title={t('sqRealisationStage')} icon={Sparkles}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              {REALISATION_STAGE_OPTIONS.map((opt) => (
                <PillOption type="radio" key={opt.id} checked={watch('realisationStage') === opt.id} label={optLabel('REALISATION_STAGE_OPTIONS', opt)} onChange={() => setValue('realisationStage', opt.id as any)} />
              ))}
            </div>
          </Section>
        )}
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
        {renderResidentielEquipmentsSection()}
        {/* Interlocuteur souhaité + message explicatif : page 2 du parcours (étape INTERLOCUTOR),
            cf. steps array plus bas — demande client du 15/10/2026. */}
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
        <OptionGroup label={t('burSpaceTypeLabel')} options={OFFICE_SPACE_TYPE_OPTIONS} field="baSpaceTypes" watch={watch} toggle={toggleArrayValue} translateNs="OFFICE_SPACE_TYPE_OPTIONS" />
      </Section>

      <Section title={t('burEnergyTitle')} icon={Zap}>
        <OptionGroup label={t('burEnergyLabel')} options={OFFICE_ENERGY_OPTIONS} field="baEnergie" watch={watch} toggle={toggleArrayValue} tiles translateNs="OFFICE_ENERGY_OPTIONS" />
      </Section>

      {renderLocalisationSection()}
      {renderEnvironmentSection()}
      {renderResidentielEquipmentsSection({ withEnergy: false })}
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {GENERAL_STATE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('bcEtatGeneral') || []).includes(opt.id)} label={optLabel('GENERAL_STATE_OPTIONS', opt)} onChange={() => toggleArrayValue('bcEtatGeneral', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('burZoneTypeTitle')} icon={Compass}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {ZONE_TYPE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('bcZoneType') || []).includes(opt.id)} label={optLabel('ZONE_TYPE_OPTIONS', opt)} onChange={() => toggleArrayValue('bcZoneType', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('burVisibiliteTitle')} icon={Store}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {VISIBILITY_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('bcVisibilite') || []).includes(opt.id)} label={optLabel('VISIBILITY_OPTIONS', opt)} onChange={() => toggleArrayValue('bcVisibilite', opt.id)} />
          ))}
        </div>
      </Section>

      {renderLocalisationSection()}
      {renderEnvironmentSection()}
      {renderResidentielEquipmentsSection()}
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {LOCAL_STYLE_ETAT_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('lcStyleEtat') || []).includes(opt.id)} label={optLabel('LOCAL_STYLE_ETAT_OPTIONS', opt)} onChange={() => toggleArrayValue('lcStyleEtat', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('burLocalEnvironmentTitle')} icon={Compass}>
        <div className="space-y-3">
          <OptionGroup label={t('burLocalEnvironmentLabel')} options={LOCAL_ENVIRONMENT_OPTIONS} field="lcEnvironnement" watch={watch} toggle={toggleArrayValue} translateNs="LOCAL_ENVIRONMENT_OPTIONS" />
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
          <OptionGroup label={t('burLocalUsageLabel')} options={LOCAL_USAGE_OPTIONS} field="lcUsage" watch={watch} toggle={toggleArrayValue} translateNs="LOCAL_USAGE_OPTIONS" />
          {(watch('lcUsage') || []).includes('AUTRE') && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('autrePrecisezLabel')}</label>
              <input type="text" {...register('lcUsageOther')} className={inputCls} placeholder={t('autrePrecisezPlaceholder')} />
            </div>
          )}
        </div>
      </Section>

      {renderLocalisationSection()}
      {renderEnvironmentSection()}
      {renderResidentielEquipmentsSection()}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  // Fiche « Showroom » (Bureaux & Commerces) — mêmes rubriques que la fiche annonce Showroom du dépôt
  // (Superficies & Dimensions, État & Style architectural, Visibilité & Accessibilité), puis les blocs
  // communs des fiches Bureaux : localisation, cadre de vie, équipements, interlocuteur, message.
  const renderShowroomCriteria = () => (
    <>
      <Section title={tDep('f137')} icon={Ruler}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {renderBoxedRange(tDep('f040'), 'srSurfaceTerrainMin', 'srSurfaceTerrainMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '300' }), placeholderMax: t('exVal', { v: '1000' }) })}
            {renderBoxedRange(tDep('f138'), 'srSurfaceBatieMin', 'srSurfaceBatieMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '200' }), placeholderMax: t('exVal', { v: '600' }) })}
            {renderBoxedRange(tDep('f139'), 'srNiveauxMin', 'srNiveauxMax', { placeholderMin: t('exVal', { v: '1' }), placeholderMax: t('exVal', { v: '2' }) })}
          </div>
          {renderIndustrielBudgetDateRow()}
        </div>
      </Section>

      <Section title={tDep('f140')} icon={Sparkles}>
        <div className="space-y-5">
          {renderDepGroup(tDep('f141'), 'SHOWROOM_STYLE', SHOWROOM_STYLE, 'srStyle')}
          {renderDepGroup(tDep('f142'), 'SHOWROOM_STRUCTURE', SHOWROOM_STRUCTURE, 'srStructure',
            (watch('srStructure') || []).includes('AUTRE') ? (
              <div className="mt-3">
                <label className="block text-sm font-bold text-gray-900 mb-2">{t('autrePrecisezLabel')}</label>
                <input type="text" {...register('srStructureOther')} className={inputCls} placeholder={t('autrePrecisezPlaceholder')} />
              </div>
            ) : null)}
        </div>
      </Section>

      <Section title={tDep('f143')} icon={Store}>
        {renderYesNo(tDep('f144'), 'srVisibiliteAutoroute', t('optYes'), t('optNo'))}
      </Section>

      {renderLocalisationSection()}
      {renderEnvironmentSection()}
      {renderResidentielEquipmentsSection()}
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
        <label className="block text-sm font-bold text-gray-900 mb-2">{watch('transaction') === TransactionType.SALE ? t('indAcqDateTitle') : t('indLocDateTitle')}</label>
        <input
          type="date" {...register('installationDate')}
          className="w-full p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base"
        />
      </div>
    </div>
  );

  // Documents attendus pour la vente — proposés uniquement quand transaction === SALE, partagés
  // par les 3 fiches Industriel (une seule active à la fois).
  const renderIndustrielLegalDocumentsSection = () => {
    if (watch('transaction') !== TransactionType.SALE) return null;
    return (
      <Section title={t('indLegalDocumentsTitle')} icon={FileCheck}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {LEGAL_DOCUMENTS_SALE.map((opt) => (
            <PillOption key={opt.id} checked={(watch('indLegalDocuments') || []).includes(opt.id)} label={optLabel('LEGAL_DOCUMENTS_SALE', opt)} onChange={() => toggleArrayValue('indLegalDocuments', opt.id)} />
          ))}
        </div>
      </Section>
    );
  };

  // --- Cadre & commodités clonés des fiches annonce (/deposit) pour Industriel et Terrain — demande
  // client du 25/10/2026 ("pas la cuisine : ce qu'ils ont eux dans la fiche d'annonce"). Mêmes groupes,
  // mêmes options et mêmes intitulés que le dépôt, au format pastilles de ce formulaire ; tout est en
  // choix multiple (on décrit des souhaits), sauf les Oui/Non. ---

  // Mise en page (retour client du 06/11/2026, « aligner sur les mêmes lignes ») : UN groupe par ligne,
  // pleine largeur (conteneurs `space-y-5`) — jamais deux groupes côte à côte, sinon chacun n'a que la
  // moitié de la largeur et ses options passent à la ligne de façon incohérente (2 + 1).
  // Groupe de pastilles à choix multiple. `group` = nom du groupe DepositOptions ('' si les libellés
  // sont déjà traduits, ex. options construites à partir de clés Deposit).
  const renderDepGroup = (label: string, group: string, options: readonly { id: string; label: string }[], field: any, extra?: React.ReactNode) => (
    <div className="min-w-0">
      {label && <label className="block text-sm font-bold text-gray-900 mb-3">{label}</label>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {options.map((opt) => (
          <PillOption key={opt.id} checked={((watch(field) as string[] | undefined) || []).includes(opt.id)} label={depOpt(group, opt)} onChange={() => toggleArrayValue(field, opt.id)} />
        ))}
      </div>
      {extra}
    </div>
  );

  // Oui / Non à choix unique (re-cliquer désélectionne).
  const renderYesNo = (label: string, field: 'indOffices' | 'terViabilise' | 'srVisibiliteAutoroute', yesLabel: string, noLabel: string, extra?: React.ReactNode) => (
    <div className="min-w-0">
      <label className="block text-sm font-bold text-gray-900 mb-3">{label}</label>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {([['OUI', yesLabel], ['NON', noLabel]] as const).map(([v, l]) => (
          <PillOption type="radio" key={v} checked={watch(field) === v} label={l} onChange={() => setValue(field, (watch(field) === v ? undefined : v) as any)} />
        ))}
      </div>
      {extra}
    </div>
  );

  const renderNestedNumber = (label: string, field: any, placeholder: string, unit?: string) => (
    <div className="mt-3 max-w-xs">{renderHtlBoxedNumber(label, field, { unit, placeholder })}</div>
  );

  // --- Fiches Industriel : à partir de l'infrastructure, MÊME design et MÊME ordre que la fiche annonce
  // du dépôt (retour client du 08/11/2026, capture à l'appui) — cartes encadrées (une par groupe), titre
  // en gras, cases à cocher / boutons radio en liste, mêmes grilles que /deposit. Seule la couleur
  // d'accent reste le bleu de ce formulaire. Hangar/Usine : Emplacement → Annexes & Commodités →
  // Énergie & Fluides → Sécurité incendie. Chambre froide : Annexes → Configuration & Emplacement →
  // Équipements de sécurité & Performance → Modalités. ---

  const depCard = (title: string, children: React.ReactNode, subtitle?: string) => (
    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
      <div className="font-bold text-gray-900 mb-3">{title}</div>
      {subtitle && <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{subtitle}</div>}
      {children}
    </div>
  );

  // Liste de cases (choix multiple, via toggleArrayValue — garde les options « aucun » exclusives) ou
  // de boutons radio (choix unique), comme dans les cartes du dépôt.
  const renderCheckList = (items: { id: string; label: string }[], field: any, type: 'checkbox' | 'radio' = 'checkbox', layout = 'space-y-2') => (
    <div className={layout}>
      {items.map((x) => (
        <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
          <input
            type={type}
            name={type === 'radio' ? String(field) : undefined}
            checked={type === 'radio' ? watch(field) === x.id : ((watch(field) as string[] | undefined) || []).includes(x.id)}
            onChange={() => (type === 'radio' ? setValue(field, x.id as any) : toggleArrayValue(field, x.id))}
            className="accent-[#0094BD] w-4 h-4"
          />
          {x.label}
        </label>
      ))}
    </div>
  );

  const depItems = (group: string, arr: readonly { id: string; label: string }[]) => arr.map((o) => ({ id: o.id, label: depOpt(group, o) }));
  const resItems = (group: string, arr: readonly { id: string; label: string }[]) => arr.map((o) => ({ id: o.id, label: optLabel(group, o) }));

  const depNumberInput = (field: any, placeholder: string, label?: string) => (
    <div className="mt-3">
      {label && <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>}
      <input
        {...register(field)}
        type="number"
        min="0"
        onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()}
        placeholder={placeholder}
        className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none font-medium text-gray-900"
      />
    </div>
  );

  // Emplacement — Hangar (« Emplacement » : Situation + Logistique) et Usine (« Emplacement &
  // Logistique » : Situation + Accès transport), comme au dépôt.
  const renderIndustrielEmplacementSection = (zoneField: 'hgZone' | 'usZone', accesField: 'hgAccesTransport' | 'usAccesTransport', variant: 'hangar' | 'usine') => (
    <Section title={tDep(variant === 'hangar' ? 'f057' : 'f013')} icon={MapPin}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {depCard(tDep('f014'), renderCheckList(depItems('INDUSTRIAL_SITUATIONS', INDUSTRIAL_SITUATIONS), zoneField))}
        {variant === 'hangar'
          ? depCard(tDep('f058'), renderCheckList(depItems('INDUSTRIAL_ACCESS_TRANSPORT', DEP_INDUSTRIAL_ACCESS_TRANSPORT), accesField), tDep('f015'))
          : depCard(tDep('f015'), renderCheckList(depItems('INDUSTRIAL_ACCESS_TRANSPORT', DEP_INDUSTRIAL_ACCESS_TRANSPORT), accesField))}
      </div>
    </Section>
  );

  // Annexes & Commodités — Hangar, Usine et Chambre froide.
  const renderIndustrielAnnexesSection = (gridClassName = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch') => (
    <Section title={tDep('f016')} icon={LayoutGrid}>
      <div className={gridClassName}>
        {depCard(tDep('f017'), (
          <>
            <div className="flex gap-4 flex-wrap">
              {renderCheckList([{ id: 'OUI', label: tDep('f018') }, { id: 'NON', label: tDep('f019') }], 'indOffices', 'radio')}
            </div>
            {watch('indOffices') === 'OUI' && depNumberInput('indOfficesAreaMin', tDep('f352'), tDep('f020'))}
          </>
        ))}
        {depCard(tDep('f021'), renderCheckList(depItems('INDUSTRIAL_SOCIAL_LOCALES', INDUSTRIAL_SOCIAL_LOCALES), 'indSocialLocales'))}
        {depCard(tDep('f022'), renderCheckList(depItems('INDUSTRIAL_HEBERGEMENT', INDUSTRIAL_HEBERGEMENT), 'indHebergement'))}
        {depCard(tDep('f023'), renderCheckList(depItems('INDUSTRIAL_SECURITY', INDUSTRIAL_SECURITY), 'indSecurity'))}
      </div>
    </Section>
  );

  // Énergie & Fluides — Hangar et Usine.
  const renderIndustrielEnergySection = () => (
    <Section title={tDep('f024')} icon={Zap}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {depCard(tDep('f025'), (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{tDep('f026')}</label>
              <input
                {...register('indKvaMin')}
                type="number"
                min="0"
                onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()}
                placeholder={tDep('f353')}
                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none font-medium text-gray-900"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white">
              <input type="checkbox" checked={!!watch('indForceMotrice')} onChange={() => setValue('indForceMotrice', !watch('indForceMotrice'))} className="accent-[#0094BD] w-5 h-5" />
              <span className="font-bold text-gray-900 text-sm">{tDep('f027')}</span>
            </label>
          </div>
        ))}
        {depCard(tDep('f028'), renderCheckList([
          { id: 'INDUSTRIEL', label: tDep('f029') }, { id: 'VILLE', label: tDep('f030') }, { id: 'AUCUN', label: tDep('f031') },
        ], 'indGas'))}
        {depCard(tDep('f032'), renderCheckList(depItems('INDUSTRIAL_WATER_SOURCES', INDUSTRIAL_WATER_SOURCES), 'indWaterSources'))}
        {depCard(tDep('f033'), renderCheckList([
          { id: 'RESEAU_PUBLIC', label: tDep('f034') }, { id: 'FOSSE_INDUSTRIELLE', label: tDep('f035') },
        ], 'indSanitation'))}
      </div>
    </Section>
  );

  // Sécurité incendie & Protection — Hangar et Usine.
  const renderIndustrielFireSection = () => (
    <Section title={tDep('f036')} icon={Siren}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {depCard(tDep('f037'), renderCheckList(depItems('INDUSTRIAL_FIRE_NETWORK', INDUSTRIAL_FIRE_NETWORK), 'indFireNetwork'))}
        {depCard(tDep('f038'), (
          <>
            {renderCheckList(depItems('INDUSTRIAL_FIRE_EQUIPMENT', INDUSTRIAL_FIRE_EQUIPMENT), 'indFireEquipment')}
            {(watch('indFireEquipment') || []).includes('BACHE_EAU') && depNumberInput('indFireWaterReserveMin', tDep('f354'), tDep('f172'))}
          </>
        ))}
      </div>
    </Section>
  );

  // Configuration & Emplacement du site — Chambre froide (6 cartes, comme au dépôt).
  const renderCfConfigSection = () => (
    <Section title={tDep('f064')} icon={MapPin}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {depCard(tDep('f065'), renderCheckList(depItems('INDUSTRIAL_SITUATIONS', INDUSTRIAL_SITUATIONS), 'cfLocalisation'))}
        {depCard(tDep('f066'), renderCheckList(resItems('CF_STRUCTURE_TYPES', CF_STRUCTURE_TYPES), 'cfStructureType', 'radio'))}
        {depCard(tDep('f067'), (
          <>
            {renderCheckList([{ id: 'PLAIN_PIED', label: tDep('f068') }, { id: 'ETAGES', label: tDep('f069') }], 'cfConfiguration')}
            {(watch('cfConfiguration') || []).includes('ETAGES') && depNumberInput('cfFloorsMin', tDep('f139'))}
          </>
        ))}
        {depCard(tDep('f070'), (
          <>
            {renderCheckList([{ id: 'MONTE_CHARGE', label: tDep('f071') }, { id: 'AUCUN', label: tDep('f031') }], 'cfLogistiqueVerticale')}
            {(watch('cfLogistiqueVerticale') || []).includes('MONTE_CHARGE') && depNumberInput('cfMonteChargeCapacityMin', tDep('f363'))}
          </>
        ))}
        {depCard(tDep('f072'), renderCheckList(depItems('INDUSTRIAL_ACCESS_TRANSPORT', DEP_INDUSTRIAL_ACCESS_TRANSPORT), 'cfAccessibilite'))}
        {depCard(tDep('f073'), renderCheckList(depItems('CF_ZONE_DECHARGEMENT', CF_ZONE_DECHARGEMENT), 'cfZoneDechargement'))}
      </div>
    </Section>
  );

  // Équipements de sécurité & Performance — Chambre froide (énergie de secours + technique froid, puis
  // type de froid + mode de diffusion, comme au dépôt).
  const renderCfEquipmentSection = () => (
    <Section title={tDep('f074')} icon={Shield}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {depCard(tDep('f075'), (
            <>
              <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white">
                <input type="checkbox" checked={!!watch('cfGenerateur')} onChange={() => setValue('cfGenerateur', !watch('cfGenerateur'))} className="accent-[#0094BD] w-5 h-5" />
                <span className="font-bold text-gray-900 text-sm">{tDep('f076')}</span>
              </label>
              {watch('cfGenerateur') && depNumberInput('cfGenerateurKvaMin', tDep('f364'))}
            </>
          ))}
          {depCard(tDep('f077'), renderCheckList(depItems('CF_TECHNIQUE_FROID', CF_TECHNIQUE_FROID), 'cfTechniqueFroid'))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {depCard(tDep('f078'), renderCheckList(resItems('CF_TYPE_FROID_OPTIONS', CF_TYPE_FROID_OPTIONS), 'cfTypeFroidChoices'))}
          {depCard(tDep('f079'), renderCheckList(depItems('CF_MODE_DIFFUSION', CF_MODE_DIFFUSION), 'cfModeDiffusion'))}
        </div>
      </div>
    </Section>
  );

  // Modalités — Chambre froide (mode de gestion, dernière section comme sur la fiche annonce ; titre de
  // la recherche, le « Modalités de location » du dépôt serait faux pour une recherche en achat).
  const renderCfModalitesSection = () => (
    <Section title={t('cfModeGestionTitle')} icon={Users}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {depCard(tDep('f081'), renderCheckList(resItems('CF_MODE_GESTION_OPTIONS', CF_MODE_GESTION_OPTIONS), 'cfModeGestionChoices'))}
      </div>
    </Section>
  );


  const renderHangarLocationCriteria = () => (
    <>
      <Section title={t('hgUsageTitle')} icon={Warehouse}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {HANGAR_USAGE_OPTIONS.map((opt) => (
            <PillOption key={opt.id} checked={(watch('hgUsageType') || []).includes(opt.id)} label={optLabel('HANGAR_USAGE_OPTIONS', opt)} onChange={() => toggleArrayValue('hgUsageType', opt.id)} />
          ))}
        </div>
      </Section>

      <Section title={t('resLocTypologyTitle')} icon={Ruler}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {renderBoxedRange(t('hgSurfaceTerrainLabel'), 'hgSurfaceTerrainMin', 'hgSurfaceTerrainMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '500' }), placeholderMax: t('exVal', { v: '1000' }) })}
            {renderBoxedRange(t('hgSurfaceCouverteLabel'), 'hgSurfaceCouverteMin', 'hgSurfaceCouverteMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '300' }), placeholderMax: t('exVal', { v: '800' }) })}
            {renderBoxedRange(t('hgHauteurLabel'), 'hgHauteurMin', 'hgHauteurMax', { unit: 'm', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '5' }), placeholderMax: t('exVal', { v: '8' }) })}
          </div>
          {renderIndustrielBudgetDateRow()}
        </div>
      </Section>

      {/* À partir d'ici : même design et même ordre que la fiche annonce Hangar du dépôt. */}
      {renderIndustrielEmplacementSection('hgZone', 'hgAccesTransport', 'hangar')}
      {renderIndustrielAnnexesSection()}
      {renderIndustrielEnergySection()}
      {renderIndustrielFireSection()}

      {renderIndustrielLegalDocumentsSection()}
      {renderLocalisationSection({ hideDate: true })}
      {renderIndustrielLocationInterlocutorSection('SOCIETE_ENTREPOSAGE')}
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
                <PillOption key={opt.id} checked={natureList.includes(opt.id)} label={optLabel('USINE_ACTIVITY_OPTIONS', opt)} onChange={() => toggleArrayValue('usNature', opt.id)} />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {USINE_EQUIPMENT_OPTIONS.map((opt) => (
              <IconTile key={opt.id} optionId={opt.id} checked={(watch('usEquipement') || []).includes(opt.id)} label={optLabel('USINE_EQUIPMENT_OPTIONS', opt)} onChange={() => toggleArrayValue('usEquipement', opt.id)} />
            ))}
          </div>
        </Section>

        <Section title={t('resLocTypologyTitle')} icon={Ruler}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
              {renderBoxedRange(t('usSurfaceTerrainLabel'), 'usSurfaceTerrainMin', 'usSurfaceTerrainMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '500' }), placeholderMax: t('exVal', { v: '1500' }) })}
              {renderBoxedRange(t('usSurfaceBatieLabel'), 'usSurfaceBatieMin', 'usSurfaceBatieMax', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '300' }), placeholderMax: t('exVal', { v: '1000' }) })}
            </div>
            {renderIndustrielBudgetDateRow()}
          </div>
        </Section>

        {/* À partir d'ici : même design et même ordre que la fiche annonce Usine du dépôt. */}
        {renderIndustrielEmplacementSection('usZone', 'usAccesTransport', 'usine')}
        {renderIndustrielAnnexesSection()}
        {renderIndustrielEnergySection()}
        {renderIndustrielFireSection()}

        {renderIndustrielLegalDocumentsSection()}
        {renderLocalisationSection({ hideDate: true })}
        {renderIndustrielLocationInterlocutorSection('SOCIETE_ENTREPOSAGE')}
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
                <PillOption key={opt.id} checked={activiteList.includes(opt.id)} label={optLabel('CF_ACTIVITY_OPTIONS', opt)} onChange={() => toggleArrayValue('cfActivite', opt.id)} />
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
              {renderBoxedRange(t('cfCapaciteLabel'), 'cfCapaciteMin', 'cfCapaciteMax', { unit: 'm³', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '50' }), placeholderMax: t('exVal', { v: '200' }) })}
            </div>
            {renderIndustrielBudgetDateRow()}
          </div>
        </Section>

        {/* À partir d'ici : même design et même ordre que la fiche annonce Chambre froide du dépôt
            (type de structure, type de froid et mode de gestion sont désormais des cartes de ces sections). */}
        {renderIndustrielAnnexesSection('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5')}
        {renderCfConfigSection()}
        {renderCfEquipmentSection()}
        {renderCfModalitesSection()}

        {renderIndustrielLegalDocumentsSection()}
        {renderLocalisationSection({ hideDate: true })}
        {renderIndustrielLocationInterlocutorSection('SOCIETE_ENTREPOSAGE_FRIGO')}
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
      <div className="flex items-center rounded-xl border-2 border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#0094BD] focus-within:border-[#0094BD] transition-all">
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
                  <PillOption type="radio" key={opt.id} checked={watch('htlProfilGroupe') === opt.id} label={optLabel('HTL_PROFIL_GROUPE_OPTIONS', opt)} onChange={() => setValue('htlProfilGroupe', opt.id as any)} />
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
              <PillOption type="radio" checked={statutHebergeur === 'PARTICULIER'} label={t('htlStatutParticulierLabel')} onChange={() => setValue('htlStatutHebergeur', 'PARTICULIER')} />
              <PillOption type="radio" checked={statutHebergeur === 'PROFESSIONNEL'} label={t('htlStatutProLabel')} onChange={() => setValue('htlStatutHebergeur', 'PROFESSIONNEL')} />
            </div>
            {statutHebergeur === 'PROFESSIONNEL' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlClassementLabel')}</label>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                    {HTL_CLASSEMENT_OPTIONS.map((opt) => (
                      <PillOption key={opt.id} checked={(watch('htlClassement') || []).includes(opt.id)} label={optLabel('HTL_CLASSEMENT_OPTIONS', opt)} onChange={() => toggleArrayValue('htlClassement', opt.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlTypeEtablissementLabel')}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {HTL_TYPE_ETABLISSEMENT_OPTIONS.map((opt) => (
                      <PillOption key={opt.id} checked={(watch('htlTypeEtablissement') || []).includes(opt.id)} label={optLabel('HTL_TYPE_ETABLISSEMENT_OPTIONS', opt)} onChange={() => toggleArrayValue('htlTypeEtablissement', opt.id)} />
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
                  <PillOption type="radio" key={opt.id} checked={formule === opt.id} label={optLabel('HTL_FORMULE_OPTIONS', opt)} onChange={() => setValue('htlFormule', opt.id as any)} />
                ))}
              </div>
            </div>

            {formule === 'CHAMBRE_PRIVEE' && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlGammeChambreLabel')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_GAMME_CHAMBRE_OPTIONS.map((opt) => (
                    <PillOption type="radio" key={opt.id} checked={watch('htlGammeChambre') === opt.id} label={optLabel('HTL_GAMME_CHAMBRE_OPTIONS', opt)} onChange={() => setValue('htlGammeChambre', opt.id as any)} />
                  ))}
                </div>
              </div>
            )}

            {formule === 'A_LA_PLACE' && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlTypeCouchageLabel')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_TYPE_COUCHAGE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlTypeCouchage') || []).includes(opt.id)} label={optLabel('HTL_TYPE_COUCHAGE_OPTIONS', opt)} onChange={() => toggleArrayValue('htlTypeCouchage', opt.id)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlNatureBienLabel')}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HTL_NATURE_BIEN_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={(watch('htlNatureBien') || []).includes(opt.id)} label={optLabel('HTL_NATURE_BIEN_OPTIONS', opt)} onChange={() => toggleArrayValue('htlNatureBien', opt.id)} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900">{t('htlExigencesTitle')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {renderHtlBoxedNumber(t('htlSurfaceMinLabel'), 'htlSurfaceMin', { unit: 'm²', placeholder: t('exVal', { v: '60' }) })}
                {renderHtlBoxedNumber(t('htlNbChambresMinLabel'), 'htlNbChambresMin', { placeholder: t('exVal', { v: '2' }) })}
                {renderHtlBoxedNumber(t('htlNbSalonsMinLabel'), 'htlNbSalonsMin', { placeholder: t('exVal', { v: '1' }) })}
                {renderHtlBoxedNumber(t('htlNbSdbMinLabel'), 'htlNbSdbMin', { placeholder: t('exVal', { v: '1' }) })}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlSuiteParentaleLabel')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  <PillOption type="radio" checked={watch('htlSuiteParentale') === 'OUI'} label={t('optYes')} onChange={() => setValue('htlSuiteParentale', 'OUI')} />
                  <PillOption type="radio" checked={watch('htlSuiteParentale') === 'NON'} label={t('optNo')} onChange={() => setValue('htlSuiteParentale', 'NON')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlAccessibiliteLabel')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_ACCESSIBILITE_OPTIONS.map((opt) => (
                    <PillOption type="radio" key={opt.id} checked={watch('htlAccessibilite') === opt.id} label={optLabel('HTL_ACCESSIBILITE_OPTIONS', opt)} onChange={() => setValue('htlAccessibilite', opt.id as any)} />
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
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                {HTL_AMBIANCE_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={ambiances.includes(opt.id)} label={optLabel('HTL_AMBIANCE_OPTIONS', opt)} onChange={() => toggleArrayValue('htlAmbiances', opt.id)} />
                ))}
              </div>
            </div>

            {ambiances.includes('BALNEAIRE') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlBalneaireTitle')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_BALNEAIRE_OPTIONS.map((opt) => (
                    <PillOption type="radio" key={opt.id} checked={watch('htlBalneaire') === opt.id} label={optLabel('HTL_BALNEAIRE_OPTIONS', opt)} onChange={() => setValue('htlBalneaire', opt.id as any)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('URBAIN') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlUrbainTitle')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_URBAIN_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlUrbain') || []).includes(opt.id)} label={optLabel('HTL_URBAIN_OPTIONS', opt)} onChange={() => toggleArrayValue('htlUrbain', opt.id)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('SAHARIEN') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlSaharienTitle')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_SAHARIEN_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlSaharien') || []).includes(opt.id)} label={optLabel('HTL_SAHARIEN_OPTIONS', opt)} onChange={() => toggleArrayValue('htlSaharien', opt.id)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('THERMAL') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlThermalTitle')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_THERMAL_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlThermal') || []).includes(opt.id)} label={optLabel('HTL_THERMAL_OPTIONS', opt)} onChange={() => toggleArrayValue('htlThermal', opt.id)} />
                  ))}
                </div>
              </div>
            )}
            {ambiances.includes('CLIMATIQUE') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlClimatiqueTitle')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_CLIMATIQUE_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlClimatique') || []).includes(opt.id)} label={optLabel('HTL_CLIMATIQUE_OPTIONS', opt)} onChange={() => toggleArrayValue('htlClimatique', opt.id)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlVueLabel')}</label>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                {HTL_VUE_OPTIONS.map((opt) => (
                  <PillOption key={opt.id} checked={(watch('htlVue') || []).includes(opt.id)} label={optLabel('HTL_VUE_OPTIONS', opt)} onChange={() => toggleArrayValue('htlVue', opt.id)} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 5. Équipements, Services & Secours Autonome */}
        <Section title={t('htlEquipementsTitle')} icon={Utensils}>
          <div className="space-y-4">
            <OptionGroup label={t('htlServicesRepasLabel')} options={HTL_SERVICES_REPAS_OPTIONS} field="htlServicesRepas" watch={watch} toggle={toggleArrayValue} translateNs="HTL_SERVICES_REPAS_OPTIONS" />
            <OptionGroup label={t('htlCuisineLabel')} options={HTL_CUISINE_OPTIONS} field="htlCuisine" watch={watch} toggle={toggleArrayValue} gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-3" translateNs="HTL_CUISINE_OPTIONS" />
            <OptionGroup label={t('htlConfortLabel')} options={HTL_CONFORT_OPTIONS} field="htlConfort" watch={watch} toggle={toggleArrayValue} gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-3" translateNs="HTL_CONFORT_OPTIONS" />
            <OptionGroup label={t('htlFluidesLabel')} options={HTL_FLUIDES_OPTIONS} field="htlFluides" watch={watch} toggle={toggleArrayValue} translateNs="HTL_FLUIDES_OPTIONS" />
            <OptionGroup label={t('htlLoisirsLabel')} options={HTL_LOISIRS_OPTIONS} field="htlLoisirs" watch={watch} toggle={toggleArrayValue} translateNs="HTL_LOISIRS_OPTIONS" />
          </div>
        </Section>

        {/* 6. Budget, Modalités Financières & Paiement */}
        <Section title={t('htlBudgetSectionTitle')} icon={Wallet}>
          <div className="space-y-5">
            <div className="max-w-xs">
              {renderHtlBoxedNumber(t('htlBudgetMaxNuitLabel'), 'htlBudgetMaxNuit', { unit: 'DZD', placeholder: t('exVal', { v: '8000' }) })}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlDeviseLabel')}</label>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                <PillOption type="radio" checked={watch('htlDevise') === 'DZD'} label={t('htlDeviseDzd')} onChange={() => setValue('htlDevise', 'DZD')} />
                <PillOption type="radio" checked={watch('htlDevise') === 'ETRANGERE'} label={t('htlDeviseEtrangere')} onChange={() => setValue('htlDevise', 'ETRANGERE')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">{t('htlAnnulationLabel')}</label>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                <PillOption type="radio" checked={watch('htlAnnulation') === 'FLEXIBLE'} label={t('htlAnnulationFlexible')} onChange={() => setValue('htlAnnulation', 'FLEXIBLE')} />
                <PillOption type="radio" checked={watch('htlAnnulation') === 'NON_REMBOURSABLE'} label={t('htlAnnulationNonRemb')} onChange={() => setValue('htlAnnulation', 'NON_REMBOURSABLE')} />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#0094BD]" /> {t('htlPaiementsLocauxLabel')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_PAIEMENTS_LOCAUX_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlPaiementsLocaux') || []).includes(opt.id)} label={optLabel('HTL_PAIEMENTS_LOCAUX_OPTIONS', opt)} onChange={() => toggleArrayValue('htlPaiementsLocaux', opt.id)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#0094BD]" /> {t('htlPaiementsIntlLabel')}</label>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  {HTL_PAIEMENTS_INTL_OPTIONS.map((opt) => (
                    <PillOption key={opt.id} checked={(watch('htlPaiementsIntl') || []).includes(opt.id)} label={optLabel('HTL_PAIEMENTS_INTL_OPTIONS', opt)} onChange={() => toggleArrayValue('htlPaiementsIntl', opt.id)} />
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
          placeholder={t('exVal', { v: '500' })}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        <span className="text-xs font-bold text-gray-400 shrink-0">{t('resLocTypologyTo')}</span>
        <input
          type="number" inputMode="numeric" {...register('maxSurface')}
          placeholder={t('exVal', { v: '2000' })}
          className="flex-1 min-w-[3.5rem] p-2 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0094BD] focus:border-[#0094BD] outline-none transition-all font-medium text-gray-900 text-base text-center"
        />
        <select
          {...register('surfaceUnit')}
          className="h-[42px] shrink-0 px-2 border-2 border-gray-300 rounded-xl bg-gray-100 font-bold text-xs text-gray-700 outline-none cursor-pointer"
        >
          <option value="M2">m²</option>
          <option value="HA">{t('optHectares')}</option>
        </select>
      </div>
    </div>
  );

  // --- Fiches Terrain : MÊME design et MÊME ordre que la fiche annonce Terrain du dépôt (retour client du
  // 08/11/2026) — « Caractéristiques Physiques » (champs + cartes), puis cartes encadrées par rubrique.
  // Agricole : Physiques (+ viabilisation) → Caractéristiques agricoles → Accessibilité → Bâtiments & clôture.
  // Industriel / Résidentiel : Physiques (+ statut de la zone) → Viabilisation (+ raccordements).
  // Touristique : Physiques (+ viabilisation) → Statut & Vocation touristique (ZET, PAT, classification). ---

  // Carte « Viabilisation » (Terrain viabilisé / Non viabilisé) ; raccordements à proximité si non
  // viabilisé, uniquement pour Terrain Industriel / Résidentiel comme au dépôt.
  const renderTerrainViabilisationCard = (withRaccordements: boolean) => depCard(tDep('f091'), (
    <>
      {renderCheckList([{ id: 'OUI', label: tDep('f092') }, { id: 'NON', label: tDep('f093') }], 'terViabilise', 'radio', 'flex gap-6 flex-wrap')}
      {withRaccordements && watch('terViabilise') === 'NON' && (
        <div className="mt-4">
          <div className="text-sm font-bold text-gray-700 mb-2">{tDep('f097')}</div>
          {renderCheckList(depItems('TERRAIN_RACCORDEMENTS', TERRAIN_RACCORDEMENTS), 'terRaccordements', 'checkbox', 'flex flex-wrap gap-x-6 gap-y-2')}
        </div>
      )}
    </>
  ));

  // Champ « Précisez » d'une option « Autre », dans sa carte.
  const renderAutreInCard = (field: 'terAgriCultureOther' | 'terTouVocationOther') => (
    <input type="text" {...register(field)} className="mt-3 w-full p-2 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#0094BD] text-sm font-medium" placeholder={t('autrePrecisezPlaceholder')} />
  );

  const renderTerrainAgricoleCriteria = () => (
    <>
      <Section title={tDep('f084')} icon={Ruler}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {renderTerSurfaceWithUnit()}
            {renderBoxedRange(t('terAltitudeLabel'), 'terAgriAltitudeMin', 'terAgriAltitudeMax', { unit: 'm', unitPosition: 'suffix', placeholderMin: t('exVal', { v: '100' }), placeholderMax: t('exVal', { v: '500' }) })}
            {renderBoxedRange(t('terFacadesLabel'), 'facadesMin', 'facadesMax', { placeholderMin: t('exVal', { v: '1' }), placeholderMax: t('exVal', { v: '2' }) })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderTerrainViabilisationCard(false)}
          </div>
        </div>
      </Section>

      <Section title={tDep('f098')} icon={Leaf}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {depCard(tDep('f099'), (
            <>
              {renderCheckList(resItems('TER_AGRI_CULTURE_OPTIONS', TER_AGRI_CULTURE_OPTIONS), 'terAgriCulture')}
              {(watch('terAgriCulture') || []).includes('AUTRE') && renderAutreInCard('terAgriCultureOther')}
            </>
          ))}
          {depCard(tDep('f100'), (
            <>
              {renderCheckList(depItems('TERRAIN_AGRICOLE_RESSOURCES_EAU', TERRAIN_AGRICOLE_RESSOURCES_EAU), 'terAgriRessourcesEau')}
              {(watch('terAgriRessourcesEau') || []).includes('FORAGE') && depNumberInput('terAgriDebitForageMin', tDep('f371'), tDep('f102'))}
            </>
          ))}
          {depCard(tDep('f108'), renderCheckList(depItems('TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE', TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE), 'terAgriEquipementHydro'))}
          {depCard(tDep('f109'), renderCheckList(resItems('TER_AGRI_ETAT_OPTIONS', TER_AGRI_ETAT_OPTIONS), 'terAgriEtat', 'checkbox', 'flex gap-6 flex-wrap'))}
        </div>
      </Section>

      <Section title={tDep('f112')} icon={Navigation}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {depCard(tDep('f113'), renderCheckList(depItems('TERRAIN_AGRICOLE_ACCES', TERRAIN_AGRICOLE_ACCES), 'terAgriAcces'))}
          {depCard(tDep('f114'), renderCheckList(depItems('TERRAIN_AGRICOLE_ACCES_LOURDS', TERRAIN_AGRICOLE_ACCES_LOURDS), 'terAgriAccesLourds'))}
        </div>
      </Section>

      <Section title={tDep('f115')} icon={Home}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {depCard(tDep('f116'), renderCheckList(depItems('TERRAIN_AGRICOLE_CONSTRUCTIONS', TERRAIN_AGRICOLE_CONSTRUCTIONS), 'terAgriConstructions'))}
          {depCard(tDep('f117'), renderCheckList(depItems('TERRAIN_AGRICOLE_CLOTURE', TERRAIN_AGRICOLE_CLOTURE), 'terAgriCloture'))}
        </div>
      </Section>

      {renderIndustrielBudgetDateRow()}
      {renderLocalisationSection({ hideDate: true })}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );

  // Terrain Industriel et Terrain Résidentiel : même fiche, seule la liste « Statut de la zone » change.
  const renderTerrainZoneCriteria = (kind: 'INDUSTRIEL' | 'RESIDENTIEL') => (
    <>
      <Section title={tDep('f084')} icon={Ruler}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {renderBoxedRange(t('terSurfaceLabel'), 'minSurface', 'maxSurface', { unit: 'm²', unitPosition: 'suffix', placeholderMin: t('exVal', { v: kind === 'INDUSTRIEL' ? '500' : '200' }), placeholderMax: t('exVal', { v: kind === 'INDUSTRIEL' ? '2000' : '600' }) })}
            {renderBoxedRange(t('terFacadesLabel'), 'facadesMin', 'facadesMax', { placeholderMin: t('exVal', { v: '1' }), placeholderMax: t('exVal', { v: '2' }) })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {kind === 'INDUSTRIEL'
              ? depCard(tDep('f094'), renderCheckList(resItems('TER_IND_ZONE_OPTIONS', TER_IND_ZONE_OPTIONS), 'terIndZone'))
              : depCard(tDep('f094'), renderCheckList(resItems('TER_RES_ZONE_OPTIONS', TER_RES_ZONE_OPTIONS), 'terResZone'))}
          </div>
        </div>
      </Section>

      <Section title={tDep('f091')} icon={FileText}>
        {renderTerrainViabilisationCard(true)}
      </Section>

      {renderIndustrielBudgetDateRow()}
      {renderLocalisationSection({ hideDate: true })}
      {renderSharedInterlocutorSection()}
      {renderCommentSection()}
    </>
  );
  const renderTerrainIndustrielCriteria = () => renderTerrainZoneCriteria('INDUSTRIEL');
  const renderTerrainResidentielCriteria = () => renderTerrainZoneCriteria('RESIDENTIEL');

  const renderTerrainTouristiqueCriteria = () => (
    <>
      <Section title={tDep('f084')} icon={Ruler}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {renderTerSurfaceWithUnit()}
            {renderBoxedRange(t('terFacadesLabel'), 'facadesMin', 'facadesMax', { placeholderMin: t('exVal', { v: '1' }), placeholderMax: t('exVal', { v: '2' }) })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderTerrainViabilisationCard(false)}
          </div>
        </div>
      </Section>

      <Section title={tDep('f118')} icon={Palmtree}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {depCard(tDep('f119'), (
              <>
                <div className="text-xs text-gray-500 mb-3">{tDep('f120')}</div>
                {renderCheckList([{ id: 'OUI', label: t('optYes') }, { id: 'NON', label: t('optNo') }], 'terTouZet', 'radio')}
              </>
            ))}
            {depCard(tDep('f121'), (
              <>
                <div className="text-xs text-gray-500 mb-3">{tDep('f122')}</div>
                {renderCheckList(depItems('TERRAIN_TOURISTIQUE_PAT', TERRAIN_TOURISTIQUE_PAT), 'terTouPat')}
              </>
            ))}
          </div>
          {depCard(tDep('f123'), (
            <>
              <div className="text-xs text-gray-500 mb-3">{tDep('f124')}</div>
              {renderCheckList(resItems('TER_TOU_VOCATION_OPTIONS', TER_TOU_VOCATION_OPTIONS), 'terTouVocation', 'checkbox', 'grid grid-cols-1 md:grid-cols-2 gap-2')}
              {(watch('terTouVocation') || []).includes('AUTRE') && renderAutreInCard('terTouVocationOther')}
            </>
          ))}
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
        // Fiches dédiées (Hangar/Usine/Chambre Froide) — couvrent Location ET Achat depuis cette
        // phase (l'ancien formulaire générique ci-dessous ne reste qu'en filet de sécurité tant
        // que `transaction` n'a pas encore été choisi).
        if (watch('transaction') === TransactionType.RENTAL || watch('transaction') === TransactionType.SALE) {
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
          case 'SHOWROOM': return renderShowroomCriteria();
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
            {cities.map((c) => <option key={c.id} value={c.id}>{c.code ? `${c.code} - ${place.city(c)}` : place.city(c)}</option>)}
          </select>
        </Field>

        <Field label={t('budgetDesiredDate')}>
          <input type="date" {...register('installationDate')} className={inputCls} />
        </Field>

        <Field label={t('budgetTowns')} full>
          <MultiSelectDropdown
            options={towns.map((tw) => ({ id: tw.id, label: place.town(tw) }))}
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
                <PillOption type="radio" key={opt.id} checked={watch('airportProximity') === opt.id} label={optLabel('AIRPORT_PROXIMITY_OPTIONS', opt)} onChange={() => setValue('airportProximity', opt.id)} />
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
                <PillOption type="radio" key={opt.id} checked={watch('financingMode') === opt.id} label={optLabel('FINANCING_OPTIONS', opt)} onChange={() => setValue('financingMode', opt.id as any)} />
              ))}
            </div>
          </Field>
        )}

        <Field label={t('searchTitleLabel')} full>
          <input type="text" {...register('title')} maxLength={120} className={inputCls} placeholder={t('searchTitlePlaceholder')} />
        </Field>

        <Field label={t('budgetComment')} full>
          <textarea {...register('comment')} rows={3} maxLength={5000} className={inputCls}></textarea>
          {errors.comment && <span className="text-red-500 text-sm">{errors.comment.message}</span>}
        </Field>
      </div>
    </Section>
  );

  // Options de la recherche (confier à Patrimoine Immobilier — obligatoire —, alerte mail) et, si
  // l'utilisateur n'est pas connecté, ses coordonnées. Affiché à la FIN de la dernière étape du
  // parcours, sur la même page que l'interlocuteur et le titre/message (retour client du 08/11/2026 :
  // plus d'étape séparée où la case obligatoire apparaissait déjà en erreur).
  // Connecté : plus de bloc « coordonnées » — le profil est repris en silence par l'effet plus haut
  // (nom, e-mail, téléphone, adresse) et il ne reste que les deux cases à cocher.
  const renderContactSection = () => {
    const showManualForm = !loggedInUser;
    return (
            <Section title={showManualForm ? t('contactTitle') : t('contactOptionsTitle')} icon={showManualForm ? MapPin : Handshake}>
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

              {/* Consentement obligatoire : rendu comme une case à part, clairement requise, pour
                  qu'elle demande une décision explicite avant l'envoi plutôt qu'un détail qu'on
                  peut manquer (retour client du 15/10/2026). */}
              <div className="space-y-3 mt-2">
                <label className={cn(
                  'flex items-start gap-2.5 text-sm font-bold p-3 rounded-xl border-2 transition-colors',
                  errors.isDelegate ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#0094BD]/30 bg-[#0094BD]/[0.04] text-gray-900'
                )}>
                  <input type="checkbox" {...register('isDelegate')} className="h-4 w-4 mt-0.5 accent-[#0094BD] shrink-0" />
                  <span>{t('contactIsDelegate')} <span className="text-red-500">*</span></span>
                </label>
                {errors.isDelegate && <p className="text-red-500 text-sm">{errors.isDelegate.message as any}</p>}
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <input type="checkbox" {...register('receiveAlert')} className="h-4 w-4 accent-[#0094BD]" />
                  {t('contactReceiveAlert')}
                </label>
              </div>
            </Section>
    );
  };

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
                  lockedBadge={isLockedCategory(b.id) ? t('standbyBadge') : undefined}
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

      case 'HS_TYPE':
        // Hébergement & Séjour (location ET vente) : structures d'accueil ; chaque fiche est « en cours de construction ».
        return (
          <div className="w-full max-w-5xl mx-auto animate-fade-in py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-4 justify-items-center">
              {HEBERGEMENT_SEJOUR_TYPES.map((ty) => (
                <CircleOption
                  key={ty.id}
                  active={hsType === ty.id}
                  icon={HS_ICONS[ty.id] || Hotel}
                  label={tpt.has(ty.id) ? tpt(ty.id) : ty.label}
                  size="sm"
                  color={getCategoryColor('HOTELIER')}
                  onClick={() => setHsType(ty.id)}
                />
              ))}
            </div>
            {hsType && (
              <div className="mt-10 mx-auto max-w-xl rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-6 text-center">
                                <div className="text-3xl mb-2" aria-hidden="true">🚧</div>
                                <p className="font-extrabold text-amber-800">{t('hsUnderConstructionTitle')}</p>
                                <p className="mt-1 text-sm text-amber-700">{t('hsUnderConstructionText')}</p>
                            </div>
            )}
          </div>
        );

      // Étapes « Type de recherche » : ronds au petit format (96 px), comme l'étape « type de bien »
      // du dépôt d'annonce (retour client du 08/11/2026 : « plus joli »).
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
                size="sm"
                onClick={() => { setValue('searchScope', 'GROUPEE'); nextStep(); }}
              />
              <CircleOption
                active={watch('searchScope') === 'IMMEUBLE'}
                icon={Building2}
                label={t('resSearchScopeImmeuble')}
                size="sm"
                onClick={() => { setValue('searchScope', 'IMMEUBLE'); nextStep(); }}
              />
            </div>
          </div>
        );

      case 'BUR_SEARCH_SCOPE':
        return (
          <div className="w-full max-w-5xl animate-fade-in py-6 md:py-10">
            {/* Même ordre que le dépôt d'annonce (08/11/2026), 3 par ligne : biens commerciaux,
                immeuble, bloc administratif / bloc commercial, local commercial, showroom / puis les
                3 types « Bientôt disponible » (LOCKED_PROPERTY_TYPES) en dernière ligne. */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6 justify-items-center">
              {([
                { id: 'GROUPEE', icon: Home, label: t('burScopeGroupeeCommercial') },
                { id: 'IMMEUBLE', icon: Building2, label: t('resSearchScopeImmeuble') },
                { id: 'BLOC_ADMINISTRATIF', icon: Briefcase, label: t('burScopeBlocAdmin') },
                { id: 'BLOC_COMMERCIAL', icon: Building2, label: t('burScopeBlocCommercial') },
                { id: 'LOCAL_COMMERCIAL', icon: Store, label: t('burScopeLocalCommercial') },
                { id: 'SHOWROOM', icon: Store, label: tpt.has('SHOWROOM') ? tpt('SHOWROOM') : 'Showroom' },
              ] as const).map((o) => (
                <CircleOption
                  key={o.id}
                  active={watch('bureauxSearchScope') === o.id}
                  icon={o.icon}
                  label={o.label}
                  size="sm"
                  onClick={() => { setValue('bureauxSearchScope', o.id); nextStep(); }}
                />
              ))}
              {([
                { id: 'CENTRE_AFFAIRES', icon: Building2, fr: "Centre d'affaires" },
                { id: 'COWORKING', icon: Users, fr: 'Espace Co-Travail' },
                { id: 'BUREAU_FLEXIBLE', icon: Briefcase, fr: 'Bureau flexible' },
              ] as const).filter((o) => isLockedPropertyType(o.id)).map((o) => (
                <CircleOption
                  key={o.id}
                  active={false}
                  icon={o.icon}
                  label={tpt.has(o.id) ? tpt(o.id) : o.fr}
                  size="sm"
                  lockedBadge={t('standbyBadge')}
                  onClick={() => {}}
                />
              ))}
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
                size="sm"
                onClick={() => { setValue('industrielSearchScope', 'HANGAR'); nextStep(); }}
              />
              <CircleOption
                active={watch('industrielSearchScope') === 'USINE'}
                icon={Factory}
                label={t('indScopeUsine')}
                size="sm"
                onClick={() => { setValue('industrielSearchScope', 'USINE'); nextStep(); }}
              />
              <CircleOption
                active={watch('industrielSearchScope') === 'CHAMBRE_FROIDE'}
                icon={Snowflake}
                label={t('indScopeChambreFroide')}
                size="sm"
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
                size="sm"
                onClick={() => { setValue('terrainSearchScope', 'AGRICOLE'); nextStep(); }}
              />
              <CircleOption
                active={watch('terrainSearchScope') === 'INDUSTRIEL'}
                icon={Factory}
                label={t('terScopeIndustriel')}
                size="sm"
                onClick={() => { setValue('terrainSearchScope', 'INDUSTRIEL'); nextStep(); }}
              />
              <CircleOption
                active={watch('terrainSearchScope') === 'RESIDENTIEL'}
                icon={Home}
                label={t('terScopeResidentiel')}
                size="sm"
                onClick={() => { setValue('terrainSearchScope', 'RESIDENTIEL'); nextStep(); }}
              />
              <CircleOption
                active={watch('terrainSearchScope') === 'TOURISTIQUE'}
                icon={Hotel}
                label={t('terScopeTouristique')}
                size="sm"
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
          <div className="w-full max-w-4xl animate-fade-in space-y-8">
            {isResidentielAchat && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('interlocutorSituation')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SITUATION_OPTIONS.map((opt) => (
                    <PillOption type="radio" key={opt.id} checked={watch('situation') === opt.id} label={optLabel('SITUATION_OPTIONS', opt)} onChange={() => setValue('situation', opt.id as any)} />
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
              {/* Les choix d'interlocuteur sur une seule ligne (retour client du 08/11/2026). */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                {options.map((opt) => (
                  <PillOption key={opt.id} checked={(watch('interlocutors') || []).includes(opt.id)} label={optLabel(optionsNs, opt)} onChange={() => toggleArrayValue('interlocutors', opt.id)} />
                ))}
              </div>
            </div>
            {/* Message explicatif — seulement pour la branche Résidentiel, qui a déplacé ce bloc ici
                (page 2) ; les autres branches (Industriel...) le gardent sur la page des critères. */}
            {branch === 'RESIDENTIEL' && renderCommentSection()}
          </div>
        );
      }

    }
  };

  // Étape affichée + bloc contact quand c'est la dernière étape d'un parcours qui s'envoie.
  const renderStepWithContact = () => {
    const content = renderStep();
    const isLast = currentStepIndex === steps.length - 1;
    if (!isLast || !['CRITERIA', 'BUDGET', 'INTERLOCUTOR'].includes(currentStep)) return content;
    return (
      <div className="w-full max-w-4xl space-y-10">
        {content}
        {renderContactSection()}
      </div>
    );
  };

  const isNextDisabled = currentStep === 'BRANCH' && !branch;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#022229] flex flex-col">
      <div className="h-[150px] md:h-[220px] w-full absolute top-0 left-0 z-0 overflow-hidden bg-[#003B4A]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04566B] via-[#003B4A] to-[#00181E]" />
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/[0.06] blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start md:justify-center relative z-10 p-4 pt-6 md:pt-4">

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
          <div className="p-4 md:p-8 border-b border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-500 hover:text-[#0094BD] transition-colors font-medium shrink-0"
              >
                <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                {t('back')}
              </button>
            )}
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">{STEP_LABELS[currentStep]}</h1>
            {/* Repère de contexte (catégorie / transaction) — en face du titre d'étape. */}
            {branch && (
              <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
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
          </div>

          <div className="p-6 md:p-10 flex-1 flex flex-col items-center justify-center text-left">
            {renderStepWithContact()}
          </div>

          {!AUTO_ADVANCE_STEPS.includes(currentStep) && (
            <div className="p-6 md:p-8 border-t border-gray-100 flex justify-end items-center bg-gray-50/50 rounded-b-2xl md:rounded-b-3xl">
              {currentStepIndex < steps.length - 1 ? (
                <button
                  key="next-step"
                  type="button"
                  onClick={nextStep}
                  disabled={isNextDisabled}
                  className="bg-[#0094BD] hover:bg-[#003B4A] text-white rounded-full px-8 py-3 md:py-4 text-base md:text-lg font-bold shadow-lg shadow-[#0094BD]/20 transition-all disabled:opacity-50"
                >
                  {t('continueBtn')}
                </button>
              ) : (
                <button
                  key="submit-research"
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
