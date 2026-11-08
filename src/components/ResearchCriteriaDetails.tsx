"use client"

import { useTranslations } from "next-intl"
import {
  Home, Ruler, Compass, Utensils, Trees, Zap, Building2, Briefcase, Store, Sparkles, Warehouse, Factory, Wrench,
  Snowflake, Thermometer, Users, MapPin, Truck, FileCheck, LayoutGrid, Siren, Shield, Droplet, Navigation, Leaf,
  Palmtree, FileText, Handshake, Check,
} from "lucide-react"
import * as RC from "@/data/researchConfig"
import * as IT from "@/data/industrialTerrainOptions"

/*
 * Détail des critères d'une recherche confiée (page /demandes/[id]) — demande client du 06/11/2026 :
 * « afficher les informations remplies dans le formulaire de confier votre recherche ».
 * Lit le JSON `amenities` tel qu'enregistré par research/page.tsx (onSubmit) et l'affiche par
 * sections, avec les MÊMES intitulés que le formulaire (namespaces Research / Deposit) et les mêmes
 * libellés d'options (ResearchOptions / DepositOptions, repli sur le libellé français des listes).
 * Toute valeur vide est ignorée ; une section sans valeur n'est pas affichée.
 * ⚠ Si un champ est ajouté au formulaire, l'ajouter aussi ici (même chemin que dans onSubmit).
 */

type Ns = "R" | "D" // R = namespace Research, D = namespace Deposit (sections clonées du dépôt)
type Lbl = [Ns, string]
type Field =
  | { k: "opts"; label: Lbl; path: string; group: string | string[] }
  | { k: "map"; label: Lbl; path: string; labels: Record<string, Lbl> }
  | { k: "range"; label: Lbl; min: string; max: string; unit?: string; prefix?: string }
  | { k: "num"; label: Lbl; path: string; unit?: string; prefix?: string }
  | { k: "bool"; label: Lbl; path: string }
  | { k: "yesno"; label: Lbl; path: string }
  | { k: "text"; label: Lbl; path: string }
type Section = { title: Lbl; icon: any; base: string; fields: Field[] }

// Libellés français de repli, à partir des listes d'options exportées (y compris les listes imbriquées
// par branche, ex. RESEARCH_PROPERTY_TYPES.RESIDENTIEL).
const FALLBACK: Record<string, Record<string, string>> = {}
for (const mod of [RC, IT] as Record<string, any>[]) {
  for (const [name, value] of Object.entries(mod)) {
    const add = (key: string, arr: any[]) => {
      if (!arr.every((o) => o && typeof o.id === "string")) return
      FALLBACK[key] ||= {}
      arr.forEach((o) => { FALLBACK[key][o.id] ||= o.label || o.id })
    }
    if (Array.isArray(value)) add(name, value)
    else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => Array.isArray(v) && add(`${name}.${k}`, v))
  }
}

// --- Blocs communs -----------------------------------------------------------------------------
const environmentField = (base: string): Field => ({ k: "opts", label: ["R", "resLocEnvironment"], path: `${base}.environment`, group: "ENVIRONMENT_OPTIONS" })

const COUNTER: Record<string, Lbl> = { INDIVIDUEL: ["R", "resCounterIndividuel"], COMMUN: ["R", "resCounterCommun"] }
const equipmentSections = (base: string): Section[] => [
  { title: ["R", "resKitchenTitle"], icon: Utensils, base: `${base}.equipments`, fields: [
    { k: "opts", label: ["R", "resKitchenTypeLabel"], path: "kitchen.type", group: "RES_KITCHEN_TYPES" },
    { k: "opts", label: ["R", "resKitchenEquipmentLabel"], path: "kitchen.equipment", group: "RES_KITCHEN_EQUIPMENT_OPTIONS" },
  ] },
  { title: ["R", "resExteriorCommoditiesTitle"], icon: Trees, base: `${base}.equipments`, fields: [
    { k: "opts", label: ["R", "resExteriorLabel"], path: "exterior", group: "RES_EXTERIOR_OPTIONS" },
    { k: "opts", label: ["R", "resHeatingLabel"], path: "heating", group: "RES_HEATING_OPTIONS" },
    { k: "opts", label: ["R", "resAcLabel"], path: "ac", group: "RES_AC_OPTIONS" },
    { k: "opts", label: ["R", "resSecurityLabel"], path: "security", group: "RES_SECURITY_OPTIONS" },
    { k: "opts", label: ["R", "resConnectivityLabel"], path: "connectivity", group: "RES_CONNECTIVITY_OPTIONS" },
  ] },
  { title: ["R", "resEnergyTitle"], icon: Zap, base: `${base}.equipments`, fields: [
    { k: "map", label: ["R", "resWaterLabel"], path: "energy.water", labels: COUNTER },
    { k: "map", label: ["R", "resElecLabel"], path: "energy.elec", labels: COUNTER },
    { k: "map", label: ["R", "resGasLabel"], path: "energy.gas", labels: COUNTER },
  ] },
]

