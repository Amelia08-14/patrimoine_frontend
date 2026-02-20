"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, Search, MapPin, Building2, Home, Hotel, Tent, Factory, BedDouble, 
  Check, X, LayoutGrid, DollarSign, Ruler, ArrowUpDown, 
  Briefcase, Users, Store, LayoutTemplate, Layers, Copy, Maximize,
  Palmtree, Warehouse, Container, LandPlot, ConciergeBell, PartyPopper, Presentation
} from "lucide-react"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { REAL_ESTATE_CATEGORIES, PROPERTY_TYPES } from "@/data/propertyTypes"

// Icon mapping helper
const getIcon = (name: string) => {
  const icons: any = {
    BedDouble, Building2, Hotel, Tent, Factory, Home,
    Briefcase, Users, Store, LayoutTemplate, Layers, Copy, Maximize,
    Palmtree, Warehouse, Container, LandPlot, ConciergeBell, PartyPopper, Presentation,
    Building: Building2 // Fallback or alias
  }
  return icons[name] || Home
}

interface FilterState {
  sortBy: string
  transactionType: string
  realEstateCategory: string
  propertyType: string
  wilaya: string
  commune: string
  minPrice: string
  maxPrice: string
  minArea: string
  maxArea: string
  nbPieces: string
}

interface AnnounceFilterProps {
  filters: FilterState
  onFilterChange: (key: string, value: any) => void
  onSearch: () => void
}

