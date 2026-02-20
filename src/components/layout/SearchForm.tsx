"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { WILAYAS } from "@/data/wilayas"

export function SearchForm() {
  return (
    <div className="bg-white rounded-xl shadow-2xl mx-auto border border-gray-100 overflow-hidden">
      <Tabs defaultValue="rental" className="w-full">
        {/* Custom Tabs Header */}
        <div className="flex justify-center -mt-12 mb-4 relative z-10">
           <TabsList className="bg-white p-1 rounded-t-lg shadow-md inline-flex h-12 border-b-0">
            <TabsTrigger 
              value="rental" 
              className="px-8 py-2 text-base font-bold data-[state=active]:text-[#00908A] data-[state=active]:border-b-2 data-[state=active]:border-[#00908A] rounded-none bg-transparent shadow-none"
            >
              LOUER
            </TabsTrigger>
            <div className="w-px h-6 bg-gray-200 my-auto"></div>
            <TabsTrigger 
              value="purchase" 
              className="px-8 py-2 text-base font-bold data-[state=active]:text-[#00908A] data-[state=active]:border-b-2 data-[state=active]:border-[#00908A] rounded-none bg-transparent shadow-none"
            >
              ACHETER
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Formulaire Location */}
        <TabsContent value="rental" className="p-2 sm:p-6 bg-white mt-0">
          <form className="flex flex-col lg:flex-row gap-0 lg:gap-0 border border-gray-200 rounded-lg lg:rounded-full p-1 lg:pl-6 lg:pr-1 bg-white shadow-sm lg:divide-x lg:divide-gray-100">
            
            {/* Wilaya Select */}
            <div className="flex-grow relative group px-2 py-2 lg:py-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 ml-1">Wilaya</label>
              <div className="relative">
                 <select className="w-full py-1 text-gray-700 font-bold bg-transparent border-none focus:ring-0 outline-none appearance-none cursor-pointer">
                    <option value="">Toutes les wilayas</option>
                    {WILAYAS.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.code}>{wilaya.code} - {wilaya.name}</option>
                    ))}
                 </select>
              </div>
            </div>

            {/* Commune Select */}
            <div className="flex-grow relative group px-4 py-2 lg:py-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 ml-1">Commune</label>
              <div className="relative">
                 <select className="w-full py-1 text-gray-700 font-bold bg-transparent border-none focus:ring-0 outline-none appearance-none cursor-pointer">
                    <option>Toutes les communes</option>
                    <option>Hydra</option>
                    <option>Ben Aknoun</option>
                 </select>
              </div>
            </div>

            {/* Budget Input */}
            <div className="flex-grow relative px-4 py-2 lg:py-0">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 ml-1">Budget Max</label>
               <div className="relative flex items-center">
                 <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full py-1 text-gray-700 font-bold bg-transparent border-none focus:ring-0 outline-none placeholder:font-normal"
                />
                <span className="text-xs font-bold text-gray-400 ml-1">DA</span>
               </div>
            </div>

            {/* Search Button */}
            <div className="flex items-center p-1">
                <Button className="w-full lg:w-auto h-12 lg:h-12 rounded-lg lg:rounded-full px-8 text-base font-bold bg-[#00BFA6] hover:bg-[#00908A] text-white shadow-md transition-all">
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </Button>
            </div>
          </form>
        </TabsContent>

        {/* Formulaire Achat (Duplicate structure) */}
        <TabsContent value="purchase" className="p-2 sm:p-6 bg-white mt-0">
          <form className="flex flex-col lg:flex-row gap-0 lg:gap-0 border border-gray-200 rounded-lg lg:rounded-full p-1 lg:pl-6 lg:pr-1 bg-white shadow-sm lg:divide-x lg:divide-gray-100">
            {/* Wilaya Select */}
            <div className="flex-grow relative group px-2 py-2 lg:py-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 ml-1">Wilaya</label>
              <div className="relative">
                 <select className="w-full py-1 text-gray-700 font-bold bg-transparent border-none focus:ring-0 outline-none appearance-none cursor-pointer">
                    <option value="">Toutes les wilayas</option>
                    {WILAYAS.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.code}>{wilaya.code} - {wilaya.name}</option>
                    ))}
                 </select>
              </div>
            </div>
            <div className="flex-grow relative group px-4 py-2 lg:py-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 ml-1">Commune</label>
              <div className="relative">
                 <select className="w-full py-1 text-gray-700 font-bold bg-transparent border-none focus:ring-0 outline-none appearance-none cursor-pointer">
                    <option>Toutes les communes</option>
                 </select>
              </div>
            </div>
            <div className="flex-grow relative px-4 py-2 lg:py-0">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 ml-1">Budget Max</label>
               <div className="relative flex items-center">
                 <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full py-1 text-gray-700 font-bold bg-transparent border-none focus:ring-0 outline-none placeholder:font-normal"
                />
                <span className="text-xs font-bold text-gray-400 ml-1">DA</span>
               </div>
            </div>
            <div className="flex items-center p-1">
                <Button className="w-full lg:w-auto h-12 lg:h-12 rounded-lg lg:rounded-full px-8 text-base font-bold bg-[#00BFA6] hover:bg-[#00908A] text-white shadow-md transition-all">
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
