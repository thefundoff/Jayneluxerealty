import { MapPin } from 'lucide-react';
import type { Property } from '../lib/database.types';

interface PropertyMapProps {
  property: Property;
}

export const PropertyMap = ({ property }: PropertyMapProps) => {
  const hasCoordinates = property.latitude != null && property.longitude != null
    && property.latitude !== 0 && property.longitude !== 0;

  const googleMapsLink = `https://www.google.com/maps/search/${encodeURIComponent(
    `${property.location}, ${property.city}, ${property.state}`
  )}`;

  if (!hasCoordinates) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-[#134137] flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-[#F3CF92]" />
            <span>Property Location</span>
          </h2>
        </div>
        <div className="p-6 bg-gray-50">
          <div className="mb-4">
            <h3 className="font-bold text-[#134137] mb-2">Address</h3>
            <p className="text-gray-700">{property.location}</p>
            <p className="text-gray-600">{property.city}, {property.state}</p>
          </div>
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#F3CF92] text-[#134137] py-3 rounded-lg font-bold hover:bg-[#e6c07f] transition-colors"
          >
            Search on Google Maps
          </a>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.${Math.floor(
    Math.random() * 1000000
  )}!2d${property.longitude}!3d${property.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s${encodeURIComponent(
    property.location
  )}!5e0!3m2!1sen!2sng!4v1700000000000`;

  const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(
    property.location
  )}/@${property.latitude},${property.longitude},15z`;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-[#134137] flex items-center space-x-2">
          <MapPin className="w-6 h-6 text-[#F3CF92]" />
          <span>Property Location</span>
        </h2>
      </div>

      <div className="relative w-full h-96">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen=""
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          className="w-full h-full"
        ></iframe>
      </div>

      <div className="p-6 bg-gray-50 border-t">
        <div className="mb-4">
          <h3 className="font-bold text-[#134137] mb-2">Address</h3>
          <p className="text-gray-700">{property.location}</p>
          <p className="text-gray-600">{property.city}, {property.state}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Latitude</p>
            <p className="font-semibold text-[#134137]">{property.latitude!.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Longitude</p>
            <p className="font-semibold text-[#134137]">{property.longitude!.toFixed(4)}</p>
          </div>
        </div>

        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full text-center bg-[#F3CF92] text-[#134137] py-3 rounded-lg font-bold hover:bg-[#e6c07f] transition-colors"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
};
