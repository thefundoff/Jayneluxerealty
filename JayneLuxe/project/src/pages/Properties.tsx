import { useEffect, useState } from 'react';
import { Search, DollarSign, ChevronDown, Calendar, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PropertyWithImages } from '../lib/database.types';
import { PropertyCard } from '../components/PropertyCard';
import { formatNaira } from '../lib/currency';

interface PropertiesProps {
  onPropertyClick: (id: string) => void;
}

const PROPERTIES_PER_PAGE = 6;

export const Properties = ({ onPropertyClick }: PropertiesProps) => {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithImages[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(PROPERTIES_PER_PAGE);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [areaType, setAreaType] = useState<string>('');

  useEffect(() => {
    const pendingSearch = sessionStorage.getItem('propertySearch');
    if (pendingSearch) {
      setSearchQuery(pendingSearch);
      sessionStorage.removeItem('propertySearch');
    }
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query)
      );
    }

    if (minPrice || maxPrice) {
      filtered = filtered.filter(property => {
        const effectivePrice =
          property.property_variants?.length > 0
            ? Math.min(...property.property_variants.map(v => v.price))
            : property.price;
        return effectivePrice >= min && effectivePrice <= max;
      });
    }

    if (propertyType) {
      filtered = filtered.filter(property => property.property_type === propertyType);
    }

    if (areaType) {
      filtered = filtered.filter(property => property.area_type === areaType);
    }

    setFilteredProperties(filtered);
    setDisplayCount(PROPERTIES_PER_PAGE);
  }, [properties, minPrice, maxPrice, searchQuery, propertyType, areaType]);

  useEffect(() => {
    setDisplayedProperties(filteredProperties.slice(0, displayCount));
  }, [filteredProperties, displayCount]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          property_variants (*)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeMore = () => {
    setDisplayCount(prev => prev + PROPERTIES_PER_PAGE);
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setPropertyType('');
    setAreaType('');
  };

  const hasMoreProperties = displayCount < filteredProperties.length;

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#134137] mb-4">Our Properties</h1>
          <p className="text-xl text-gray-600">Explore our handpicked selection of luxury homes</p>
        </div>

        {/* CTA strip */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="#/contact"
            className="inline-flex items-center gap-2 bg-[#134137] text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-[#0d2e24] transition-all hover:scale-105 shadow-md w-full sm:w-auto justify-center"
          >
            <Calendar className="w-5 h-5" />
            Schedule Inspection
          </a>
          <a
            href="#/contact"
            className="inline-flex items-center gap-2 bg-[#F3CF92] text-[#134137] px-8 py-3.5 rounded-full font-semibold text-base hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-md w-full sm:w-auto justify-center"
          >
            <MessageCircle className="w-5 h-5" />
            Enquire on WhatsApp
          </a>
        </div>

        <div className="mb-8">
          <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden max-w-2xl mx-auto border border-gray-200">
            <div className="flex-1 flex items-center px-6 py-4">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by location, property type, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-700"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-4 text-gray-400 hover:text-gray-700 text-xl transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-[#134137]" />
              <h3 className="text-xl font-bold text-[#134137]">Filter Properties</h3>
            </div>
            {(minPrice || maxPrice || searchQuery || propertyType || areaType) && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-[#134137] hover:text-[#F3CF92] font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mb-4 p-3 bg-[#F3CF92]/10 rounded-lg border border-[#F3CF92]/30">
              <p className="text-sm text-[#134137]">
                <span className="font-semibold">Searching for:</span> "{searchQuery}"
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">All Property Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="waterfront">Waterfront</option>
                  <option value="estate land">Estate Land</option>
                  <option value="hectare land">Hectare Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estate Area Type
                </label>
                <select
                  value={areaType}
                  onChange={(e) => setAreaType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">All Areas</option>
                  <option value="prime">Prime Areas</option>
                  <option value="emerging">Emerging Areas</option>
                  <option value="suburb">Suburb</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price (₦)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 50000000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price (₦)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 200000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {(minPrice || maxPrice || propertyType || areaType) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Showing properties
                {propertyType && <span className="font-semibold"> of type {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}</span>}
                {areaType && <span className="font-semibold"> in {areaType.charAt(0).toUpperCase() + areaType.slice(1)} areas</span>}
                {minPrice && <span className="font-semibold"> from {formatNaira(parseFloat(minPrice))}</span>}
                {maxPrice && <span className="font-semibold"> up to {formatNaira(parseFloat(maxPrice))}</span>}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <p className="text-xl text-gray-600">
              {properties.length === 0
                ? 'No properties available at the moment.'
                : 'No properties found matching your filters. Try adjusting them.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => onPropertyClick(property.id)}
                />
              ))}
            </div>

            {hasMoreProperties && (
              <div className="flex justify-center">
                <button
                  onClick={handleSeeMore}
                  className="flex items-center space-x-2 bg-[#F3CF92] text-[#134137] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg"
                >
                  <span>See More Properties</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
