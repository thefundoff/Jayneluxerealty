import { Bed, Bath, Maximize, MapPin, Tag } from 'lucide-react';
import type { PropertyWithImages } from '../lib/database.types';
import { formatPrice } from '../lib/currency';

interface PropertyCardProps {
  property: PropertyWithImages;
  onClick: () => void;
}

export const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  const primaryImage = property.property_images.find(img => img.is_primary) || property.property_images[0];

  const hasActiveDiscount = property.discount_price &&
    property.discount_end_date &&
    new Date(property.discount_end_date) > new Date();

  const hasVariants = property.property_variants?.length > 0;
  const minVariantPrice = hasVariants ? Math.min(...property.property_variants.map(v => v.price)) : null;
  const minSqFt = hasVariants ? Math.min(...property.property_variants.map(v => v.square_feet)) : null;
  const maxSqFt = hasVariants ? Math.max(...property.property_variants.map(v => v.square_feet)) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={primaryImage?.image_url || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-[#134137] text-white px-3 py-1 rounded-full text-sm font-medium">
          {property.status}
        </div>
        {hasActiveDiscount && (
          <div className="absolute top-4 left-4 mt-10">
            <div className="bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{property.discount_percentage}% OFF</span>
            </div>
          </div>
        )}
        {hasVariants ? (
          <div className="absolute top-4 right-4 bg-[#F3CF92] text-[#134137] px-4 py-2 rounded-full font-bold shadow-lg text-sm">
            From {formatPrice(property.price)}
          </div>
        ) : hasActiveDiscount ? (
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
            <div className="bg-[#F3CF92] text-[#134137] px-4 py-2 rounded-full font-bold shadow-lg">
              {formatPrice(property.discount_price)}
            </div>
            <div className="bg-gray-800/90 text-white px-3 py-1 rounded-full text-xs line-through">
              {formatPrice(property.price)}
            </div>
          </div>
        ) : (
          <div className="absolute top-4 right-4 bg-[#F3CF92] text-[#134137] px-4 py-2 rounded-full font-bold shadow-lg">
            {formatPrice(property.price)}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-[#134137] mb-2 group-hover:text-[#F3CF92] transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.city}, {property.state}</span>
          </div>
          {property.area_type && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#134137]/10 text-[#134137] capitalize">
              {property.area_type === 'prime' ? 'Prime Areas' : property.area_type === 'emerging' ? 'Emerging Areas' : 'Suburb'}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-1 text-gray-700">
            <Bed className="w-5 h-5 text-[#134137]" />
            <span className="font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-700">
            <Bath className="w-5 h-5 text-[#134137]" />
            <span className="font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-700">
            <Maximize className="w-5 h-5 text-[#134137]" />
            {hasVariants ? (
              <span className="font-medium text-xs">{minSqFt!.toLocaleString()}–{maxSqFt!.toLocaleString()} sqm</span>
            ) : (
              <span className="font-medium">{property.square_feet.toLocaleString()} sqft</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