// Fiche Résidentiel « groupée » (Location / Achat), reprise telle quelle par Bureaux « groupée ».
const residentialSections = (base: string): Section[] => [
  { title: ["R", "resLocTypeSectionTitle"], icon: Home, base, fields: [
    { k: "opts", label: ["R", "resLocPropertyTypeSought"], path: "propertyTypes", group: "PROPERTY_TYPE" },
    { k: "opts", label: ["R", "resLocVillaEntrance"], path: "villaLevelEntrance", group: "VILLA_LEVEL_ENTRANCE_OPTIONS" },
  ] },
  { title: ["R", "resLocTypologyTitle"], icon: Ruler, base, fields: [
    { k: "range", label: ["R", "resLocTypologyRange"], min: "typologyMin", max: "typologyMax", prefix: "F" },
    { k: "range", label: ["R", "resLocSurfaceMax"], min: "minSurface", max: "maxSurface", unit: "m²" },
    { k: "range", label: ["R", "resLocFloorMax"], min: "floorMin", max: "floorMax" },
  ] },
  { title: ["R", "resLocEnvironmentTitle"], icon: Compass, base, fields: [
    environmentField(""),
    { k: "opts", label: ["R", "sqRealisationStage"], path: "realisationStage", group: "REALISATION_STAGE_OPTIONS" },
  ] },
  ...equipmentSections(base),
]

const immeubleSections = (base: string): Section[] => [
  { title: ["R", "immeubleTypeSectionTitle"], icon: Building2, base, fields: [
    { k: "map", label: ["R", "immeubleTypeSectionTitle"], path: "typeChoices", labels: { SIMILAIRES: ["R", "immeubleTypeSimilaires"], DIFFERENTES: ["R", "immeubleTypeDifferentes"] } },
    { k: "range", label: ["R", "resLocFloorMax"], min: "floorsMin", max: "floorsMax" },
  ] },
  { title: ["R", "immeubleCaracSimilairesTitle"], icon: Ruler, base: `${base}.similaire`, fields: [
    { k: "num", label: ["R", "resLocTypologyRange"], path: "typology", prefix: "F" },
    { k: "range", label: ["R", "resLocSurfaceMax"], min: "surfaceMin", max: "surfaceMax", unit: "m²" },
  ] },
  { title: ["R", "immeubleCaracDifferentesTitle"], icon: Ruler, base: `${base}.differente`, fields: [
    { k: "range", label: ["R", "resLocTypologyRange"], min: "typologyMin", max: "typologyMax", prefix: "F" },
    { k: "range", label: ["R", "resLocSurfaceMax"], min: "surfaceMin", max: "surfaceMax", unit: "m²" },
  ] },
  { title: ["R", "resLocEnvironmentTitle"], icon: Compass, base, fields: [
    environmentField(""),
    { k: "opts", label: ["R", "sqRealisationStage"], path: "realisationStage", group: "REALISATION_STAGE_OPTIONS" },
  ] },
  ...equipmentSections(base),
]

// Bureaux & Commerces — fiches spécifiques (cadre de vie + équipements depuis le 25/10/2026).
const bureauxSpecificSections = (base: string, own: Section[]): Section[] => [
  ...own,
  { title: ["R", "resLocEnvironmentTitle"], icon: Compass, base, fields: [environmentField("")] },
  ...equipmentSections(base),
]

