import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  Search, MapPin, TrendingUp, Award,
  Building2, Users, Shield, Globe,
  Key, Lightbulb, BarChart3, Handshake,
  ArrowRight, MessageCircle, Phone,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PropertyWithImages } from '../lib/database.types';
import { PropertyCard } from '../components/PropertyCard';

/* ─── Scroll-triggered animation hook ─────────────────────────── */
const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

/* ─── Animated section wrapper ────────────────────────────────── */
const AnimatedSection = ({
  children,
  className = '',
  animation = 'animate-fade-in-up',
  threshold = 0.15,
}: {
  children: ReactNode;
  className?: string;
  animation?: string;
  threshold?: number;
}) => {
  const { ref, inView } = useInView(threshold);
  return (
    <div ref={ref} className={`${className} ${inView ? animation : 'opacity-0'}`}>
      {children}
    </div>
  );
};

/* ─── Staggered card wrapper ──────────────────────────────────── */
const StaggerCard = ({
  children,
  delay,
  inView,
  animation = 'animate-fade-in-up',
}: {
  children: ReactNode;
  delay: string;
  inView: boolean;
  animation?: string;
}) => (
  <div className={`${delay} ${inView ? animation : 'opacity-0'}`}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<PropertyWithImages[]>([]);
  const [heroSlide, setHeroSlide] = useState(0);

  const heroImages = [
    '/whatsapp_image_2025-12-13_at_4.12.08_pm.jpeg',
    '/tela6348.jpg',
    '/tela6331.jpg',
  ];

  useEffect(() => {
    supabase
      .from('properties')
      .select('*, property_images (*)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setFeaturedProperties(data || []));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) sessionStorage.setItem('propertySearch', searchQuery.trim());
    window.location.hash = '/properties';
  };

  /* Section refs */
  const servicesRef   = useInView(0.1);
  const whyRef        = useInView(0.1);
  const serveRef      = useInView(0.1);
  const devRef        = useInView(0.1);
  const ctaRef        = useInView(0.1);

  const services = [
    { icon: Building2,   label: 'Luxury Residential & Commercial Property Sales' },
    { icon: BarChart3,   label: 'Real Estate Investment Advisory' },
    { icon: Users,       label: 'Buyer & Seller Representation' },
    { icon: TrendingUp,  label: 'Property Marketing & Sales Strategy' },
    { icon: Key,         label: 'Off-Market Property Access' },
  ];

  const reasons = [
    {
      icon: Lightbulb,
      title: 'Informed Decisions, Not Pressure',
      body: `We break down every detail—location potential, pricing trends, and long-term value—so you're never guessing.`,
    },
    {
      icon: BarChart3,
      title: 'ROI-Driven Advisory',
      body: 'Every recommendation is tied to one thing: your return. Not our listings.',
    },
    {
      icon: Globe,
      title: 'Access Beyond Our Listings',
      body: 'We source opportunities across the market, including off-market deals that align with your goals.',
    },
    {
      icon: Shield,
      title: 'Strategic Honesty',
      body: `Sometimes the best move is to wait—or not sell. We'll tell you that.`,
    },
  ];

  const audiences = [
    {
      icon: BarChart3,
      title: 'Investors',
      body: 'Data-backed opportunities. Strong appreciation potential. Smart entry points.',
    },
    {
      icon: Globe,
      title: 'Diaspora Buyers',
      body: 'Transparent processes. Verified properties. Trusted representation on ground.',
    },
    {
      icon: Award,
      title: 'Luxury Homeowners',
      body: 'Discreet service. Premium listings. Elevated buying and selling experience.',
    },
    {
      icon: Key,
      title: 'First-Time Buyers',
      body: 'Clarity, guidance, and confidence from search to ownership.',
    },
  ];

  const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-[680px] text-white overflow-hidden bg-gray-900">

        {/* Sliding image track */}
        <div
          className="absolute inset-0 flex transition-transform duration-[1200ms] ease-in-out"
          style={{ transform: `translateX(-${heroSlide * 100}%)` }}
        >
          {heroImages.map((src, i) => (
            <div key={i} className="min-w-full h-full flex-shrink-0">
              <img
                src={src}
                alt={`Jayne Luxe Realty ${i + 1}`}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.68)' }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-[1]" />

        {/* Slide indicators */}
        <div className="absolute bottom-20 right-8 z-20 flex items-center gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-500 rounded-full ${
                i === heroSlide
                  ? 'w-8 h-2.5 bg-[#F3CF92]'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10">
          <div className="max-w-2xl w-full">

            <h1 className="animate-fade-in-up delay-200 text-3xl md:text-[2.6rem] font-bold mb-4 leading-snug">
              Selling Luxury Homes &amp; Properties
              <span className="block text-[#F3CF92] mt-1">Where Peace of Mind</span>
              <span className="block">Is Assured</span>
            </h1>

            <p className="animate-fade-in delay-300 font-display text-lg md:text-xl mb-9 text-[#F3CF92]/90 italic tracking-wide">
              "We Give Your Dream an Address"
            </p>

            <form onSubmit={handleSearch} className="animate-fade-in-up delay-400 mb-7">
              <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden max-w-xl">
                <div className="flex-1 flex items-center px-5 py-3.5">
                  <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search location, property type…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-gray-700 text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#F3CF92] text-[#134137] px-7 py-3.5 font-bold text-base hover:bg-[#e6c07f] transition-all rounded-full"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="animate-fade-in-up delay-500 flex flex-wrap gap-4">
              <a
                href="#/properties"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/70 px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-white/20 hover:border-white transition-all hover:scale-105 shadow-lg"
              >
                Explore All Properties <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#/contact"
                className="inline-flex items-center gap-2 bg-[#F3CF92] text-[#134137] px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg"
              >
                Book a Call
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* ── ABOUT / PARTNER ───────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">

            <AnimatedSection animation="animate-fade-in-left" className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/tela6360-copy.jpg"
                alt="Your JayneLuxe Real Estate Professional"
                className="w-full h-full object-cover"
              />
            </AnimatedSection>

            <AnimatedSection animation="animate-fade-in-right">
              <h2 className="text-4xl font-bold text-[#134137] mb-6">Your Trusted Real Estate Partner</h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Welcome to JayneLuxe Realty. With years of expertise in Nigeria's luxury property market, we deliver exceptional service built on three foundational pillars.
              </p>
              <div className="space-y-6">
                {[
                  { icon: MapPin,      title: 'Integrity First',           body: 'Every transaction is handled with complete transparency and honesty, ensuring your trust is never compromised.' },
                  { icon: TrendingUp,  title: 'Peace of Mind Guaranteed',  body: 'Navigate your property journey with confidence. We handle every detail so you can focus on your future.' },
                  { icon: Award,       title: 'Precision in Every Detail', body: 'From market analysis to closing, meticulous attention ensures optimal outcomes for your investment.' },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#134137]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#134137] mb-1">{title}</h3>
                      <p className="text-gray-600">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="#/about"
                className="inline-block mt-8 bg-[#F3CF92] text-[#134137] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg"
              >
                Learn More About Us
              </a>
            </AnimatedSection>
          </div>

          {/* Pillars */}
          <div ref={servicesRef.ref} className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin,     title: 'Integrity',     body: 'Access to the most desirable neighborhoods and communities' },
              { icon: TrendingUp, title: 'Peace of Mind', body: 'Competitive pricing and exceptional value for your investment' },
              { icon: Award,      title: 'Precision',     body: 'Award-winning service and support throughout your journey' },
            ].map(({ icon: Icon, title, body }, i) => (
              <StaggerCard key={title} delay={delays[i]} inView={servicesRef.inView}>
                <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#134137]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#134137] mb-2">{title}</h3>
                  <p className="text-gray-600">{body}</p>
                </div>
              </StaggerCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ───────────────────────────────── */}
      {featuredProperties.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#134137] mb-3">Hand-Picked For You</p>
              <h2 className="text-4xl font-bold text-[#134137] mb-4">Featured Properties</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                A curated selection of our finest available listings.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => { window.location.hash = `/property/${property.id}`; }}
                />
              ))}
            </div>

            <div className="text-center">
              <a
                href="#/properties"
                className="inline-flex items-center gap-2 bg-[#134137] text-white px-10 py-4 rounded-full font-bold text-base hover:bg-[#0d2e24] transition-all hover:scale-105 shadow-lg"
              >
                See All Properties <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── OUR SERVICES ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <AnimatedSection className="text-center mb-14">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#134137] mb-3">What We Do</p>
            <h2 className="text-4xl font-bold text-[#134137] mb-4">Our Services</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              End-to-end real estate expertise — from your first search to a closed deal.
            </p>
          </AnimatedSection>

          <div ref={whyRef.ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon: Icon, label }, i) => (
              <StaggerCard key={label} delay={delays[i]} inView={whyRef.inView} animation="animate-scale-in">
                <div className="group flex items-start gap-4 bg-white hover:bg-[#134137] border border-gray-200 hover:border-[#134137] rounded-2xl p-6 transition-all duration-300 cursor-default shadow-sm hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-[#F3CF92]/30 group-hover:bg-[#F3CF92]/20 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-[#134137] group-hover:text-[#F3CF92] transition-colors duration-300" />
                  </div>
                  <p className="text-gray-700 group-hover:text-white font-medium leading-snug mt-1 transition-colors duration-300">{label}</p>
                </div>
              </StaggerCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CLIENTS CHOOSE US ─────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <AnimatedSection className="text-center mb-14">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#134137] mb-3">Our Edge</p>
            <h2 className="text-4xl font-bold text-[#134137] mb-4">Why Clients Choose Us</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              We don't just sell properties — we earn trust one honest conversation at a time.
            </p>
          </AnimatedSection>

          <div ref={serveRef.ref} className="grid sm:grid-cols-2 gap-6">
            {reasons.map(({ icon: Icon, title, body }, i) => (
              <StaggerCard key={title} delay={delays[i]} inView={serveRef.inView}>
                <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#F3CF92] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-[#F3CF92]/20 group-hover:bg-[#F3CF92]/40 flex items-center justify-center mb-5 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-[#134137]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#134137] mb-3">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{body}</p>
                </div>
              </StaggerCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <AnimatedSection className="text-center mb-14">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#134137] mb-3">Our Clients</p>
            <h2 className="text-4xl font-bold text-[#134137] mb-4">Who We Serve</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every client is different. Our approach matches yours.
            </p>
          </AnimatedSection>

          <div ref={devRef.ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map(({ icon: Icon, title, body }, i) => (
              <StaggerCard key={title} delay={delays[i]} inView={devRef.inView} animation="animate-scale-in">
                <div className="group text-center bg-gray-50 hover:bg-[#134137] rounded-2xl p-8 border border-gray-200 hover:border-[#134137] transition-all duration-400 hover:-translate-y-2 shadow-sm hover:shadow-xl cursor-default">
                  <div className="w-16 h-16 rounded-full bg-[#F3CF92]/20 group-hover:bg-[#F3CF92]/20 flex items-center justify-center mx-auto mb-5 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-[#134137] group-hover:text-[#F3CF92] transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-[#134137] group-hover:text-[#F3CF92] mb-3 transition-colors duration-300">{title}</h3>
                  <p className="text-gray-500 group-hover:text-white/80 text-sm leading-relaxed transition-colors duration-300">{body}</p>
                </div>
              </StaggerCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEVELOPER PARTNERSHIPS ────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            <AnimatedSection animation="animate-fade-in-left">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#134137] mb-3">Trusted Partners</p>
              <h2 className="text-4xl font-bold text-[#134137] mb-6">Developer Partnerships</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We work with trusted developers to give our clients access to projects with real value — not just hype.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Whether you're buying off-plan or looking to build, we connect you to partners who deliver on quality, timelines, and long-term returns.
              </p>
              <a
                href="#/contact"
                className="inline-flex items-center gap-2 bg-[#134137] text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-[#0d2e24] transition-all hover:scale-105 shadow-lg"
              >
                Explore Partnerships <ArrowRight className="w-5 h-5" />
              </a>
            </AnimatedSection>

            <AnimatedSection animation="animate-fade-in-right">
              <div className="grid grid-cols-2 gap-5">
                {[
                  { icon: Handshake,  label: 'Trusted Developers' },
                  { icon: Award,      label: 'Quality Assured' },
                  { icon: TrendingUp, label: 'Long-term Returns' },
                  { icon: Shield,     label: 'Off-Plan Access' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#F3CF92] hover:shadow-lg transition-all duration-300 text-center group">
                    <div className="w-12 h-12 bg-[#F3CF92]/20 group-hover:bg-[#F3CF92]/40 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[#134137]" />
                    </div>
                    <p className="text-sm font-semibold text-[#134137]">{label}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section ref={ctaRef.ref} className="relative py-28 bg-[#134137] overflow-hidden">
        {/* Decorative background rings */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#F3CF92]/10 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-[#F3CF92]/10 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-[#F3CF92]/10 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">

          <StaggerCard delay="delay-100" inView={ctaRef.inView} animation="animate-fade-in">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#F3CF92]/70 mb-4">
              Ready to Move?
            </p>
          </StaggerCard>

          <StaggerCard delay="delay-200" inView={ctaRef.inView} animation="animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Make Your Next Property Move
              <span className="block text-[#F3CF92]">With Clarity.</span>
            </h2>
          </StaggerCard>

          <StaggerCard delay="delay-300" inView={ctaRef.inView} animation="animate-fade-in">
            <p className="font-display text-xl text-white/70 mb-10 italic">
              Let's give your Dream an Address.
            </p>
          </StaggerCard>

          <StaggerCard delay="delay-400" inView={ctaRef.inView} animation="animate-fade-in-up">
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#/contact"
                className="inline-flex items-center gap-2 bg-[#F3CF92] text-[#134137] px-8 py-4 rounded-full font-bold text-base hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-xl"
              >
                <Phone className="w-5 h-5" />
                Book a Consultation
              </a>
              <a
                href="#/contact"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold text-base hover:bg-white/20 hover:border-white/60 transition-all hover:scale-105 shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Speak on WhatsApp
              </a>
            </div>
          </StaggerCard>
        </div>
      </section>

    </div>
  );
};
