import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Users, Star, Briefcase, Upload, Send, MapPin,
  CheckCircle, X, ChevronDown, ChevronUp, Calendar, DollarSign,
  Eye, ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { JobOpening } from '../lib/database.types';

const benefits = [
  { icon: TrendingUp, title: 'Career Growth', description: 'Clear advancement paths and mentorship from industry leaders in Nigerian real estate.' },
  { icon: Star, title: 'Competitive Commission', description: 'Industry-leading commission structure with performance bonuses and incentives.' },
  { icon: Users, title: 'Collaborative Culture', description: 'A supportive team environment where every voice is heard and ideas are celebrated.' },
  { icon: Calendar, title: 'Work-Life Balance', description: 'Flexible schedules that respect your time and help you thrive inside and outside of work.' },
];

const TYPE_COLORS: Record<string, string> = {
  'Full-time': 'bg-green-100 text-green-700',
  'Part-time': 'bg-blue-100 text-blue-700',
  'Contract': 'bg-orange-100 text-orange-700',
};

const EXP_COLORS: Record<string, string> = {
  'Entry-Level': 'bg-purple-100 text-purple-700',
  'Mid-Level': 'bg-yellow-100 text-yellow-700',
  'Senior': 'bg-red-100 text-red-700',
  'Manager': 'bg-gray-200 text-gray-700',
};

