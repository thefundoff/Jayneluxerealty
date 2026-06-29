import { useState, useEffect, useRef } from 'react';
import { Send, Star, MessageSquare, QrCode, Download, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase';
import type { ProspectFormField, ProspectSocialLink, ProspectReview } from '../lib/database.types';

type AnswerValue = string | string[];

// Brand-accurate single-path SVGs (lucide dropped brand glyphs in recent versions).
const SOCIAL_PATHS: Record<string, string> = {
  facebook:
    'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  instagram:
    'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  tiktok:
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  whatsapp:
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z',
};

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
};

const SocialIcon = ({ platform }: { platform: string }) => {
  const path = SOCIAL_PATHS[platform];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
      <path d={path} />
    </svg>
  );
};

const inputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all';

export const Prospect = () => {
  const [fields, setFields] = useState<ProspectFormField[]>([]);
  const [socials, setSocials] = useState<ProspectSocialLink[]>([]);
  const [reviews, setReviews] = useState<ProspectReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [review, setReview] = useState({ name: '', rating: 0, review: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [qrDataUrl, setQrDataUrl] = useState('');

  // Spam guards (lightweight, no third-party): honeypot + minimum time-on-page.
  const honeypotRef = useRef('');
  const mountedAt = useRef(Date.now());

  const pageUrl = `${window.location.origin}${window.location.pathname}#/prospect`;

  useEffect(() => {
    const load = async () => {
      const [fieldsRes, socialRes, settingRes] = await Promise.all([
        supabase.from('prospect_form_fields').select('*').eq('is_enabled', true).order('sort_order'),
        supabase.from('prospect_social_links').select('*').eq('is_enabled', true).order('sort_order'),
        supabase.from('prospect_settings').select('value').eq('key', 'reviews_public').maybeSingle(),
      ]);

      if (fieldsRes.data) setFields(fieldsRes.data);
      if (socialRes.data) setSocials(socialRes.data.filter((s) => s.url && s.url.trim() !== ''));

      const reviewsPublic = settingRes.data ? settingRes.data.value !== false : true;
      if (reviewsPublic) {
        const { data } = await supabase
          .from('prospect_reviews')
          .select('*')
          .eq('status', 'approved')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(12);
        if (data) setReviews(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    QRCode.toDataURL(pageUrl, { width: 320, margin: 2, color: { dark: '#134137', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [pageUrl]);

  const setAnswer = (id: string, value: AnswerValue) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const toggleCheckbox = (id: string, option: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
      return { ...prev, [id]: next };
    });
  };

  const isAnswered = (field: ProspectFormField): boolean => {
    const v = answers[field.id];
    if (field.field_type === 'checkbox') return Array.isArray(v) && v.length > 0;
    return typeof v === 'string' && v.trim() !== '';
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot? Pretend success without persisting so we don't tip off scrapers.
    if (honeypotRef.current !== '' || Date.now() - mountedAt.current < 2500) {
      setFormSubmitted(true);
      return;
    }

    const missing = fields.find((f) => f.is_required && !isAnswered(f));
    if (missing) {
      setFormError(`Please complete the required field: "${missing.label}".`);
      return;
    }

    setFormError('');
    setFormSubmitting(true);

    const roleValue = (role: string): string | null => {
      const field = fields.find((f) => f.field_role === role);
      if (!field) return null;
      const v = answers[field.id];
      return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
    };

    const { error } = await supabase.from('prospect_submissions').insert({
      full_name: roleValue('name'),
      phone: roleValue('phone'),
      email: roleValue('email'),
      answers,
    });

    setFormSubmitting(false);
    if (error) {
      setFormError('Something went wrong submitting your details. Please try again.');
      return;
    }
    setFormSubmitted(true);
    setAnswers({});
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (review.review.trim() === '') {
      setReviewError('Please write your review before submitting.');
      return;
    }
    setReviewError('');
    setReviewSubmitting(true);
    const { error } = await supabase.from('prospect_reviews').insert({
      name: review.name.trim() || null,
      rating: review.rating > 0 ? review.rating : null,
      review: review.review.trim(),
    });
    setReviewSubmitting(false);
    if (error) {
      setReviewError('Something went wrong submitting your review. Please try again.');
      return;
    }
    setReviewSubmitted(true);
    setReview({ name: '', rating: 0, review: '' });
  };

  const renderField = (field: ProspectFormField) => {
    const value = answers[field.id];
    const stringValue = typeof value === 'string' ? value : '';
    const labelEl = (
      <label htmlFor={field.id} className="block text-sm font-medium text-[#134137] mb-2">
        {field.label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );

    switch (field.field_type) {
      case 'long_text':
        return (
          <div key={field.id}>
            {labelEl}
            <textarea
              id={field.id}
              rows={4}
              value={stringValue}
              placeholder={field.placeholder || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
        );
      case 'dropdown':
        return (
          <div key={field.id}>
            {labelEl}
            <select id={field.id} value={stringValue} onChange={(e) => setAnswer(field.id, e.target.value)} className={inputClass}>
              <option value="">Select an option…</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      case 'radio':
        return (
          <div key={field.id}>
            {labelEl}
            <div className="space-y-2">
              {field.options.map((opt) => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt}
                    checked={stringValue === opt}
                    onChange={() => setAnswer(field.id, opt)}
                    className="w-4 h-4 text-[#134137] focus:ring-[#F3CF92]"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'checkbox': {
        const arr = Array.isArray(value) ? value : [];
        return (
          <div key={field.id}>
            {labelEl}
            <div className="grid sm:grid-cols-2 gap-2">
              {field.options.map((opt) => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={arr.includes(opt)}
                    onChange={() => toggleCheckbox(field.id, opt)}
                    className="w-4 h-4 rounded text-[#134137] focus:ring-[#F3CF92]"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        );
      }
      default: {
        const typeMap: Record<string, string> = { email: 'email', phone: 'tel', number: 'number', date: 'date' };
        return (
          <div key={field.id}>
            {labelEl}
            <input
              type={typeMap[field.field_type] || 'text'}
              id={field.id}
              value={stringValue}
              placeholder={field.placeholder || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              className={inputClass}
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-[#134137] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Let's Find Your Perfect Property</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tell us a little about what you're looking for and our team will be in touch with tailored opportunities.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* A. Dynamic data collection form */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          {formSubmitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#134137] mb-2">Thank You!</h3>
              <p className="text-gray-600">
                We've received your details. A member of the Jayne Luxe Realty team will reach out to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <h2 className="text-3xl font-bold text-[#134137] mb-2">Property Interest Form</h2>
              {loading && <p className="text-gray-500">Loading form…</p>}

              {formError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              )}

              {fields.map(renderField)}

              {/* Honeypot: hidden from real users, catches bots that fill every field. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                onChange={(e) => (honeypotRef.current = e.target.value)}
                className="absolute left-[-9999px] w-px h-px opacity-0"
              />

              {!loading && fields.length > 0 && (
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-[#F3CF92] text-[#134137] py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className={`w-5 h-5 ${formSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{formSubmitting ? 'Submitting…' : 'Submit'}</span>
                </button>
              )}
            </form>
          )}
        </section>

        {/* B. Customer review section */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-[#134137]" />
            </div>
            <h2 className="text-3xl font-bold text-[#134137]">Leave a Review</h2>
          </div>

          {reviewSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-[#134137] mb-1">Thank you for your feedback!</h3>
              <p className="text-gray-600">Your review has been submitted and will appear once approved.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              {reviewError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{reviewError}</p>
                </div>
              )}

              <div>
                <label htmlFor="review-name" className="block text-sm font-medium text-[#134137] mb-2">
                  Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={review.name}
                  onChange={(e) => setReview({ ...review, name: e.target.value })}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-[#134137] mb-2">
                  Rating <span className="text-gray-400 font-normal">(optional)</span>
                </span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReview({ ...review, rating: star === review.rating ? 0 : star })}
                      className="p-1"
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= review.rating ? 'fill-[#F3CF92] text-[#F3CF92]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-text" className="block text-sm font-medium text-[#134137] mb-2">
                  Review / Complaint
                </label>
                <textarea
                  id="review-text"
                  rows={4}
                  value={review.review}
                  onChange={(e) => setReview({ ...review, review: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="Share your experience with us…"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-[#134137] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#0d2d26] transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className={`w-5 h-5 ${reviewSubmitting ? 'animate-pulse' : ''}`} />
                <span>{reviewSubmitting ? 'Submitting…' : 'Submit Review'}</span>
              </button>
            </form>
          )}

          {reviews.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-[#134137] mb-4">What Our Clients Say</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-gray-50 rounded-lg p-4">
                    {r.rating && (
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= (r.rating || 0) ? 'fill-[#F3CF92] text-[#F3CF92]' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-gray-700 text-sm mb-2">"{r.review}"</p>
                    <p className="text-[#134137] font-semibold text-sm">{r.name || 'Anonymous'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* C. Social media section */}
        {socials.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-[#134137] mb-6">Connect With Us</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LABELS[s.platform] || s.platform}
                  title={SOCIAL_LABELS[s.platform] || s.platform}
                  className="w-12 h-12 rounded-full bg-[#134137] text-white flex items-center justify-center hover:bg-[#F3CF92] hover:text-[#134137] transition-all hover:scale-110 shadow-md"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* D. QR code */}
        {qrDataUrl && (
          <section className="bg-gradient-to-br from-[#134137] to-[#0d2d26] text-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <QrCode className="w-6 h-6 text-[#F3CF92]" />
              <h2 className="text-2xl font-bold">Share This Page</h2>
            </div>
            <p className="text-gray-300 mb-6">Scan or share the QR code to open this form on any device.</p>
            <div className="inline-block bg-white p-4 rounded-xl">
              <img src={qrDataUrl} alt="QR code linking to this page" className="w-48 h-48" />
            </div>
            <div className="mt-6">
              <a
                href={qrDataUrl}
                download="jayne-luxe-realty-qr.png"
                className="inline-flex items-center space-x-2 bg-[#F3CF92] text-[#134137] py-3 px-6 rounded-lg font-bold hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Download QR Code</span>
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