// Industriel — blocs clonés de la fiche annonce (intitulés du namespace Deposit).
const industrialAnnexes = (base: string): Section => ({ title: ["D", "f016"], icon: LayoutGrid, base: `${base}.annexes`, fields: [
  { k: "yesno", label: ["D", "f017"], path: "offices" },
  { k: "num", label: ["D", "f020"], path: "officesAreaMin", unit: "m²" },
  { k: "opts", label: ["D", "f021"], path: "socialLocales", group: "INDUSTRIAL_SOCIAL_LOCALES" },
  { k: "opts", label: ["D", "f022"], path: "hebergement", group: "INDUSTRIAL_HEBERGEMENT" },
  { k: "opts", label: ["D", "f023"], path: "security", group: "INDUSTRIAL_SECURITY" },
] })
const industrialEnergyFire = (base: string): Section[] => [
  { title: ["D", "f024"], icon: Zap, base: `${base}.energy`, fields: [
    { k: "num", label: ["D", "f026"], path: "kvaMin", unit: "KVA" },
    { k: "bool", label: ["D", "f027"], path: "forceMotrice" },
    { k: "map", label: ["D", "f028"], path: "gas", labels: { INDUSTRIEL: ["D", "f029"], VILLE: ["D", "f030"], AUCUN: ["D", "f031"] } },
    { k: "opts", label: ["D", "f032"], path: "waterSources", group: "INDUSTRIAL_WATER_SOURCES" },
    { k: "map", label: ["D", "f033"], path: "sanitation", labels: { RESEAU_PUBLIC: ["D", "f034"], FOSSE_INDUSTRIELLE: ["D", "f035"] } },
  ] },
  { title: ["D", "f036"], icon: Siren, base: `${base}.fire`, fields: [
    { k: "opts", label: ["D", "f037"], path: "network", group: "INDUSTRIAL_FIRE_NETWORK" },
    { k: "opts", label: ["D", "f038"], path: "equipment", group: "INDUSTRIAL_FIRE_EQUIPMENT" },
    { k: "num", label: ["D", "f172"], path: "waterReserveMin", unit: "L" },
  ] },
]
const industrialCommon = (base: string): Section[] => [
  { title: ["R", "indEmplacementTitle"], icon: Compass, base, fields: [
    { k: "opts", label: ["R", "indEmplacementTitle"], path: "zone", group: "INDUSTRIAL_ZONE_OPTIONS" },
    { k: "opts", label: ["R", "indAccessTransportTitle"], path: "accesTransport", group: "INDUSTRIAL_ACCESS_TRANSPORT" },
  ] },
  industrialAnnexes(base),
  ...industrialEnergyFire(base),
]
const legalDocs: Section = { title: ["R", "indLegalDocumentsTitle"], icon: FileCheck, base: "industriel", fields: [
  { k: "opts", label: ["R", "indLegalDocumentsTitle"], path: "legalDocuments", group: "LEGAL_DOCUMENTS_SALE" },
] }

const terrainBase: Section = { title: ["R", "terSurfaceDimensionTitle"], icon: Ruler, base: "terrain", fields: [
  { k: "range", label: ["R", "terFacadesLabel"], min: "facadesMin", max: "facadesMax" },
  { k: "yesno", label: ["D", "f091"], path: "viabilise" },
] }

