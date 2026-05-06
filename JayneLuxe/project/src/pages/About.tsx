import { useEffect, useState } from 'react';
import { Users, Target, Award, Heart, Shield, Home, ChevronLeft, ChevronRight } from 'lucide-react';

export const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    '/tela6360.jpg',
    '/tela6348.jpg',
    '/tela6312.jpg',
    '/tela6331.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#134137] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Jayne Luxe</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your trusted partner in finding premium real estate properties across Nigeria's most desirable locations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-2xl">
            <div className="relative w-full h-full">
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    alt={`JayneLuxe Professional ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6 text-[#134137]" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
              >
                <ChevronRight className="w-6 h-6 text-[#134137]" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-[#F3CF92] w-8'
                        : 'bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-[#134137] mb-6">Meet Your Realtor</h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
           FOUNDED IN 2024, JAYNE LUXE REALTY (JLR)
is a modern real estate brokerage headquartered in Abuja, 
operating at the intersection of construction expertise and 
strategic property brokerage. With a background in residential 
construction and general building services, the firm brings practical 
industry insight into every transaction, ensuring clients and investors make 
informed and value-driven property decisions.
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              At its core, Jayne Luxe Realty is committed to making real estate
investment seamless, strategic, and rewarding. 
The firm curates exclusive property opportunities and connects 
discerning buyers and investors with high-value assets across Abuja’s
evolving real estate landscape.:
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-[#134137]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#134137] mb-2">Integrity</h3>
                  <p className="text-gray-600">
                    Every interaction is built on honesty and transparency. Your trust is earned through ethical practices and genuine commitment to your best interests.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-7 h-7 text-[#134137]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#134137] mb-2">Peace of Mind</h3>
                  <p className="text-gray-600">
                    Navigate your property journey with confidence. From initial consultation to closing, we handle every detail so you can focus on your future home.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-[#134137]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#134137] mb-2">Precision</h3>
                  <p className="text-gray-600">
                    Meticulous attention to detail in every aspect. Market analysis, property selection, and negotiation are executed with expert precision to secure the best outcomes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-[#134137]" />
            </div>
            <h3 className="text-xl font-bold text-[#134137] mb-2">5000+</h3>
            <p className="text-gray-600">Satisfied Clients</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-[#134137]" />
            </div>
            <h3 className="text-xl font-bold text-[#134137] mb-2">500+</h3>
            <p className="text-gray-600">Properties Listed</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-[#134137]" />
            </div>
            <h3 className="text-xl font-bold text-[#134137] mb-2">8+</h3>
            <p className="text-gray-600">Years Experience</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-[#134137]" />
            </div>
            <h3 className="text-xl font-bold text-[#134137] mb-2">100%</h3>
            <p className="text-gray-600">Dedication</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#134137] to-[#0d2d26] rounded-xl p-12 text-white mb-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/tela6348.jpg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#134137] to-[#0d2d26]"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg leading-relaxed mb-4">
              To transform the real estate experience in Nigeria by delivering exceptional service rooted in integrity, providing complete peace of mind throughout your property journey, and executing every detail with unwavering precision.
            </p>
            <p className="text-lg leading-relaxed">
              We believe that purchasing property should be an empowering and confident experience. Through honest guidance, comprehensive support, and meticulous attention to detail, we turn your real estate aspirations into reality.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#F3CF92]">
            <div className="w-16 h-16 bg-[#F3CF92] rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-[#134137]" />
            </div>
            <h3 className="text-2xl font-bold text-[#134137] mb-4">Built on Integrity</h3>
            <p className="text-gray-600 mb-4">
              Transparency isn't optional - it's fundamental. Every price, every detail, every conversation reflects our commitment to honest, ethical service.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Clear, upfront pricing with no hidden fees</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Honest property assessments and market insights</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Ethical practices in every transaction</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#F3CF92]">
            <div className="w-16 h-16 bg-[#F3CF92] rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-[#134137]" />
            </div>
            <h3 className="text-2xl font-bold text-[#134137] mb-4">Guaranteed Peace of Mind</h3>
            <p className="text-gray-600 mb-4">
              Real estate decisions are significant. We ensure you move forward with complete confidence and zero stress throughout the entire process.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Comprehensive property verification and documentation</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Expert guidance at every stage</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>24/7 support when you need it</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#F3CF92]">
            <div className="w-16 h-16 bg-[#F3CF92] rounded-lg flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-[#134137]" />
            </div>
            <h3 className="text-2xl font-bold text-[#134137] mb-4">Executed with Precision</h3>
            <p className="text-gray-600 mb-4">
              Excellence is in the details. From market analysis to final negotiations, every element receives expert attention to deliver optimal results.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Data-driven market analysis and pricing strategies</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Thorough property inspections and evaluations</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#F3CF92] mt-1">✓</span>
                <span>Strategic negotiation for best outcomes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── OUR STORY ─────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#134137] mb-3">Who We Are</p>
              <h2 className="text-4xl font-bold text-[#134137] mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                JLR was built on a simple belief: real estate should be guided, not pushed.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                In a market where pressure selling is common, we chose a different approach — one rooted in transparency, strategy, and long-term value.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We prioritize informed decisions over quick transactions, ensuring every client walks away confident in their move.
              </p>
            </div>

            <div className="bg-[#134137] rounded-2xl p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full border border-[#F3CF92]/10 translate-x-16 -translate-y-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full border border-[#F3CF92]/10 -translate-x-10 translate-y-10 pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[#F3CF92] text-6xl font-serif leading-none">"</span>
                <p className="font-display text-xl italic leading-relaxed text-white/90 -mt-4 mb-6">
                  Real estate should be guided, not pushed. We chose transparency, strategy, and long-term value — always.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-0.5 bg-[#F3CF92]" />
                  <span className="text-[#F3CF92] font-semibold text-sm tracking-widest uppercase">Jayne Luxe Realty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── OUR NETWORK ───────────────────────────────────────── */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#134137] mb-3">Connections That Count</p>
            <h2 className="text-4xl font-bold text-[#134137] mb-4">Our Network</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Our strength lies in who we work with.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Shield,
                title: 'Trusted Developers',
                body: 'We partner only with developers who meet our standards for quality, timely delivery, and genuine investment value.',
              },
              {
                icon: Users,
                title: 'Legal & Property Experts',
                body: 'Our legal and property expert network ensures clients receive full protection and proper documentation at every stage.',
              },
              {
                icon: Award,
                title: 'Access & Opportunity',
                body: 'Through our network, clients gain access to opportunities and protections that go far beyond what the open market offers.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#F3CF92] hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-[#F3CF92]/20 group-hover:bg-[#F3CF92]/40 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-[#134137]" />
                </div>
                <h3 className="text-xl font-bold text-[#134137] mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── DEVELOPER PARTNERSHIP ─────────────────────────────── */}
        <div className="bg-[#134137] rounded-2xl overflow-hidden mb-20">
          <div className="grid md:grid-cols-2">
            <div className="p-12 flex flex-col justify-center">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#F3CF92]/70 mb-3">Developer Partnership</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Built on Trust.<br />
                <span className="text-[#F3CF92]">Backed by Performance.</span>
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-4">
                We collaborate with developers who meet our standards for quality, delivery, and investment value.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-10">
                Whether you're buying into a project or planning to build, we ensure you're working with the right people.
              </p>
              <a
                href="#/contact"
                className="inline-flex items-center gap-2 bg-[#F3CF92] text-[#134137] px-8 py-4 rounded-lg font-bold text-base hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg self-start"
              >
                Speak to an Advisor
              </a>
            </div>

            <div className="bg-[#F3CF92]/10 p-12 flex flex-col justify-center gap-6">
              {[
                { label: 'Quality Standards', desc: 'Every partner meets rigorous build and finish benchmarks before we recommend them.' },
                { label: 'On-Time Delivery', desc: 'We vet developers on their track record of meeting timelines and commitments.' },
                { label: 'Long-Term Returns', desc: 'Our advisory is tied to your investment performance, not just the transaction.' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-[#F3CF92] mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">{label}</p>
                    <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CLOSING CTA ───────────────────────────────────────── */}
        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <Home className="w-16 h-16 text-[#F3CF92] mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-[#134137] mb-4">Your Property Journey Starts Here</h3>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-8">
            Whether you're buying your first home, investing in real estate, or searching for your dream property, JayneLuxe delivers the expertise, integrity, and personalized service you deserve. Let's make your property goals a reality.
          </p>
          <a
            href="#/contact"
            className="inline-block bg-[#F3CF92] text-[#134137] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-md"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
};
