import { useEffect, useState } from 'react';
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Car, Calendar, TreePine, Waves, ChevronLeft, ChevronRight, X, Tag, Clock, Rotate3d as Rotate3D } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatNaira } from '../lib/currency';
import { PropertyMap } from '../components/PropertyMap';
import { VirtualTour3D } from '../components/VirtualTour3D';
import type { PropertyWithImages } from '../lib/database.types';

interface PropertyDetailsProps {
  propertyId: string;
  onBack: () => void;
}

export const PropertyDetails = ({ propertyId, onBack }: PropertyDetailsProps) => {
  const [property, setProperty] = useState<PropertyWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [show3DTour, setShow3DTour] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    tourDate: '',
    tourTime: '',
    message: '',
  });

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (*)
        `)
        .eq('id', propertyId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const sortedImages = [...data.property_images].sort((a, b) => a.display_order - b.display_order);
        setProperty({ ...data, property_images: sortedImages });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev + 1) % property.property_images.length);
    }
  };

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev - 1 + property.property_images.length) % property.property_images.length);
    }
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookTour = () => {
    if (!property) return;

    const { name, phone, email, tourDate, tourTime, message } = bookingData;

    if (!name || !phone || !tourDate || !tourTime) {
      alert('Please fill in all required fields');
      return;
    }

    const formattedDate = new Date(tourDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const hasActiveDiscount = property.discount_price &&
      property.discount_end_date &&
      new Date(property.discount_end_date) > new Date();

    const displayPrice = hasActiveDiscount ? property.discount_price : property.price;
    const priceInfo = hasActiveDiscount
      ? `${formatNaira(displayPrice)} (${property.discount_percentage}% OFF - was ${formatNaira(property.price)})`
      : formatNaira(property.price);

    const whatsappMessage = `Hello! I would like to book a property tour.\n\n*Property Details:*\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\nPrice: ${priceInfo}\n\n*Tour Details:*\nName: ${name}\nPhone: ${phone}\n${email ? `Email: ${email}\n` : ''}Date: ${formattedDate}\nTime: ${tourTime}\n${message ? `\nAdditional Message:\n${message}` : ''}\n\nLooking forward to viewing this property!`;

    const realtorPhone = '2348163081513';
    const whatsappUrl = `https://wa.me/${realtorPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappUrl, '_blank');

    setShowBookingModal(false);
    setBookingData({
      name: '',
      phone: '',
      email: '',
      tourDate: '',
      tourTime: '',
      message: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#134137] border-t-[#F3CF92]"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#134137] mb-4">Property not found</h2>
          <button
            onClick={onBack}
            className="text-[#F3CF92] hover:text-[#134137] font-medium"
          >
            Go back to properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#134137] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[#F3CF92] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Properties</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold">{property.title}</h1>
          <div className="flex items-center text-gray-300 mt-2">
            <MapPin className="w-5 h-5 mr-2" />
            <span className="text-lg">{property.location}, {property.city}, {property.state}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              {property.property_images.length > 0 ? (
                <>
                  <div className="relative h-96 md:h-[500px]">
                    <img
                      src={property.property_images[currentImageIndex]?.image_url}
                      alt={`${property.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setShow3DTour(true)}
                      className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 hover:bg-[#134137] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all backdrop-blur-sm border border-white/20 hover:border-[#F3CF92] shadow-lg group z-10"
                    >
                      <Rotate3D className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>3D Tour</span>
                    </button>

                  {property.property_images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-6 h-6 text-[#134137]" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRight className="w-6 h-6 text-[#134137]" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
                          {currentImageIndex + 1} / {property.property_images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {property.property_images.length > 1 && (
                    <div className="p-4 grid grid-cols-4 md:grid-cols-6 gap-2">
                      {property.property_images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex ? 'border-[#F3CF92] scale-95' : 'border-transparent hover:border-[#134137]'
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="relative h-96 md:h-[500px]">
                  <img
                    src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-lg text-[#134137] font-medium">
                      No images available
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-[#134137] mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            <PropertyMap property={property} />

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-[#134137] mb-6">Features & Amenities</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bed className="w-6 h-6 text-[#134137]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#134137]">Bedrooms</h3>
                    <p className="text-gray-600">{property.bedrooms} spacious bedrooms</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bath className="w-6 h-6 text-[#134137]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#134137]">Bathrooms</h3>
                    <p className="text-gray-600">{property.bathrooms} modern bathrooms</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Maximize className="w-6 h-6 text-[#134137]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#134137]">Square Feet</h3>
                    <p className="text-gray-600">{property.square_feet.toLocaleString()} sq ft</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Car className="w-6 h-6 text-[#134137]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#134137]">Parking</h3>
                    <p className="text-gray-600">{property.parking_spaces} parking spaces</p>
                  </div>
                </div>

                {property.year_built && (
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-[#134137]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#134137]">Year Built</h3>
                      <p className="text-gray-600">{property.year_built}</p>
                    </div>
                  </div>
                )}

                {property.has_pool && (
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Waves className="w-6 h-6 text-[#134137]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#134137]">Swimming Pool</h3>
                      <p className="text-gray-600">Private pool included</p>
                    </div>
                  </div>
                )}

                {property.has_garden && (
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                      <TreePine className="w-6 h-6 text-[#134137]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#134137]">Garden</h3>
                      <p className="text-gray-600">Beautiful garden area</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-8 shadow-lg sticky top-24">
              {property.discount_price && property.discount_end_date && new Date(property.discount_end_date) > new Date() ? (
                <div className="mb-6">
                  <div className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg inline-flex items-center gap-1 mb-3">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{property.discount_percentage}% OFF!</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Special Offer Price</div>
                  <div className="text-4xl font-bold text-[#134137] mb-2">
                    {formatNaira(property.discount_price)}
                  </div>
                  <div className="text-lg text-gray-500 line-through mb-4">
                    Was {formatNaira(property.price)}
                  </div>
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold mb-1 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Limited Time Offer</span>
                    </div>
                    <p className="text-amber-800 text-sm">
                      Ends {new Date(property.discount_end_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded-lg p-2.5 text-center">
                    <div className="text-green-900 font-bold text-base">
                      Save {formatNaira(property.price - property.discount_price)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-1">Price</div>
                  <div className="text-4xl font-bold text-[#134137]">
                    {formatNaira(property.price)}
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-semibold text-[#134137] capitalize">{property.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold text-[#134137] capitalize">{property.status}</span>
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="block w-full bg-[#F3CF92] text-[#134137] text-center py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-md"
              >
                Book an Inspection
              </button>

              <a
                href="#/contact"
                className="block w-full mt-4 bg-white border-2 border-[#134137] text-[#134137] text-center py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-md"
              >
                Contact Us
              </a>

              <a
                href="/"
                className="block w-full mt-4 bg-[#85bb65] text-white text-center py-4 rounded-lg font-bold text-lg hover:bg-[#1abc2c] transition-all hover:scale-105 shadow-md"
              >
                Pay Now
              </a>

              <p className="text-sm text-gray-600 text-center mt-4">
                Book a tour to view this property in person.
              </p>
            </div>
          </div>
        </div>
      </div>

      {show3DTour && property.property_images.length > 0 && (
        <VirtualTour3D
          images={property.property_images.map(img => img.image_url)}
          propertyTitle={property.title}
          onClose={() => setShow3DTour(false)}
        />
      )}

      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#134137]">Book a Property Tour</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={bookingData.name}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Preferred Tour Date *
                </label>
                <input
                  type="date"
                  name="tourDate"
                  value={bookingData.tourDate}
                  onChange={handleBookingChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  name="tourTime"
                  value={bookingData.tourTime}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={bookingData.message}
                  onChange={handleBookingChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none"
                  placeholder="Any specific requirements or questions?"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleBookTour}
                className="flex-1 bg-[#F3CF92] text-[#134137] py-3 rounded-lg font-bold hover:bg-[#e6c07f] transition-colors"
              >
                Send via WhatsApp
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-200 text-[#134137] py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center mt-4">
              Your booking request will be sent to our realtor via WhatsApp
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
