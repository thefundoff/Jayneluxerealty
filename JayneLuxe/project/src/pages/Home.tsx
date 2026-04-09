import { useEffect, useState } from 'react';
import { Search, MapPin, TrendingUp, Award, ChevronDown, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PropertyWithImages } from '../lib/database.types';
import { PropertyCard } from '../components/PropertyCard';
import { formatNaira } from '../lib/currency';

interface HomeProps {
  onPropertyClick: (id: string) => void;
}

const PROPERTIES_PER_PAGE = 6;

export const Home = ({ onPropertyClick }: HomeProps) => {
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
        const price = property.price;
        return price >= min && price <= max;
      });
    }

    if (propertyType) {
      filtered = filtered.filter(property => property.property_category === propertyType);
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
          property_images (*)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasMoreProperties = displayCount < filteredProperties.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-[600px] text-white overflow-hidden bg-gray-900">
        <img
          src="/whatsapp_image_2025-12-13_at_4.12.08_pm.jpeg"
          alt="Abuja cityscape"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10 overflow-hidden">
          <div className="max-w-3xl w-full min-w-0">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight break-words">
              <span className="text-[#C9940A]">At JayneLuxe</span>
              <span className="block text-white">We Give Your Dream an Address</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white break-words" style={{ textShadow: '0 3px 5px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.6)' }}>
              Selling luxury homes & properties where peace of mind is assured
            </p>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden max-w-2xl">
                <div className="flex-1 flex items-center px-6 py-4">
                  <Search className="w-6 h-6 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search by location, property type, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-gray-700 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#F3CF92] text-[#134137] px-8 py-4 font-bold text-lg hover:bg-[#e6c07f] transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            <a
              href="#properties"
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all hover:scale-105 shadow-lg"
            >
              <span>Explore All Properties</span>
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/tela6360-copy.jpg"
                alt="Your JayneLuxe Real Estate Professional"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-4xl font-bold text-[#134137] mb-6">Your Trusted Real Estate Partner</h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Welcome to JayneLuxe Realty. With years of expertise in Nigeria's luxury property market, we deliver exceptional service built on three foundational pillars.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#134137]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#134137] mb-2">Integrity First</h3>
                    <p className="text-gray-600">
                      Every transaction is handled with complete transparency and honesty, ensuring your trust is never compromised.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#134137]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#134137] mb-2">Peace of Mind Guaranteed</h3>
                    <p className="text-gray-600">
                      Navigate your property journey with confidence. We handle every detail so you can focus on your future.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-[#134137]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#134137] mb-2">Precision in Every Detail</h3>
                    <p className="text-gray-600">
                      From market analysis to closing, meticulous attention ensures optimal outcomes for your investment.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="#/about"
                className="inline-block mt-8 bg-[#F3CF92] text-[#134137] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg"
              >
                Learn More About Us
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#134137]" />
              </div>
              <h3 className="text-xl font-bold text-[#134137] mb-2">Integrity</h3>
              <p className="text-gray-600">Access to the most desirable neighborhoods and communities</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#134137]" />
              </div>
              <h3 className="text-xl font-bold text-[#134137] mb-2">Peace of Mind</h3>
              <p className="text-gray-600">Competitive pricing and exceptional value for your investment</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-[#134137]" />
              </div>
              <h3 className="text-xl font-bold text-[#134137] mb-2">Precision</h3>
              <p className="text-gray-600">Award-winning service and support throughout your journey</p>
            </div>
          </div>
        </div>
      </section>

      <section id="properties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#134137] mb-4">Featured Properties</h2>
            <p className="text-xl text-gray-600">Explore our handpicked selection of luxury homes</p>
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
                    Property Category
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">All Properties</option>
                    <option value="luxury">Luxury</option>
                    <option value="premium">Premium</option>
                    <option value="low-income">Low Income Housing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estate Lands
                  </label>
                  <select
                    value={areaType}
                    onChange={(e) => setAreaType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">All Areas</option>
                    <option value="prime">Prime Areas</option>
                    <option value="emerging">Emerging Areas</option>
                    <option value="suburb">Suburb Areas</option>
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
                  {propertyType && <span className="font-semibold"> in {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} category</span>}
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
                  : 'No properties found matching your price range. Try adjusting your filters.'}
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
      </section>
    </div>
  );
};