export function AnnounceFilter({ filters, onFilterChange, onSearch }: AnnounceFilterProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDropdown = (key: string) => {
    if (openDropdown === key) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(key)
      setSearchTerm("") // Reset search when opening new dropdown
    }
  }

  // Derived data
  const filteredPropertyTypes = filters.realEstateCategory 
    ? PROPERTY_TYPES.filter(t => t.categoryId === filters.realEstateCategory)
    : []
  
  const filteredCommunes = filters.wilaya
    ? COMMUNES.filter(c => c.wilayaCode === filters.wilaya)
    : []

  // Filter lists based on search term
  const displayedWilayas = searchTerm 
    ? WILAYAS.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.code.includes(searchTerm))
    : WILAYAS

  const displayedCommunes = searchTerm
    ? filteredCommunes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredCommunes

  const selectedWilayaName = filters.wilaya ? WILAYAS.find(w => w.code === filters.wilaya)?.name : ""
  const selectedCommuneName = filters.commune ? filteredCommunes.find(c => c.id === filters.commune)?.name : ""
  const selectedCategoryLabel = filters.realEstateCategory ? REAL_ESTATE_CATEGORIES.find(c => c.id === filters.realEstateCategory)?.label : "Tout"
  const selectedPropertyTypeLabel = filters.propertyType ? PROPERTY_TYPES.find(t => t.id === filters.propertyType)?.label : "Tout"

  return (
    <div className="w-full" ref={dropdownRef}>
      <div className="bg-white rounded-xl shadow-lg p-3 flex flex-col xl:flex-row items-center gap-3">
          <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              
              {/* 1. Tri par */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('sortBy')}
                  className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'sortBy' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tri par</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'sortBy' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="font-bold text-sm text-gray-700 truncate">
                        {filters.sortBy === 'LAST_MODIFIED_DATE_DESC' && 'Plus récents'}
                        {filters.sortBy === 'PRICE_ASC' && 'Prix croissant'}
                        {filters.sortBy === 'PRICE_DESC' && 'Prix décroissant'}
                    </div>
                </div>
                
                {openDropdown === 'sortBy' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                        {[
                            { value: 'LAST_MODIFIED_DATE_DESC', label: 'Plus récents' },
                            { value: 'PRICE_ASC', label: 'Prix croissant' },
                            { value: 'PRICE_DESC', label: 'Prix décroissant' }
                        ].map((option) => (
                            <div 
                                key={option.value}
                                onClick={() => {
                                    onFilterChange('sortBy', option.value)
                                    setOpenDropdown(null)
                                }}
                                className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between ${filters.sortBy === option.value ? 'text-[#00BFA6] font-bold bg-teal-50' : 'text-gray-700'}`}
                            >
                                {option.label}
                                {filters.sortBy === option.value && <Check className="h-4 w-4" />}
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* 2. Transaction */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('transactionType')}
                  className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'transactionType' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Transaction</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'transactionType' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="font-bold text-sm text-gray-700 truncate">
                        {filters.transactionType === 'RENTAL' && 'Location'}
                        {filters.transactionType === 'SALE' && 'Vente'}
                        {filters.transactionType === 'HOLIDAY_RENTAL' && 'Vacances'}
                    </div>
                </div>

                {openDropdown === 'transactionType' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                         {[
                            { value: 'RENTAL', label: 'Location' },
                            { value: 'SALE', label: 'Vente' },
                            { value: 'HOLIDAY_RENTAL', label: 'Vacances' }
                        ].map((option) => (
                            <div 
                                key={option.value}
                                onClick={() => {
                                    onFilterChange('transactionType', option.value)
                                    setOpenDropdown(null)
                                }}
                                className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between ${filters.transactionType === option.value ? 'text-[#00BFA6] font-bold bg-teal-50' : 'text-gray-700'}`}
                            >
                                {option.label}
                                {filters.transactionType === option.value && <Check className="h-4 w-4" />}
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* 3. Immobilier (Category) */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('realEstateCategory')}
                  className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'realEstateCategory' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Immobilier</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'realEstateCategory' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="font-bold text-sm text-gray-700 truncate">
                        {selectedCategoryLabel}
                    </div>
                </div>

                {openDropdown === 'realEstateCategory' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden p-2 grid grid-cols-2 gap-2">
                        <div 
                            onClick={() => {
                                onFilterChange('realEstateCategory', '')
                                onFilterChange('propertyType', '') // Reset sub-filter
                                setOpenDropdown(null)
                            }}
                            className={`p-2 rounded-lg text-sm hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center gap-2 border ${!filters.realEstateCategory ? 'border-[#00BFA6] bg-teal-50 text-[#00BFA6]' : 'border-gray-100 text-gray-600'}`}
                        >
                            <LayoutGrid className="h-5 w-5" />
                            <span className="font-medium text-center">Tout</span>
                        </div>
                        {REAL_ESTATE_CATEGORIES.map((cat) => {
                            const Icon = getIcon(cat.iconName)
                            return (
                                <div 
                                    key={cat.id}
                                    onClick={() => {
                                        onFilterChange('realEstateCategory', cat.id)
                                        onFilterChange('propertyType', '') // Reset sub-filter
                                        setOpenDropdown(null)
                                    }}
                                    className={`p-2 rounded-lg text-sm hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center gap-2 border ${filters.realEstateCategory === cat.id ? 'border-[#00BFA6] bg-teal-50 text-[#00BFA6]' : 'border-gray-100 text-gray-600'}`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium text-center text-xs leading-tight">{cat.label}</span>
                                </div>
                            )
                        })}
                    </div>
                )}
              </div>

              {/* 4. Type de bien (Property Type) */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('propertyType')}
                  className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'propertyType' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type de bien</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'propertyType' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className={`font-bold text-sm truncate ${!filters.realEstateCategory ? 'text-gray-400' : 'text-gray-700'}`}>
                        {selectedPropertyTypeLabel}
                    </div>
                </div>

                {openDropdown === 'propertyType' && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden p-3">
                        {!filters.realEstateCategory ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                Veuillez choisir le type d'immobilier d'abord
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                <div 
                                    onClick={() => {
                                        onFilterChange('propertyType', '')
                                        setOpenDropdown(null)
                                    }}
                                    className={`p-2 rounded-lg text-sm hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center gap-1 border ${!filters.propertyType ? 'border-[#00BFA6] bg-teal-50 text-[#00BFA6]' : 'border-gray-100 text-gray-600'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="font-medium">Tout</span>
                                </div>
                                {filteredPropertyTypes.map((type) => {
                                    const Icon = getIcon(type.iconName || 'Home')
                                    return (
                                        <div 
                                            key={type.id}
                                            onClick={() => {
                                                onFilterChange('propertyType', type.id)
                                                setOpenDropdown(null)
                                            }}
                                            className={`p-2 rounded-lg text-sm hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center gap-1 border ${filters.propertyType === type.id ? 'border-[#00BFA6] bg-teal-50 text-[#00BFA6]' : 'border-gray-100 text-gray-600'}`}
                                        >
                                            <Icon className="h-5 w-5" /> 
                                            <span className="font-medium text-center text-xs leading-tight">{type.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
              </div>

              {/* 5. Wilaya */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('wilaya')}
                  className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'wilaya' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Wilaya</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'wilaya' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="font-bold text-sm text-gray-700 truncate">
                        {filters.wilaya ? `${filters.wilaya} - ${selectedWilayaName}` : 'Toutes'}
                    </div>
                </div>

                {openDropdown === 'wilaya' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-80">
                         <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                             <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#00BFA6]" 
                             />
                         </div>
                         <div className="overflow-y-auto flex-1">
                            <div 
                                onClick={() => {
                                    onFilterChange('wilaya', '')
                                    onFilterChange('commune', '') // Reset commune
                                    setOpenDropdown(null)
                                }}
                                className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${!filters.wilaya ? 'text-[#00BFA6] font-bold bg-teal-50' : 'text-gray-700'}`}
                            >
                                Toutes les wilayas
                            </div>
                            {displayedWilayas.map((w) => (
                                <div 
                                    key={w.id}
                                    onClick={() => {
                                        onFilterChange('wilaya', w.code)
                                        onFilterChange('commune', '') // Reset commune
                                        setOpenDropdown(null)
                                    }}
                                    className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center ${filters.wilaya === w.code ? 'text-[#00BFA6] font-bold bg-teal-50' : 'text-gray-700'}`}
                                >
                                    <span>{w.code} - {w.name}</span>
                                    {filters.wilaya === w.code && <Check className="h-4 w-4" />}
                                </div>
                            ))}
                         </div>
                    </div>
                )}
              </div>

              {/* 6. Commune */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('commune')}
                  className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'commune' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Commune</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'commune' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className={`font-bold text-sm truncate ${!filters.wilaya ? 'text-gray-400' : 'text-gray-700'}`}>
                        {selectedCommuneName || 'Toutes'}
                    </div>
                </div>

                {openDropdown === 'commune' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-80">
                         {!filters.wilaya ? (
                             <div className="p-4 text-center text-gray-500 text-sm">Veuillez choisir une wilaya d'abord</div>
                         ) : (
                             <>
                                <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#00BFA6]" 
                                    />
                                </div>
                                <div className="overflow-y-auto flex-1">
                                    <div 
                                        onClick={() => {
                                            onFilterChange('commune', '')
                                            setOpenDropdown(null)
                                        }}
                                        className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${!filters.commune ? 'text-[#00BFA6] font-bold bg-teal-50' : 'text-gray-700'}`}
                                    >
                                        Toutes les communes
                                    </div>
                                    {displayedCommunes.map((c) => (
                                        <div 
                                            key={c.id}
                                            onClick={() => {
                                                onFilterChange('commune', c.id)
                                                setOpenDropdown(null)
                                            }}
                                            className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center ${filters.commune === c.id ? 'text-[#00BFA6] font-bold bg-teal-50' : 'text-gray-700'}`}
                                        >
                                            <span>{c.name}</span>
                                            {filters.commune === c.id && <Check className="h-4 w-4" />}
                                        </div>
                                    ))}
                                </div>
                             </>
                         )}
                    </div>
                )}
              </div>

              {/* 7. Budget */}
              <div className="relative">
                <div 
                   onClick={() => toggleDropdown('budget')}
                   className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'budget' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Budget Max</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'budget' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="font-bold text-sm text-gray-700 truncate">
                        {filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString()} DA` : 'Max'}
                    </div>
                </div>

                {openDropdown === 'budget' && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Budget Maximum (DA)</label>
                                <input 
                                    type="number" 
                                    value={filters.maxPrice}
                                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00BFA6] outline-none"
                                    placeholder="Ex: 50000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[10000, 20000, 30000, 40000, 50000, 100000].map(price => (
                                    <button 
                                        key={price}
                                        onClick={() => onFilterChange('maxPrice', price.toString())}
                                        className="px-2 py-1 bg-gray-50 rounded text-xs hover:bg-gray-100 text-gray-600"
                                    >
                                        {price.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
              </div>

              {/* 8. Surface */}
              <div className="relative">
                <div 
                   onClick={() => toggleDropdown('surface')}
                   className={`border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-all ${openDropdown === 'surface' ? 'ring-2 ring-[#00BFA6] border-transparent' : ''}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Surface Min</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openDropdown === 'surface' ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="font-bold text-sm text-gray-700 truncate">
                        {filters.minArea ? `${filters.minArea} m²` : 'Min'}
                    </div>
                </div>

                {openDropdown === 'surface' && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Surface Minimum (m²)</label>
                                <input 
                                    type="number" 
                                    value={filters.minArea}
                                    onChange={(e) => onFilterChange('minArea', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00BFA6] outline-none"
                                    placeholder="Ex: 50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[50, 80, 100, 120, 150, 200].map(area => (
                                    <button 
                                        key={area}
                                        onClick={() => onFilterChange('minArea', area.toString())}
                                        className="px-2 py-1 bg-gray-50 rounded text-xs hover:bg-gray-100 text-gray-600"
                                    >
                                        {area} m²
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
              </div>

          </div>

          <div className="w-full xl:w-auto h-full min-w-[140px]">
              <Button 
                className="w-full bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-lg px-6 font-bold text-sm h-[52px] shadow-md transition-all active:scale-95"
                onClick={onSearch}
              >
                 <Search className="h-5 w-5 mr-2" />
                 Rechercher
              </Button>
          </div>
      </div>
    </div>
  )
}
