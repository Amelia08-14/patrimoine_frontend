'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Enums (matching Prisma/Backend)
enum TransactionType {
  RENTAL = 'RENTAL',
  SALE = 'SALE', // Legacy used PURCHASE/RENTAL, but backend enum is RENTAL/SALE/HOLIDAY_RENTAL
}

// Zod Schema
const researchSchema = z.object({
  transaction: z.nativeEnum(TransactionType),
  
  // Property Criteria
  realEstateTypeId: z.number().optional(),
  propertyTypeId: z.number().optional(),
  
  minSurface: z.coerce.number().min(1, 'Surface min requise'),
  maxSurface: z.coerce.number().min(1, 'Surface max requise'),
  nbPieces: z.coerce.number().min(1).optional(),
  nbRooms: z.coerce.number().min(0).optional(),
  nbFloors: z.coerce.number().min(0).optional(),
  
  // Options (Amenities) - stored as IDs in an array, converted to JSON string for backend
  amenities: z.array(z.number()).optional(),

  // Location & Budget
  cityId: z.coerce.number().min(1, 'Ville requise'),
  towns: z.array(z.string()).min(1, 'Au moins une commune requise'), // Assuming Select multiple returns strings
  
  minBudget: z.coerce.number().min(1, 'Budget min requis'),
  maxBudget: z.coerce.number().min(1, 'Budget max requis'),
  installationDate: z.string().min(1, 'Date requise'),
  comment: z.string().min(10, 'Commentaire requis (min 10 car.)'),

  // User Info (if not logged in)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  activity: z.string().optional(),
  
  // Meta
  userType: z.enum(['PARTICULIER', 'SOCIETE']).optional(),
  isDelegate: z.boolean().optional(), // "Je confie ma recherche..."
  receiveAlert: z.boolean().optional(),
});

type ResearchFormValues = z.infer<typeof researchSchema>;

// Steps
const STEPS = ['Transaction', 'Type de Bien', 'Critères', 'Budget & Lieu', 'Vos Coordonnées'];