function sectionsFor(a: any): Section[] {
  if (a?.residentiel) {
    const r = a.residentiel
    if (r.immeuble) return immeubleSections("residentiel.immeuble")
    if (r.location) return residentialSections("residentiel.location")
    if (r.achatHabitation) return residentialSections("residentiel.achatHabitation")
  }
  if (a?.bureaux) {
    const b = a.bureaux
    if (b.groupee) return residentialSections("bureaux.groupee")
    if (b.immeuble) return immeubleSections("bureaux.immeuble")
    if (b.blocAdministratif) return bureauxSpecificSections("bureaux.blocAdministratif", [
      { title: ["R", "burBlocAdminSectionTitle"], icon: Briefcase, base: "bureaux.blocAdministratif", fields: [
        { k: "range", label: ["R", "burSurfaceRange"], min: "minSurface", max: "maxSurface", unit: "m²" },
        { k: "range", label: ["R", "immeubleFloorsRange"], min: "floorMin", max: "floorMax" },
        { k: "opts", label: ["R", "burSpaceTypeLabel"], path: "spaceTypes", group: "OFFICE_SPACE_TYPE_OPTIONS" },
        { k: "opts", label: ["R", "burEnergyLabel"], path: "energie", group: "OFFICE_ENERGY_OPTIONS" },
      ] },
    ])
    if (b.blocCommercial) return bureauxSpecificSections("bureaux.blocCommercial", [
      { title: ["R", "burBlocCommSectionTitle"], icon: Building2, base: "bureaux.blocCommercial", fields: [
        { k: "range", label: ["R", "burSurfaceRange"], min: "minSurface", max: "maxSurface", unit: "m²" },
        { k: "opts", label: ["R", "burEtatGeneralTitle"], path: "etatGeneral", group: "GENERAL_STATE_OPTIONS" },
        { k: "opts", label: ["R", "burZoneTypeTitle"], path: "zoneType", group: "ZONE_TYPE_OPTIONS" },
        { k: "opts", label: ["R", "burVisibiliteTitle"], path: "visibilite", group: "VISIBILITY_OPTIONS" },
      ] },
    ])
    if (b.showroom) return bureauxSpecificSections("bureaux.showroom", [
      { title: ["D", "f137"], icon: Ruler, base: "bureaux.showroom", fields: [
        { k: "range", label: ["D", "f040"], min: "surfaceTerrainMin", max: "surfaceTerrainMax", unit: "m²" },
        { k: "range", label: ["D", "f138"], min: "surfaceBatieMin", max: "surfaceBatieMax", unit: "m²" },
        { k: "range", label: ["D", "f139"], min: "niveauxMin", max: "niveauxMax" },
      ] },
      { title: ["D", "f140"], icon: Sparkles, base: "bureaux.showroom", fields: [
        { k: "opts", label: ["D", "f141"], path: "style", group: "SHOWROOM_STYLE" },
        { k: "opts", label: ["D", "f142"], path: "structure", group: "SHOWROOM_STRUCTURE" },
        { k: "text", label: ["R", "autrePrecisezLabel"], path: "structureOther" },
      ] },
      { title: ["D", "f143"], icon: Store, base: "bureaux.showroom", fields: [
        { k: "yesno", label: ["D", "f144"], path: "visibiliteAutoroute" },
      ] },
    ])
    if (b.localCommercial) return bureauxSpecificSections("bureaux.localCommercial", [
      { title: ["R", "burLocalCommSectionTitle"], icon: Store, base: "bureaux.localCommercial", fields: [
        { k: "range", label: ["R", "burSurfaceRange"], min: "minSurface", max: "maxSurface", unit: "m²" },
        { k: "range", label: ["R", "immeubleFloorsRange"], min: "floorMin", max: "floorMax" },
        { k: "opts", label: ["R", "burStyleEtatTitle"], path: "styleEtat", group: "LOCAL_STYLE_ETAT_OPTIONS" },
        { k: "opts", label: ["R", "burLocalEnvironmentLabel"], path: "environnement", group: "LOCAL_ENVIRONMENT_OPTIONS" },
        { k: "text", label: ["R", "autrePrecisezLabel"], path: "environnementOther" },
        { k: "opts", label: ["R", "burLocalUsageLabel"], path: "usage", group: "LOCAL_USAGE_OPTIONS" },
        { k: "text", label: ["R", "autrePrecisezLabel"], path: "usageOther" },
      ] },
    ])
  }
  if (a?.industriel) {
    const i = a.industriel
    if (i.hangar) return [
      { title: ["R", "hgUsageTitle"], icon: Warehouse, base: "industriel.hangar", fields: [
        { k: "opts", label: ["R", "hgUsageTitle"], path: "usageType", group: "HANGAR_USAGE_OPTIONS" },
        { k: "range", label: ["R", "hgSurfaceTerrainLabel"], min: "surfaceTerrainMin", max: "surfaceTerrainMax", unit: "m²" },
        { k: "range", label: ["R", "hgSurfaceCouverteLabel"], min: "surfaceCouverteMin", max: "surfaceCouverteMax", unit: "m²" },
        { k: "range", label: ["R", "hgHauteurLabel"], min: "hauteurMin", max: "hauteurMax", unit: "m" },
      ] },
      ...industrialCommon("industriel.hangar"),
      legalDocs,
    ]
    if (i.usine) return [
      { title: ["R", "usNatureTitle"], icon: Factory, base: "industriel.usine", fields: [
        { k: "opts", label: ["R", "usNatureTitle"], path: "nature", group: "USINE_ACTIVITY_OPTIONS" },
        { k: "text", label: ["R", "usNatureOtherLabel"], path: "natureOther" },
        { k: "opts", label: ["R", "usEquipmentTitle"], path: "equipement", group: "USINE_EQUIPMENT_OPTIONS" },
        { k: "range", label: ["R", "usSurfaceTerrainLabel"], min: "surfaceTerrainMin", max: "surfaceTerrainMax", unit: "m²" },
        { k: "range", label: ["R", "usSurfaceBatieLabel"], min: "surfaceBatieMin", max: "surfaceBatieMax", unit: "m²" },
      ] },
      ...industrialCommon("industriel.usine"),
      legalDocs,
    ]
    if (i.chambreFroide) return [
      { title: ["R", "cfActiviteTitle"], icon: Snowflake, base: "industriel.chambreFroide", fields: [
        { k: "opts", label: ["R", "cfActiviteTitle"], path: "activite", group: "CF_ACTIVITY_OPTIONS" },
        { k: "text", label: ["R", "cfActiviteOtherLabel"], path: "activiteOther" },
        { k: "range", label: ["R", "cfCapaciteLabel"], min: "capaciteMin", max: "capaciteMax", unit: "m³" },
        { k: "opts", label: ["R", "cfTypeFroidTitle"], path: "typeFroid", group: "CF_TYPE_FROID_OPTIONS" },
        { k: "opts", label: ["R", "cfModeGestionTitle"], path: "modeGestion", group: "CF_MODE_GESTION_OPTIONS" },
        { k: "opts", label: ["R", "cfStructureTitle"], path: "structureType", group: "CF_STRUCTURE_TYPES" },
      ] },
      { title: ["D", "f064"], icon: MapPin, base: "industriel.chambreFroide.configuration", fields: [
        { k: "opts", label: ["D", "f065"], path: "localisation", group: "INDUSTRIAL_SITUATIONS" },
        { k: "map", label: ["D", "f067"], path: "configuration", labels: { PLAIN_PIED: ["D", "f068"], ETAGES: ["D", "f069"] } },
        { k: "num", label: ["D", "f139"], path: "floorsMin" },
        { k: "map", label: ["D", "f070"], path: "logistiqueVerticale", labels: { MONTE_CHARGE: ["D", "f071"], AUCUN: ["D", "f031"] } },
        { k: "num", label: ["D", "f363"], path: "monteChargeCapacityMin", unit: "kg" },
        { k: "opts", label: ["D", "f072"], path: "accessibilite", group: "INDUSTRIAL_ACCESS_TRANSPORT" },
        { k: "opts", label: ["D", "f073"], path: "zoneDechargement", group: "CF_ZONE_DECHARGEMENT" },
      ] },
      industrialAnnexes("industriel.chambreFroide"),
      { title: ["D", "f074"], icon: Shield, base: "industriel.chambreFroide.equipment", fields: [
        { k: "bool", label: ["D", "f076"], path: "generateur" },
        { k: "num", label: ["D", "f364"], path: "generateurKvaMin", unit: "KVA" },
        { k: "opts", label: ["D", "f077"], path: "techniqueFroid", group: "CF_TECHNIQUE_FROID" },
        { k: "opts", label: ["D", "f079"], path: "modeDiffusion", group: "CF_MODE_DIFFUSION" },
      ] },
      legalDocs,
    ]
  }
  if (a?.terrain) {
    const t = a.terrain
    if (t.agricole) return [
      terrainBase,
      { title: ["R", "terAgriCultureTitle"], icon: Trees, base: "terrain.agricole", fields: [
        { k: "range", label: ["R", "terAltitudeLabel"], min: "altitudeMin", max: "altitudeMax", unit: "m" },
        { k: "opts", label: ["R", "terAgriCultureTitle"], path: "culture", group: "TER_AGRI_CULTURE_OPTIONS" },
        { k: "text", label: ["R", "autrePrecisezLabel"], path: "cultureOther" },
        { k: "opts", label: ["R", "terAgriEtatTitle"], path: "etat", group: "TER_AGRI_ETAT_OPTIONS" },
      ] },
      { title: ["D", "f100"], icon: Droplet, base: "terrain.agricole", fields: [
        { k: "opts", label: ["D", "f100"], path: "ressourcesEau", group: "TERRAIN_AGRICOLE_RESSOURCES_EAU" },
        { k: "num", label: ["D", "f102"], path: "debitForageMin", unit: "m³/h" },
        { k: "opts", label: ["D", "f108"], path: "equipementHydro", group: "TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE" },
      ] },
      { title: ["D", "f112"], icon: Navigation, base: "terrain.agricole", fields: [
        { k: "opts", label: ["D", "f113"], path: "acces", group: "TERRAIN_AGRICOLE_ACCES" },
        { k: "opts", label: ["D", "f114"], path: "accesLourds", group: "TERRAIN_AGRICOLE_ACCES_LOURDS" },
      ] },
      { title: ["D", "f115"], icon: Leaf, base: "terrain.agricole", fields: [
        { k: "opts", label: ["D", "f116"], path: "constructions", group: "TERRAIN_AGRICOLE_CONSTRUCTIONS" },
        { k: "opts", label: ["D", "f117"], path: "cloture", group: "TERRAIN_AGRICOLE_CLOTURE" },
      ] },
    ]
    if (t.industriel || t.residentiel) {
      const base = t.industriel ? "terrain.industriel" : "terrain.residentiel"
      return [
        terrainBase,
        { title: [ "R", t.industriel ? "terIndZoneTitle" : "terResZoneTitle"], icon: Compass, base, fields: [
          { k: "opts", label: ["R", t.industriel ? "terIndZoneTitle" : "terResZoneTitle"], path: "zone", group: t.industriel ? "TER_IND_ZONE_OPTIONS" : "TER_RES_ZONE_OPTIONS" },
          { k: "opts", label: ["D", "f097"], path: "raccordements", group: "TERRAIN_RACCORDEMENTS" },
        ] },
      ]
    }
    if (t.touristique) return [
      terrainBase,
      { title: ["R", "terTouVocationTitle"], icon: Palmtree, base: "terrain.touristique", fields: [
        { k: "yesno", label: ["R", "terTouZetTitle"], path: "zet" },
        { k: "opts", label: ["R", "terTouVocationTitle"], path: "vocation", group: "TER_TOU_VOCATION_OPTIONS" },
        { k: "text", label: ["R", "autrePrecisezLabel"], path: "vocationOther" },
        { k: "opts", label: ["D", "f121"], path: "pat", group: "TERRAIN_TOURISTIQUE_PAT" },
      ] },
    ]
  }
  return []
}

