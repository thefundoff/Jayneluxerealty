import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 5000);
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('An error occurred. Please try contacting us directly via email or phone.');
    } finally {
      setSending(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello!! I am interested in your real estate properties.');
    window.open(`https://wa.me/+2348072636542?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#134137] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-300">We'd love to hear from you. Let's make your dream home a reality.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#134137] mb-6">Contact Information</h2>
              <p className="text-gray-600 text-lg mb-8">
                Have questions about a property or ready to schedule a viewing? Our team is here to help you every step of the way.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#134137]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#134137] mb-1">Phone</h3>
                  <a href="tel:+1234567890" className="text-gray-600 hover:text-[#F3CF92] transition-colors">
                    +234 (807) 263-6542
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#134137]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#134137] mb-1">Email</h3>
                  <a href="mailto:info@estateluxe.com" className="text-gray-600 hover:text-[#F3CF92] transition-colors">
                    jayneluxerealty@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#134137]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#134137] mb-1">Office</h3>
                  <p className="text-gray-600">
                    Inna Plaza, Gaduwa, Abuja<br />
                    Abuja Nigeria, 480211
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center space-x-3 bg-[#25D366] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#22c55e] transition-all hover:scale-105 shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Chat on WhatsApp</span>
            </button>

            <div className="bg-gradient-to-br from-[#134137] to-[#0d2d26] text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">Office Hours</h3>
              <div className="space-y-2 text-gray-200">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-semibold">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-semibold">Closed</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-semibold">Closed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-[#134137] mb-6">Send Us a Message</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#134137] mb-2">Thank You!</h3>
                <p className="text-gray-600">We've received your message and will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#134137] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#134137] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#134137] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all"
                    placeholder="+1 (234) 567-890"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#134137] mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center space-x-2 bg-[#F3CF92] text-[#134137] py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
                  <span>{sending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