export default function ResearchPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refData, setRefData] = useState<{
    realEstateTypes: any[];
    propertyTypes: any[];
    cities: any[];
    towns: any[];
    amenities: any[]; // kitchen, heater, etc. combined or separate?
  }>({
    realEstateTypes: [],
    propertyTypes: [],
    cities: [],
    towns: [],
    amenities: [],
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      transaction: TransactionType.SALE,
      minSurface: 0,
      maxSurface: 0,
      minBudget: 0,
      maxBudget: 0,
      amenities: [],
      towns: [],
      userType: 'PARTICULIER',
    }
  });

  // Fetch Reference Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [retRes, cityRes] = await Promise.all([
          axios.get('http://localhost:8000/real-estate-types'), // Adjust endpoint
          axios.get('http://localhost:8000/cities'),
        ]);
        setRefData(prev => ({ ...prev, realEstateTypes: retRes.data, cities: cityRes.data }));
      } catch (err) {
        console.error("Error fetching ref data", err);
        // Fallback or mock if endpoints fail
      }
    };
    fetchData();
  }, []);

  // Fetch Towns when City changes
  const selectedCityId = watch('cityId');
  useEffect(() => {
    if (selectedCityId) {
      axios.get(`http://localhost:8000/cities/${selectedCityId}/towns`) // Adjust endpoint
        .then(res => setRefData(prev => ({ ...prev, towns: res.data })))
        .catch(err => console.error(err));
    }
  }, [selectedCityId]);

  // Fetch Property Types when Real Estate Type changes
  const selectedRetId = watch('realEstateTypeId');
  useEffect(() => {
    if (selectedRetId) {
      axios.get(`http://localhost:8000/real-estate-types/${selectedRetId}/property-types`) // Adjust endpoint
        .then(res => setRefData(prev => ({ ...prev, propertyTypes: res.data })))
        .catch(err => console.error(err));
    }
  }, [selectedRetId]);

  const onSubmit = async (data: ResearchFormValues) => {
    setLoading(true);
    try {
      // Transform data for backend
      const payload = {
        ...data,
        towns: JSON.stringify(data.towns),
        amenities: JSON.stringify(data.amenities),
      };
      await axios.post('http://localhost:8000/entrusted-research', payload);
      alert('Recherche confiée avec succès !');
      router.push('/');
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // Render Steps
  const renderStep = () => {
    switch(currentStep) {
      case 0: // Transaction
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Que recherchez-vous ?</h2>
            <div className="flex justify-center gap-8">
              <label className={`cursor-pointer p-6 border-2 rounded-xl transition ${watch('transaction') === TransactionType.RENTAL ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input type="radio" {...register('transaction')} value={TransactionType.RENTAL} className="hidden" />
                <div className="text-4xl mb-2">🏠</div>
                <div className="font-semibold">Location</div>
              </label>
              <label className={`cursor-pointer p-6 border-2 rounded-xl transition ${watch('transaction') === TransactionType.SALE ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input type="radio" {...register('transaction')} value={TransactionType.SALE} className="hidden" />
                <div className="text-4xl mb-2">🔑</div>
                <div className="font-semibold">Achat</div>
              </label>
            </div>
          </div>
        );
      
      case 1: // Type de Bien (Real Estate Type)
        return (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-center">Type de Bien</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {refData.realEstateTypes.map(type => (
                  <label key={type.id} className={`cursor-pointer p-4 border rounded-lg text-center ${watch('realEstateTypeId') === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      value={type.id} 
                      {...register('realEstateTypeId', { valueAsNumber: true })}
                      className="hidden" 
                    />
                    <span>{type.nameFr || type.name}</span>
                  </label>
                ))}
             </div>
             {refData.propertyTypes.length > 0 && (
               <div className="mt-6">
                 <h3 className="font-semibold mb-3">Type de Propriété</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {refData.propertyTypes.map(pt => (
                     <label key={pt.id} className={`cursor-pointer p-4 border rounded-lg text-center ${watch('propertyTypeId') === pt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                       <input 
                         type="radio" 
                         value={pt.id} 
                         {...register('propertyTypeId', { valueAsNumber: true })} 
                         className="hidden" 
                       />
                       <span>{pt.nameFr || pt.name}</span>
                     </label>
                   ))}
                 </div>
               </div>
             )}
          </div>
        );

      case 2: // Critères (Surface, Pieces)
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Caractéristiques</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Surface Min (m²)</label>
                <input type="number" {...register('minSurface')} className="w-full border rounded p-2" />
                {errors.minSurface && <span className="text-red-500 text-sm">{errors.minSurface.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Surface Max (m²)</label>
                <input type="number" {...register('maxSurface')} className="w-full border rounded p-2" />
                {errors.maxSurface && <span className="text-red-500 text-sm">{errors.maxSurface.message}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de Pièces</label>
                <input type="number" {...register('nbPieces')} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de Chambres</label>
                <input type="number" {...register('nbRooms')} className="w-full border rounded p-2" />
              </div>
            </div>
          </div>
        );

      case 3: // Budget & Lieu
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Budget et Localisation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Ville (Wilaya)</label>
                <select {...register('cityId', { valueAsNumber: true })} className="w-full border rounded p-2">
                  <option value="">Sélectionner...</option>
                  {refData.cities.map(c => <option key={c.id} value={c.id}>{c.nameFr || c.name}</option>)}
                </select>
                {errors.cityId && <span className="text-red-500 text-sm">{errors.cityId.message}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Communes</label>
                <select multiple {...register('towns')} className="w-full border rounded p-2 h-32">
                  {refData.towns.map(t => <option key={t.id} value={t.id}>{t.nameFr || t.name}</option>)}
                </select>
                <p className="text-xs text-gray-500">Maintenez Ctrl pour sélectionner plusieurs</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Budget Min (DA)</label>
                <input type="number" {...register('minBudget')} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget Max (DA)</label>
                <input type="number" {...register('maxBudget')} className="w-full border rounded p-2" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Date d'installation souhaitée</label>
                <input type="date" {...register('installationDate')} className="w-full border rounded p-2" />
                {errors.installationDate && <span className="text-red-500 text-sm">{errors.installationDate.message}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Commentaire</label>
                <textarea {...register('comment')} rows={3} className="w-full border rounded p-2"></textarea>
                {errors.comment && <span className="text-red-500 text-sm">{errors.comment.message}</span>}
              </div>
            </div>
          </div>
        );

      case 4: // User Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Vos Coordonnées</h2>
            
            <div className="flex justify-center gap-4 mb-4">
               <label className="flex items-center gap-2">
                 <input type="radio" {...register('userType')} value="PARTICULIER" /> Particulier
               </label>
               <label className="flex items-center gap-2">
                 <input type="radio" {...register('userType')} value="SOCIETE" /> Société
               </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input type="text" {...register('lastName')} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input type="text" {...register('firstName')} className="w-full border rounded p-2" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <input type="text" {...register('address')} className="w-full border rounded p-2" />
              </div>

              {watch('userType') === 'SOCIETE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom de la société</label>
                    <input type="text" {...register('companyName')} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Activité</label>
                    <input type="text" {...register('activity')} className="w-full border rounded p-2" />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isDelegate')} />
                <span className="text-sm">Je confie ma recherche au professionnel du patrimoine immobilier.</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('receiveAlert')} />
                <span className="text-sm">Je souhaite créer une alerte mail pour cette recherche.</span>
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Confier une recherche</h1>
      
      {/* Stepper */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
        {STEPS.map((step, index) => (
          <div key={index} className={`flex flex-col items-center bg-white px-2 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {index + 1}
            </div>
            <span className="text-xs hidden sm:block">{step}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-lg min-h-[400px]">
        {renderStep()}

        <div className="flex justify-between mt-8 pt-4 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Retour
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Confier ma recherche'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