const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function parseLines(text: string | null): string[] {
  if (!text) return [];
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('resumes').upload(name, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(error.message);
  return name;
}

function validateFile(file: File): string {
  if (!ALLOWED_MIME.includes(file.type)) return 'Only PDF, DOC, or DOCX files are accepted.';
  if (file.size > 5 * 1024 * 1024) return 'File size must not exceed 5 MB.';
  return '';
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────
const JobDetailModal = ({ job, onClose, onApply }: { job: JobOpening; onClose: () => void; onApply: () => void }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
      <div className="bg-[#134137] text-white p-6 rounded-t-2xl flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1">{job.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {job.department && <span className="text-gray-300 text-sm">{job.department}</span>}
            {job.location && (
              <span className="flex items-center gap-1 text-gray-300 text-sm">
                <MapPin className="w-3 h-3" />{job.location}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${TYPE_COLORS[job.type] || 'bg-gray-100 text-gray-600'}`}>{job.type}</span>
            {job.experience_level && <span className={`text-xs font-bold px-2 py-1 rounded-full ${EXP_COLORS[job.experience_level] || 'bg-gray-100 text-gray-600'}`}>{job.experience_level}</span>}
            {job.salary_range && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-[#F3CF92]/20 text-[#F3CF92]">
                <DollarSign className="w-3 h-3" />{job.salary_range}
              </span>
            )}
          </div>
          {job.application_deadline && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />Deadline: {new Date(job.application_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <button onClick={onClose} className="text-white hover:text-[#F3CF92] transition-colors ml-4 flex-shrink-0">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {(job.full_description || job.short_description || job.description) && (
          <div>
            <h3 className="font-bold text-[#134137] text-lg mb-2">About the Role</h3>
            <p className="text-gray-600 leading-relaxed">{job.full_description || job.short_description || job.description}</p>
          </div>
        )}

        {parseLines(job.responsibilities).length > 0 && (
          <div>
            <h3 className="font-bold text-[#134137] text-lg mb-2">Responsibilities</h3>
            <ul className="space-y-1">
              {parseLines(job.responsibilities).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="w-1.5 h-1.5 bg-[#F3CF92] rounded-full mt-2 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {parseLines(job.requirements).length > 0 && (
          <div>
            <h3 className="font-bold text-[#134137] text-lg mb-2">Requirements</h3>
            <ul className="space-y-1">
              {parseLines(job.requirements).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#134137] mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {parseLines(job.benefits_list).length > 0 && (
          <div>
            <h3 className="font-bold text-[#134137] text-lg mb-2">Benefits</h3>
            <ul className="space-y-1">
              {parseLines(job.benefits_list).map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                  <Star className="w-4 h-4 text-[#F3CF92] mt-0.5 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.commission_details && (
          <div>
            <h3 className="font-bold text-[#134137] text-lg mb-2">Commission Structure</h3>
            <p className="text-gray-600 text-sm">{job.commission_details}</p>
          </div>
        )}

        <button
          onClick={onApply}
          className="w-full bg-[#F3CF92] text-[#134137] py-3 rounded-xl font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-md"
        >
          Apply for This Role
        </button>
      </div>
    </div>
  </div>
);

// ─── File Upload Field ────────────────────────────────────────────────────────
const FileField = ({
  id, label, required, file, error, onChange,
}: {
  id: string; label: string; required?: boolean; file: File | null; error: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[#134137] mb-2">
      {label} {required ? '*' : <span className="text-gray-400 font-normal">(Optional)</span>}
      <span className="text-gray-400 font-normal text-xs ml-1">PDF, DOC, DOCX — max 5 MB</span>
    </label>
    <div className={`border-2 border-dashed rounded-lg p-3 transition-colors ${error ? 'border-red-400 bg-red-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#F3CF92]'}`}>
      <input type="file" id={id} accept=".pdf,.doc,.docx" onChange={onChange} className="hidden" />
      <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
        <Upload className={`w-6 h-6 flex-shrink-0 ${file ? 'text-green-500' : 'text-gray-400'}`} />
        <span className={`text-sm truncate ${file ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
          {file ? file.name : 'Click to upload'}
        </span>
      </label>
    </div>
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Careers = () => {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loadingOpenings, setLoadingOpenings] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterExp, setFilterExp] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '',
    position: '', jobOpeningId: '',
    yearsExperience: '', linkedinUrl: '', portfolioUrl: '',
    consent: false,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState('');
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [coverLetterError, setCoverLetterError] = useState('');
  const [supportingDocFile, setSupportingDocFile] = useState<File | null>(null);
  const [supportingDocError, setSupportingDocError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  const [genForm, setGenForm] = useState({ name: '', email: '', areaOfInterest: '', notes: '' });
  const [genCvFile, setGenCvFile] = useState<File | null>(null);
  const [genCvError, setGenCvError] = useState('');
  const [genSubmitted, setGenSubmitted] = useState(false);
  const [genSending, setGenSending] = useState(false);
  const [genError, setGenError] = useState('');

  const openingsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const genFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('job_openings')
      .select('*')
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setOpenings((data as JobOpening[]) || []);
        setLoadingOpenings(false);
      });
  }, []);

  const filteredOpenings = openings.filter(o => {
    if (filterDept && o.department !== filterDept) return false;
    if (filterType && o.type !== filterType) return false;
    if (filterLocation && o.location !== filterLocation) return false;
    if (filterExp && o.experience_level !== filterExp) return false;
    return true;
  });

  const departments = [...new Set(openings.map(o => o.department).filter(Boolean))] as string[];
  const types = [...new Set(openings.map(o => o.type).filter(Boolean))] as string[];
  const locations = [...new Set(openings.map(o => o.location).filter(Boolean))] as string[];
  const expLevels = [...new Set(openings.map(o => o.experience_level).filter(Boolean))] as string[];

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

  const applyToJob = (opening: JobOpening) => {
    setSelectedJob(null);
    setFormData(prev => ({ ...prev, position: opening.title, jobOpeningId: opening.id }));
    scrollTo(formRef);
  };

  const makeFileHandler = (
    setter: (f: File | null) => void,
    errSetter: (e: string) => void,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    errSetter('');
    if (!file) { setter(null); return; }
    const err = validateFile(file);
    if (err) { errSetter(err); setter(null); e.target.value = ''; return; }
    setter(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) { setCvError('Please attach your CV/Resume.'); return; }
    if (!formData.consent) { setFormError('Please confirm that the information provided is accurate.'); return; }
    setSending(true);
    setFormError('');
    try {
      const resumeUrl = await uploadFile(cvFile, 'applications');
      let coverLetterUrl: string | null = null;
      let supportingDocUrl: string | null = null;
      if (coverLetterFile) coverLetterUrl = await uploadFile(coverLetterFile, 'cover-letters');
      if (supportingDocFile) supportingDocUrl = await uploadFile(supportingDocFile, 'supporting-docs');

      const { error } = await supabase.from('job_applications').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || null,
        position: formData.position,
        job_opening_id: formData.jobOpeningId || null,
        years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
        linkedin_url: formData.linkedinUrl || null,
        portfolio_url: formData.portfolioUrl || null,
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        supporting_doc_url: supportingDocUrl,
        consent_given: formData.consent,
      });
      if (error) throw new Error('Failed to submit application. Please try again.');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', address: '', position: '', jobOpeningId: '', yearsExperience: '', linkedinUrl: '', portfolioUrl: '', consent: false });
        setCvFile(null);
        setCoverLetterFile(null);
        setSupportingDocFile(null);
      }, 7000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setSending(false);
    }
  };

  const handleGenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genCvFile) { setGenCvError('Please attach your CV.'); return; }
    setGenSending(true);
    setGenError('');
    try {
      const resumeUrl = await uploadFile(genCvFile, 'general-applications');
      const { error } = await supabase.from('general_applications').insert({
        name: genForm.name,
        email: genForm.email,
        resume_url: resumeUrl,
        area_of_interest: genForm.areaOfInterest || null,
        notes: genForm.notes || null,
      });
      if (error) throw new Error('Failed to submit. Please try again.');
      setGenSubmitted(true);
      setTimeout(() => {
        setGenSubmitted(false);
        setGenForm({ name: '', email: '', areaOfInterest: '', notes: '' });
        setGenCvFile(null);
      }, 7000);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setGenSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => applyToJob(selectedJob)}
        />
      )}

      {/* ── Hero ── */}
      <div className="bg-[#134137] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-[#F3CF92] rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-[#134137]" />
          </div>
          <p className="text-[#F3CF92] font-semibold tracking-widest text-sm uppercase mb-3">
            Careers at JAYNE LUXE REALTY
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            Build Your Career in<br className="hidden md:block" /> Luxury Real Estate
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Join a forward-thinking real estate brand committed to excellence, innovation, premium client experiences, and professional growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollTo(openingsRef)}
              className="bg-[#F3CF92] text-[#134137] px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg"
            >
              View Open Positions
            </button>
            <button
              onClick={() => scrollTo(genFormRef)}
              className="border-2 border-[#F3CF92] text-[#F3CF92] px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#F3CF92] hover:text-[#134137] transition-all hover:scale-105"
            >
              Submit General Application
            </button>
          </div>
        </div>
      </div>

      {/* ── Why Work With Us ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#134137] mb-4">Why Work With Us?</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            At Jayne Luxe Realty, we invest in our people just as much as we invest in premium properties.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-14 h-14 bg-[#F3CF92] rounded-xl flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-7 h-7 text-[#134137]" />
              </div>
              <h3 className="font-bold text-[#134137] text-lg mb-2">{b.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Open Positions ── */}
      <div ref={openingsRef} className="bg-white py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#134137] mb-3">Open Positions</h2>
            <p className="text-gray-600 text-lg">Find the role that fits your skills and ambitions.</p>
          </div>

          {/* Filters */}
          {!loadingOpenings && openings.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white"
              >
                <option value="">All Employment Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white"
              >
                <option value="">All Locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select
                value={filterExp}
                onChange={(e) => setFilterExp(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white"
              >
                <option value="">All Experience Levels</option>
                {expLevels.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}

          {loadingOpenings ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 rounded-xl h-52 animate-pulse" />)}
            </div>
          ) : filteredOpenings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {openings.length === 0 ? 'No open positions right now.' : 'No positions match your filters.'}
              </p>
              <p className="text-gray-400 mt-2">Submit a general application and we'll reach out when a role opens up.</p>
              <button
                onClick={() => scrollTo(genFormRef)}
                className="mt-6 bg-[#F3CF92] text-[#134137] px-6 py-2 rounded-lg font-bold hover:bg-[#e6c07f] transition-colors"
              >
                Submit General Application
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpenings.map(opening => (
                <div key={opening.id} className={`bg-gray-50 border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col ${opening.featured ? 'border-[#F3CF92] ring-1 ring-[#F3CF92]' : 'border-gray-200'}`}>
                  {opening.featured && (
                    <span className="text-xs font-bold text-[#134137] bg-[#F3CF92] px-2 py-0.5 rounded-full self-start mb-3">Featured</span>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-[#134137] text-lg leading-snug flex-1 pr-2">{opening.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${TYPE_COLORS[opening.type] || 'bg-gray-100 text-gray-600'}`}>
                      {opening.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {opening.department && <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{opening.department}</span>}
                    {opening.experience_level && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${EXP_COLORS[opening.experience_level] || 'bg-gray-100 text-gray-600'}`}>{opening.experience_level}</span>}
                  </div>

                  {opening.location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{opening.location}</span>
                    </div>
                  )}

                  {opening.salary_range && (
                    <div className="flex items-center space-x-1 text-sm text-[#134137] font-semibold mb-2">
                      <DollarSign className="w-4 h-4 flex-shrink-0 text-[#F3CF92]" />
                      <span>{opening.salary_range}</span>
                    </div>
                  )}

                  {(opening.short_description || opening.description) && (
                    <p className="text-sm text-gray-600 mb-4 flex-1 leading-relaxed line-clamp-2">
                      {opening.short_description || opening.description}
                    </p>
                  )}

                  {opening.application_deadline && (
                    <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline: {new Date(opening.application_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}

                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => setSelectedJob(opening)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#134137] text-[#134137] py-2 rounded-lg font-semibold text-sm hover:bg-[#134137] hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {opening.accept_applications && (
                      <button
                        onClick={() => applyToJob(opening)}
                        className="flex-1 bg-[#134137] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#0d2e24] transition-colors"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Application Form ── */}
      <div ref={formRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info Column */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#134137] mb-4">Apply to Join Us</h2>
              <p className="text-gray-600 text-lg">
                Whether you're applying for a specific opening or sending a general application, fill in the form below and attach your CV — we review every submission.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-5 bg-white rounded-xl shadow-md">
                <div className="w-10 h-10 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#134137]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#134137] mb-1">Every Application is Reviewed</h4>
                  <p className="text-gray-600 text-sm">We personally review each submission and respond to shortlisted candidates within 5–7 business days.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-5 bg-white rounded-xl shadow-md">
                <div className="w-10 h-10 bg-[#F3CF92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 text-[#134137]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#134137] mb-1">CV Required</h4>
                  <p className="text-gray-600 text-sm">Attach your CV/Resume in PDF, DOC, or DOCX format (max 5 MB).</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#134137] to-[#0d2d26] text-white p-8 rounded-xl">
              <h3 className="text-xl font-bold mb-3">Have questions?</h3>
              <p className="text-gray-200 text-sm">
                Reach out at{' '}
                <a href="mailto:jayneluxerealty@gmail.com" className="text-[#F3CF92] hover:underline">
                  jayneluxerealty@gmail.com
                </a>
                {' '}for any career-related enquiries.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#134137] mb-6">Application Form</h2>

            {formError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#134137] mb-2">Application Submitted Successfully</h3>
                <p className="text-gray-600">Thank you for applying to JAYNE LUXE REALTY. Our recruitment team will review your application and contact you if shortlisted.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-xs font-bold text-[#134137] uppercase tracking-widest pb-1 border-b border-gray-100">Personal Information</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="a-name" className="block text-sm font-medium text-[#134137] mb-2">Full Name *</label>
                    <input type="text" id="a-name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="a-phone" className="block text-sm font-medium text-[#134137] mb-2">Phone Number *</label>
                    <input type="tel" id="a-phone" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all" placeholder="+234 800 000 0000" />
                  </div>
                </div>

                <div>
                  <label htmlFor="a-email" className="block text-sm font-medium text-[#134137] mb-2">Email Address *</label>
                  <input type="email" id="a-email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                </div>

                <div>
                  <label htmlFor="a-address" className="block text-sm font-medium text-[#134137] mb-2">Residential Address *</label>
                  <input type="text" id="a-address" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all" placeholder="e.g. 12 Victoria Island, Lagos" />
                </div>

                <p className="text-xs font-bold text-[#134137] uppercase tracking-widest pb-1 border-b border-gray-100 pt-2">Professional Information</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="a-position" className="block text-sm font-medium text-[#134137] mb-2">Position Applying For *</label>
                    <select
                      id="a-position"
                      required
                      value={formData.position}
                      onChange={(e) => {
                        const sel = openings.find(o => o.title === e.target.value);
                        setFormData({ ...formData, position: e.target.value, jobOpeningId: sel?.id || '' });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="">Select a position</option>
                      {openings.filter(o => o.accept_applications).map(o => (
                        <option key={o.id} value={o.title}>{o.title}</option>
                      ))}
                      <option value="General Application">General Application</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="a-exp" className="block text-sm font-medium text-[#134137] mb-2">Years of Experience</label>
                    <input type="number" id="a-exp" min="0" max="50" value={formData.yearsExperience} onChange={e => setFormData({ ...formData, yearsExperience: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all" placeholder="e.g. 3" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="a-linkedin" className="block text-sm font-medium text-[#134137] mb-2">
                      LinkedIn Profile <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="url" id="a-linkedin" value={formData.linkedinUrl} onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })} className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all" placeholder="linkedin.com/in/…" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="a-portfolio" className="block text-sm font-medium text-[#134137] mb-2">
                      Portfolio Website <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="url" id="a-portfolio" value={formData.portfolioUrl} onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })} className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none transition-all" placeholder="https://yoursite.com" />
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold text-[#134137] uppercase tracking-widest pb-1 border-b border-gray-100 pt-2">Upload Documents</p>

                <FileField
                  id="a-cv" label="CV / Resume" required
                  file={cvFile} error={cvError}
                  onChange={makeFileHandler(setCvFile, setCvError)}
                />
                <FileField
                  id="a-cover" label="Cover Letter"
                  file={coverLetterFile} error={coverLetterError}
                  onChange={makeFileHandler(setCoverLetterFile, setCoverLetterError)}
                />
                <FileField
                  id="a-support" label="Supporting Documents"
                  file={supportingDocFile} error={supportingDocError}
                  onChange={makeFileHandler(setSupportingDocFile, setSupportingDocError)}
                />

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="a-consent"
                    checked={formData.consent}
                    onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-[#134137] flex-shrink-0 cursor-pointer"
                  />
                  <label htmlFor="a-consent" className="text-sm text-gray-700 cursor-pointer">
                    I confirm that the information provided is accurate.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center space-x-2 bg-[#F3CF92] text-[#134137] py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
                  <span>{sending ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── General Application Section ── */}
      <div ref={genFormRef} className="bg-[#134137] py-16 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 text-white">
            <h2 className="text-3xl font-bold mb-3">Don't See a Suitable Role?</h2>
            <p className="text-gray-300 text-lg">Submit your profile and CV for future opportunities. We'll reach out when a matching role opens up.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            {genSubmitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-[#134137] mb-2">Profile Submitted!</h3>
                <p className="text-gray-600">We've added you to our talent pool. We'll be in touch when a suitable role becomes available.</p>
              </div>
            ) : (
              <form onSubmit={handleGenSubmit} className="space-y-5">
                {genError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{genError}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="g-name" className="block text-sm font-medium text-[#134137] mb-2">Full Name *</label>
                    <input type="text" id="g-name" required value={genForm.name} onChange={e => setGenForm({ ...genForm, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="g-email" className="block text-sm font-medium text-[#134137] mb-2">Email Address *</label>
                    <input type="email" id="g-email" required value={genForm.email} onChange={e => setGenForm({ ...genForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="john@example.com" />
                  </div>
                </div>

                <div>
                  <label htmlFor="g-area" className="block text-sm font-medium text-[#134137] mb-2">
                    Area of Interest <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input type="text" id="g-area" value={genForm.areaOfInterest} onChange={e => setGenForm({ ...genForm, areaOfInterest: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="e.g. Sales, Marketing, Administration" />
                </div>

                <div>
                  <label htmlFor="g-notes" className="block text-sm font-medium text-[#134137] mb-2">
                    Notes <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea id="g-notes" rows={3} value={genForm.notes} onChange={e => setGenForm({ ...genForm, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none" placeholder="Anything else you'd like us to know..." />
                </div>

                <FileField
                  id="g-cv" label="CV / Resume" required
                  file={genCvFile} error={genCvError}
                  onChange={makeFileHandler(setGenCvFile, setGenCvError)}
                />

                <button
                  type="submit"
                  disabled={genSending}
                  className="w-full flex items-center justify-center space-x-2 bg-[#134137] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#0d2e24] transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-[#F3CF92]"
                >
                  <Send className={`w-5 h-5 ${genSending ? 'animate-pulse' : ''}`} />
                  <span>{genSending ? 'Submitting...' : 'Submit General Application'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