const get = (obj: any, path: string) => path.split(".").filter(Boolean).reduce((o, k) => (o == null ? undefined : o[k]), obj)
const present = (v: any) => v !== undefined && v !== null && v !== "" && v !== 0 && !(Array.isArray(v) && v.length === 0)
const fmtNum = (n: any) => new Intl.NumberFormat("fr-DZ").format(Number(n))

export function ResearchCriteriaDetails({ research }: { research: any }) {
  const tR = useTranslations("Research")
  const tD = useTranslations("Deposit")
  const tOpt = useTranslations("ResearchOptions")
  const tDepOpt = useTranslations("DepositOptions")
  const tPt = useTranslations("PropertyTypes")

  let amenities: any = {}
  try { amenities = research?.amenities ? JSON.parse(research.amenities) : {} } catch { amenities = {} }

  const L = ([ns, key]: Lbl) => {
    const tr = ns === "R" ? tR : tD
    return tr.has(key) ? tr(key) : key
  }
  const option = (group: string | string[], id: string): string => {
    const groups = Array.isArray(group) ? group : [group]
    for (const g of groups) {
      if (g === "PROPERTY_TYPE") {
        if (tPt.has(id)) return tPt(id)
        const branch = Object.keys(RC.RESEARCH_PROPERTY_TYPES).find((b) => tOpt.has(`RESEARCH_PROPERTY_TYPES.${b}.${id}`))
        if (branch) return tOpt(`RESEARCH_PROPERTY_TYPES.${branch}.${id}`)
        const fr = Object.keys(FALLBACK).filter((k) => k.startsWith("RESEARCH_PROPERTY_TYPES.")).map((k) => FALLBACK[k][id]).find(Boolean)
        if (fr) return fr
        continue
      }
      if (tOpt.has(`${g}.${id}`)) return tOpt(`${g}.${id}`)
      if (tDepOpt.has(`${g}.${id}.label`)) return tDepOpt(`${g}.${id}.label`)
      if (tDepOpt.has(`${g}.${id}`)) return tDepOpt(`${g}.${id}`)
      if (FALLBACK[g]?.[id]) return FALLBACK[g][id]
    }
    return id
  }

  // Valeur affichable d'un champ : liste de puces, ou texte simple ; null si rien à montrer.
  const render = (base: string, f: Field): { chips?: string[]; text?: string } | null => {
    const at = (p: string) => get(amenities, [base, p].filter(Boolean).join("."))
    switch (f.k) {
      case "opts": {
        const v = at(f.path)
        if (!present(v)) return null
        return { chips: (Array.isArray(v) ? v : [v]).map((id: string) => option(f.group, id)) }
      }
      case "map": {
        const v = at(f.path)
        if (!present(v)) return null
        return { chips: (Array.isArray(v) ? v : [v]).map((id: string) => (f.labels[id] ? L(f.labels[id]) : id)) }
      }
      case "range": {
        const min = at(f.min), max = at(f.max)
        if (!present(min) && !present(max)) return null
        const v = (n: any) => `${f.prefix || ""}${fmtNum(n)}`
        const unit = f.unit ? ` ${f.unit}` : ""
        if (present(min) && present(max)) return { text: Number(min) === Number(max) ? `${v(min)}${unit}` : `${v(min)} – ${v(max)}${unit}` }
        return { text: present(min) ? `≥ ${v(min)}${unit}` : `≤ ${v(max)}${unit}` }
      }
      case "num": {
        const v = at(f.path)
        return present(v) ? { text: `${f.prefix || ""}${fmtNum(v)}${f.unit ? ` ${f.unit}` : ""}` } : null
      }
      case "bool":
        return at(f.path) === true ? { text: tR("optYes") } : null
      case "yesno": {
        const v = at(f.path)
        return v === "OUI" ? { text: tR("optYes") } : v === "NON" ? { text: tR("optNo") } : null
      }
      case "text": {
        const v = at(f.path)
        return present(v) ? { text: String(v) } : null
      }
    }
  }

  const sections = sectionsFor(amenities)
    .map((s) => ({ ...s, rows: s.fields.map((f) => ({ label: L(f.label), value: render(s.base, f) })).filter((r) => r.value) }))
    .filter((s) => s.rows.length > 0)

  const interlocutors: string[] = amenities?.interlocutors || []

  if (sections.length === 0 && interlocutors.length === 0) return null

  return (
    <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-6 space-y-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 dark:text-white">
        <FileText className="h-5 w-5 text-[#00BFA6]" /> {tR("detailCriteriaTitle")}
      </h2>
      {sections.map((s, i) => {
        const Icon = s.icon
        return (
          <section key={i} className="space-y-3">
            <h3 className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-2 text-sm font-bold text-gray-900 dark:text-white">
              <Icon className="h-4 w-4 text-[#00BFA6]" /> {L(s.title)}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {s.rows.map((row, j) => (
                <div key={j} className={row.value?.chips && row.value.chips.length > 2 ? "sm:col-span-2" : ""}>
                  <dt className="text-xs font-semibold text-gray-500 dark:text-white/50">{row.label}</dt>
                  <dd className="mt-1">
                    {row.value?.chips ? (
                      <div className="flex flex-wrap gap-1.5">
                        {row.value.chips.map((c, k) => (
                          <span key={k} className="inline-flex items-center gap-1 rounded-full bg-[#00BFA6]/10 px-2.5 py-1 text-xs font-bold text-[#00908A] dark:text-[#5EEAD4]">
                            <Check className="h-3 w-3" /> {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{row.value?.text}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
      {interlocutors.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-2 text-sm font-bold text-gray-900 dark:text-white">
            <Handshake className="h-4 w-4 text-[#00BFA6]" /> {tR("stepInterlocutor")}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {interlocutors.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-[#00BFA6]/10 px-2.5 py-1 text-xs font-bold text-[#00908A] dark:text-[#5EEAD4]">
                <Check className="h-3 w-3" /> {option(["RESEARCH_INTERLOCUTORS.RESIDENTIEL", "INDUSTRIEL_LOCATION_INTERLOCUTOR_OPTIONS", "ACHAT_INTERLOCUTOR_OPTIONS"], id)}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
