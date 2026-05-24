import { useState, useEffect } from 'react';
import { Lock, LogOut, Plus, List, X, Upload, CreditCard as Edit2, Trash2, Eye, EyeOff, Settings, Calendar, Briefcase, FileText, ChevronDown, ChevronUp, Download, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database, PropertyImage, JobOpening, JobApplication, GeneralApplication } from '../lib/database.types';

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface PropertyForm {
  title: string;
  description: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  square_feet: string;
  location: string;
  city: string;
  state: string;
  property_type: string;
  year_built: string;
  parking_spaces: string;
  has_pool: boolean;
  has_garden: boolean;
  latitude: string;
  longitude: string;
  imageUrl: string;
  property_category: string;
  area_type: string;
  discount_percentage: string;
  discount_price: string;
  discount_end_date: string;
  developer: string;
}

interface VariantRow {
  id?: string;
  label: string;
  description: string;
  square_feet: string;
  price: string;
}

interface InspectionSlot {
  id: string;
  property_id: string;
  slot_date: string;
  slot_time: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
}

export const Admin = () => {
  const [auth, setAuth] = useState<AdminAuthState>({ isAuthenticated: false, isLoading: true });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<'add' | 'list' | 'settings' | 'slots' | 'openings' | 'applications' | 'general_apps'>('add');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [properties, setProperties] = useState<Database['public']['Tables']['properties']['Row'][]>([]);
  const [form, setForm] = useState<PropertyForm>({
    title: '',
    description: '',
    price: '',
    bedrooms: '3',
    bathrooms: '2',
    square_feet: '2500',
    location: '',
    city: '',
    state: 'Lagos State',
    property_type: 'house',
    year_built: new Date().getFullYear().toString(),
    parking_spaces: '2',
    has_pool: false,
    has_garden: false,
    latitude: '',
    longitude: '',
    imageUrl: '',
    property_category: '',
    area_type: '',
    discount_percentage: '',
    discount_price: '',
    discount_end_date: '',
    developer: '',
  });
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [listSearchDeveloper, setListSearchDeveloper] = useState('');
  const [listFilterType, setListFilterType] = useState('');
  const [listFilterAreaType, setListFilterAreaType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [slots, setSlots] = useState<InspectionSlot[]>([]);
  const [selectedSlotPropertyId, setSelectedSlotPropertyId] = useState('');
  const [slotForm, setSlotForm] = useState({ slot_date: '', slot_time: '', label: '' });
  const [addingSlot, setAddingSlot] = useState(false);
  const [slotMessage, setSlotMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [slotMode, setSlotMode] = useState<'single' | 'batch'>('single');
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchDeveloperFilter, setBatchDeveloperFilter] = useState('');
  const [batchSubMode, setBatchSubMode] = useState<'add' | 'edit'>('add');
  const [batchSlots, setBatchSlots] = useState<InspectionSlot[]>([]);
  const [batchSlotsLoading, setBatchSlotsLoading] = useState(false);
  const [editingBatchSlotId, setEditingBatchSlotId] = useState<string | null>(null);
  const [editBatchSlotForm, setEditBatchSlotForm] = useState({ slot_date: '', slot_time: '', label: '' });

  // Job Openings state
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [openingForm, setOpeningForm] = useState({
    title: '', department: '', location: '', type: 'Full-time',
    experience_level: '', salary_range: '', commission_details: '',
    short_description: '', full_description: '',
    responsibilities: '', requirements: '', benefits_list: '',
    is_active: true, accept_applications: true,
    application_deadline: '', featured: false, allow_supporting_docs: true,
  });
  const [editingOpeningId, setEditingOpeningId] = useState<string | null>(null);
  const [savingOpening, setSavingOpening] = useState(false);
  const [openingMessage, setOpeningMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Job Applications state
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [notesValues, setNotesValues] = useState<Record<string, string>>({});

  // General Applications state
  const [generalApplications, setGeneralApplications] = useState<GeneralApplication[]>([]);
  const [loadingGenApps, setLoadingGenApps] = useState(false);
  const [expandedGenAppId, setExpandedGenAppId] = useState<string | null>(null);
  const [newGenAppsCount, setNewGenAppsCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({ isAuthenticated: !!session, isLoading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth({ isAuthenticated: !!session, isLoading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuth(prev => ({ ...prev, isLoading: true }));
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setAuth(prev => ({ ...prev, isLoading: false }));
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchJobOpenings = async () => {
    try {
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setJobOpenings((data as JobOpening[]) || []);
    } catch (error) {
      console.error('Error fetching job openings:', error);
    }
  };

  const fetchJobApplications = async () => {
    setLoadingApplications(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const apps = (data as JobApplication[]) || [];
      setJobApplications(apps);
      setNewApplicationsCount(apps.filter(a => !a.read).length);
    } catch (error) {
      console.error('Error fetching job applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleSaveOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOpening(true);
    setOpeningMessage(null);
    try {
      if (editingOpeningId) {
        const { error } = await supabase
          .from('job_openings')
          .update({ ...openingForm })
          .eq('id', editingOpeningId);
        if (error) throw error;
        setOpeningMessage({ type: 'success', text: 'Opening updated successfully.' });
      } else {
        const { error } = await supabase.from('job_openings').insert({ ...openingForm });
        if (error) throw error;
        setOpeningMessage({ type: 'success', text: 'Opening added successfully.' });
      }
      setEditingOpeningId(null);
      setOpeningForm({ title: '', department: '', location: '', type: 'Full-time', description: '', is_active: true });
      fetchJobOpenings();
    } catch (error) {
      setOpeningMessage({ type: 'error', text: 'Failed to save. Please try again.' });
    } finally {
      setSavingOpening(false);
    }
  };

  const handleDeleteOpening = async (id: string) => {
    if (!confirm('Delete this job opening?')) return;
    const { error } = await supabase.from('job_openings').delete().eq('id', id);
    if (!error) fetchJobOpenings();
  };

  const handleEditOpening = (opening: JobOpening) => {
    setEditingOpeningId(opening.id);
    setOpeningForm({
      title: opening.title,
      department: opening.department || '',
      location: opening.location || '',
      type: opening.type,
      experience_level: opening.experience_level || '',
      salary_range: opening.salary_range || '',
      commission_details: opening.commission_details || '',
      short_description: opening.short_description || opening.description || '',
      full_description: opening.full_description || '',
      responsibilities: opening.responsibilities || '',
      requirements: opening.requirements || '',
      benefits_list: opening.benefits_list || '',
      is_active: opening.is_active,
      accept_applications: opening.accept_applications,
      application_deadline: opening.application_deadline || '',
      featured: opening.featured,
      allow_supporting_docs: opening.allow_supporting_docs,
    });
    setOpeningMessage(null);
  };

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    setUpdatingApplicationId(id);
    const { error } = await supabase
      .from('job_applications')
      .update({ status, read: true })
      .eq('id', id);
    if (!error) {
      setJobApplications(prev =>
        prev.map(a => a.id === id ? { ...a, status, read: true } : a)
      );
      setNewApplicationsCount(prev => Math.max(0, prev - 1));
    }
    setUpdatingApplicationId(null);
  };

  const handleMarkApplicationRead = async (id: string) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ read: true })
      .eq('id', id);
    if (!error) {
      setJobApplications(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
      setNewApplicationsCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleDownloadResume = async (resumeUrl: string, applicantName: string, label = 'CV') => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumeUrl, 60);
      if (error || !data?.signedUrl) throw new Error('Could not generate download link.');
      const ext = resumeUrl.split('.').pop() || 'pdf';
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = `${applicantName.replace(/\s+/g, '_')}_${label}.${ext}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download file. Please try again.');
    }
  };

  const fetchGeneralApplications = async () => {
    setLoadingGenApps(true);
    try {
      const { data, error } = await supabase
        .from('general_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const apps = (data as GeneralApplication[]) || [];
      setGeneralApplications(apps);
      setNewGenAppsCount(apps.filter(a => !a.read).length);
    } catch (err) {
      console.error('Error fetching general applications:', err);
    } finally {
      setLoadingGenApps(false);
    }
  };

  const handleSaveInternalNotes = async (appId: string) => {
    setSavingNotes(appId);
    const notes = notesValues[appId] ?? '';
    const { error } = await supabase.from('job_applications').update({ internal_notes: notes }).eq('id', appId);
    if (!error) setJobApplications(prev => prev.map(a => a.id === appId ? { ...a, internal_notes: notes } : a));
    setSavingNotes(null);
  };

  const handleMarkGenAppRead = async (id: string) => {
    const { error } = await supabase.from('general_applications').update({ read: true }).eq('id', id);
    if (!error) {
      setGeneralApplications(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
      setNewGenAppsCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleDuplicateOpening = async (opening: JobOpening) => {
    const { id, created_at, ...rest } = opening;
    const { error } = await supabase.from('job_openings').insert({ ...rest, title: `${opening.title} (Copy)`, is_active: false });
    if (!error) fetchJobOpenings();
  };

  const handleCloseApplications = async (id: string) => {
    const { error } = await supabase.from('job_openings').update({ accept_applications: false }).eq('id', id);
    if (!error) fetchJobOpenings();
  };

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (tab === 'list' || tab === 'slots') fetchProperties();
    if (tab === 'openings') fetchJobOpenings();
    if (tab === 'applications') fetchJobApplications();
    if (tab === 'general_apps') fetchGeneralApplications();
  }, [auth.isAuthenticated, tab]);

  useEffect(() => {
    if (selectedSlotPropertyId) fetchSlots();
    else setSlots([]);
  }, [selectedSlotPropertyId]);

  const formatPriceInput = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, '');
    return digits ? Number(digits).toLocaleString('en-US') : '';
  };

  const stripCommas = (value: string): string => value.replace(/,/g, '');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'price' || name === 'discount_price') {
      setForm({ ...form, [name]: formatPriceInput(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addVariantRow = () => setVariants(prev => [...prev, { label: '', description: '', square_feet: '', price: '' }]);
  const removeVariantRow = (index: number) => setVariants(prev => prev.filter((_, i) => i !== index));
  const handleVariantChange = (index: number, field: keyof VariantRow, value: string) =>
    setVariants(prev => prev.map((row, i) =>
      i === index ? { ...row, [field]: field === 'price' ? formatPriceInput(value) : value } : row
    ));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Each image must be less than 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newFiles = [...imageFiles, ...validFiles];
    setImageFiles(newFiles);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setImagesToDelete(prev => [...prev, id]);
  };

  const uploadPropertyImage = async (file: File, propertyId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setMessage(`Failed to upload image: ${uploadError.message}`);
        return null;
      }

      if (!data) {
        console.error('No data returned from upload');
        setMessage('Failed to upload image: No data returned');
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return publicUrlData?.publicUrl || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (!form.title || !form.description || !form.price) {
        setMessage('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const price = parseFloat(stripCommas(form.price));
      const latitude = form.latitude ? parseFloat(form.latitude) : null;
      const longitude = form.longitude ? parseFloat(form.longitude) : null;

      if (isNaN(price)) {
        setMessage('Please enter a valid number for price');
        setSubmitting(false);
        return;
      }

      const propertyData = {
        title: form.title,
        description: form.description,
        price,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseFloat(form.bathrooms) || 0,
        square_feet: parseInt(form.square_feet) || 0,
        location: form.location,
        city: form.city,
        state: form.state,
        property_type: form.property_type,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        parking_spaces: parseInt(form.parking_spaces) || 0,
        has_pool: form.has_pool,
        has_garden: form.has_garden,
        latitude: latitude !== null && !isNaN(latitude) ? latitude : null,
        longitude: longitude !== null && !isNaN(longitude) ? longitude : null,
        status: 'available',
        property_category: form.property_category || null,
        area_type: form.area_type || null,
        discount_percentage: form.discount_percentage ? parseFloat(form.discount_percentage) : null,
        discount_price: form.discount_price ? parseFloat(stripCommas(form.discount_price)) : null,
        discount_end_date: form.discount_end_date || null,
        developer: form.developer.trim() || null,
      };

      let propertyId: string;
      let error;

      if (editingId) {
        const result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingId)
          .select('id');
        propertyId = editingId;
        error = result.error;
        if (!error && (!result.data || result.data.length === 0)) {
          throw new Error('Update blocked by database permissions. Go to Supabase → Authentication → Policies → properties table, and add an UPDATE policy for authenticated users.');
        }
      } else {
        propertyId = crypto.randomUUID();
        const result = await supabase
          .from('properties')
          .insert([{ id: propertyId, ...propertyData }]);
        error = result.error;
      }

      if (error) throw error;

      // Save variants
      const validVariants = variants.filter(v => v.label.trim() && v.square_feet && v.price);
      if (editingId) {
        await supabase.from('property_variants').delete().eq('property_id', propertyId);
      }
      if (validVariants.length > 0) {
        const { error: variantError } = await supabase.from('property_variants').insert(
          validVariants.map(v => ({
            property_id: propertyId,
            label: v.label.trim(),
            description: v.description.trim() || null,
            square_feet: parseInt(v.square_feet),
            price: parseFloat(stripCommas(v.price)),
          }))
        );
        if (variantError) throw new Error(`Failed to save variants: ${variantError.message}`);
      }

      if (imagesToDelete.length > 0) {
        await supabase.from('property_images').delete().in('id', imagesToDelete);
      }

      if (imageFiles.length > 0) {
        const imageUploads = imageFiles.map(async (file, index) => {
          const imageUrl = await uploadPropertyImage(file, propertyId);
          if (imageUrl) {
            return {
              property_id: propertyId,
              image_url: imageUrl,
              is_primary: index === 0,
              display_order: index,
            };
          }
          return null;
        });

        const uploadedImages = (await Promise.all(imageUploads)).filter(img => img !== null);

        if (uploadedImages.length > 0) {
          const { error: insertError } = await supabase
            .from('property_images')
            .insert(uploadedImages);

          if (insertError) {
            throw new Error(`Property saved but images failed: ${insertError.message}`);
          }
        } else if (imageFiles.length > 0) {
          throw new Error('Image upload failed. Check that the "property-images" storage bucket exists in Supabase.');
        }
      }

      setMessage(editingId ? 'Property updated successfully!' : 'Property added successfully!');
      setForm({
        title: '',
        description: '',
        price: '',
        bedrooms: '3',
        bathrooms: '2',
        square_feet: '2500',
        location: '',
        city: '',
        state: 'Lagos State',
        property_type: 'house',
        year_built: new Date().getFullYear().toString(),
        parking_spaces: '2',
        has_pool: false,
        has_garden: false,
        latitude: '',
        longitude: '',
        imageUrl: '',
        property_category: '',
        area_type: '',
        discount_percentage: '',
        discount_price: '',
        discount_end_date: '',
        developer: '',
      });
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);
      setVariants([]);
      setEditingId(null);
      await fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      const errMsg = (error as any)?.message ?? (typeof error === 'string' ? error : JSON.stringify(error));
      setMessage(`Error saving property: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (property: Database['public']['Tables']['properties']['Row']) => {
    try {
      setForm({
        title: property.title || '',
        description: property.description || '',
        price: property.price ? Number(property.price).toLocaleString('en-US') : '',
        bedrooms: property.bedrooms?.toString() || '3',
        bathrooms: property.bathrooms?.toString() || '2',
        square_feet: property.square_feet?.toString() || '2500',
        location: property.location || '',
        city: property.city || '',
        state: property.state || '',
        property_type: property.property_type || 'house',
        year_built: property.year_built?.toString() || '',
        parking_spaces: property.parking_spaces?.toString() || '2',
        has_pool: property.has_pool ?? false,
        has_garden: property.has_garden ?? false,
        latitude: property.latitude?.toString() || '',
        longitude: property.longitude?.toString() || '',
        imageUrl: '',
        property_category: property.property_category || '',
        area_type: property.area_type || '',
        discount_percentage: property.discount_percentage?.toString() || '',
        discount_price: property.discount_price ? Number(property.discount_price).toLocaleString('en-US') : '',
        discount_end_date: property.discount_end_date || '',
        developer: property.developer || '',
      });
      setEditingId(property.id);
      setTab('add');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const { data: existingVariants } = await supabase
        .from('property_variants')
        .select('*')
        .eq('property_id', property.id)
        .order('price', { ascending: true });
      setVariants(
        (existingVariants || []).map(v => ({
          id: v.id,
          label: v.label,
          description: v.description || '',
          square_feet: v.square_feet.toString(),
          price: Number(v.price).toLocaleString('en-US'),
        }))
      );
      const { data: existingImgs } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id)
        .order('display_order', { ascending: true });
      setExistingImages(existingImgs || []);
      setImagesToDelete([]);
    } catch (err) {
      console.error('Edit error:', err);
      setMessage('Failed to open edit form: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCancelEdit = () => {
    setForm({
      title: '',
      description: '',
      price: '',
      bedrooms: '3',
      bathrooms: '2',
      square_feet: '2500',
      location: '',
      city: '',
      state: 'Lagos State',
      property_type: 'house',
      year_built: new Date().getFullYear().toString(),
      parking_spaces: '2',
      has_pool: false,
      has_garden: false,
      latitude: '',
      longitude: '',
      imageUrl: '',
      property_category: '',
      area_type: '',
      discount_percentage: '',
      discount_price: '',
      discount_end_date: '',
      developer: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setVariants([]);
    setEditingId(null);
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', id);

      if (imagesError) throw imagesError;

      const { data: deleted, error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!deleted || deleted.length === 0) {
        throw new Error('Delete blocked by database policy. Go to Supabase → Authentication → Policies → properties table and ensure a DELETE policy exists for the anon role.');
      }

      setMessage('Property deleted successfully!');
      setDeleteConfirm(null);
      await fetchProperties();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting property:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Failed to delete property.'}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) return;

    try {
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .in('property_id', selectedProperties);

      if (imagesError) throw imagesError;

      const { data: deleted, error } = await supabase
        .from('properties')
        .delete()
        .in('id', selectedProperties)
        .select('id');

      if (error) throw error;
      if (!deleted || deleted.length === 0) {
        throw new Error('Delete blocked by database policy. Go to Supabase → Authentication → Policies → properties table and ensure a DELETE policy exists for the anon role.');
      }

      setMessage(`${deleted.length} properties deleted successfully!`);
      setSelectedProperties([]);
      await fetchProperties();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting properties:', error);
      setMessage('Error deleting properties. Please try again.');
    }
  };

  const toggleSelectProperty = (id: string) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(propId => propId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredProperties.map(p => p.id);
    const allVisible = visibleIds.every(id => selectedProperties.includes(id));
    if (allVisible && visibleIds.length > 0) {
      setSelectedProperties(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedProperties(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const fetchSlots = async () => {
    if (!selectedSlotPropertyId) return;
    const { data } = await supabase
      .from('inspection_slots')
      .select('*')
      .eq('property_id', selectedSlotPropertyId)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true });
    setSlots((data as InspectionSlot[]) || []);
  };

  const fetchBatchSlots = async (ids: string[]) => {
    if (ids.length === 0) { setBatchSlots([]); return; }
    setBatchSlotsLoading(true);
    const { data } = await supabase
      .from('inspection_slots')
      .select('*')
      .in('property_id', ids)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true });
    setBatchSlots((data as InspectionSlot[]) || []);
    setBatchSlotsLoading(false);
  };

  const handleBatchSlotEditSave = async (id: string) => {
    await supabase.from('inspection_slots').update({
      slot_date: editBatchSlotForm.slot_date,
      slot_time: editBatchSlotForm.slot_time,
      label: editBatchSlotForm.label.trim() || null,
    }).eq('id', id);
    setEditingBatchSlotId(null);
    await fetchBatchSlots(batchSelectedIds);
  };

  const handleBatchToggleSlot = async (id: string, current: boolean) => {
    await supabase.from('inspection_slots').update({ is_active: !current }).eq('id', id);
    await fetchBatchSlots(batchSelectedIds);
  };

  const handleBatchDeleteSlot = async (id: string) => {
    await supabase.from('inspection_slots').delete().eq('id', id);
    await fetchBatchSlots(batchSelectedIds);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slotMode === 'single') {
      if (!selectedSlotPropertyId) {
        setSlotMessage({ type: 'error', text: 'Please select a property first.' });
        return;
      }
    } else {
      if (batchSelectedIds.length === 0) {
        setSlotMessage({ type: 'error', text: 'Please select at least one property.' });
        return;
      }
    }
    if (!slotForm.slot_date || !slotForm.slot_time) {
      setSlotMessage({ type: 'error', text: 'Date and time are required.' });
      return;
    }
    setAddingSlot(true);
    setSlotMessage(null);
    const ids = slotMode === 'single' ? [selectedSlotPropertyId] : batchSelectedIds;
    const rows = ids.map(id => ({
      property_id: id,
      slot_date: slotForm.slot_date,
      slot_time: slotForm.slot_time,
      label: slotForm.label.trim() || null,
    }));
    const { error } = await supabase.from('inspection_slots').insert(rows);
    setAddingSlot(false);
    if (error) {
      setSlotMessage({ type: 'error', text: error.message });
    } else {
      const count = ids.length;
      setSlotMessage({ type: 'success', text: count === 1 ? 'Slot added successfully!' : `Slot added to ${count} properties!` });
      setSlotForm({ slot_date: '', slot_time: '', label: '' });
      if (slotMode === 'single') await fetchSlots();
      setTimeout(() => setSlotMessage(null), 3000);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    await supabase.from('inspection_slots').delete().eq('id', id);
    await fetchSlots();
  };

  const handleToggleSlot = async (id: string, current: boolean) => {
    await supabase.from('inspection_slots').update({ is_active: !current }).eq('id', id);
    await fetchSlots();
  };

  const formatSlotTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const formatSlotDate = (date: string): string =>
    new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const filteredProperties = properties.filter(p => {
    if (listSearchDeveloper && !(p.developer || '').toLowerCase().includes(listSearchDeveloper.toLowerCase())) return false;
    if (listFilterType && p.property_type !== listFilterType) return false;
    if (listFilterAreaType && p.area_type !== listFilterAreaType) return false;
    return true;
  });

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#134137] to-[#0d2d26] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#134137] to-[#0d2d26] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-[#F3CF92] mr-3" />
            <h1 className="text-2xl font-bold text-[#134137]">Admin Login</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#134137] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                placeholder="Enter admin email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#134137] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#134137] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {message && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={auth.isLoading}
              className="w-full bg-[#F3CF92] text-[#134137] py-3 rounded-lg font-bold hover:bg-[#e6c07f] transition-all disabled:opacity-50"
            >
              {auth.isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-[#134137] text-white sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
          <div className="flex gap-2 pb-3 overflow-x-auto">
            <button
              onClick={() => setTab('add')}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                tab === 'add'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Property</span>
            </button>
            <button
              onClick={() => setTab('list')}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                tab === 'list'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>All Properties</span>
            </button>
            <button
              onClick={() => setTab('settings')}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                tab === 'settings'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setTab('slots')}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                tab === 'slots'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Inspection Time Slots</span>
            </button>
            <button
              onClick={() => setTab('openings')}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                tab === 'openings'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Job Openings</span>
            </button>
            <button
              onClick={() => setTab('applications')}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                tab === 'applications'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Applications</span>
              {newApplicationsCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {newApplicationsCount > 9 ? '9+' : newApplicationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('general_apps')}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-lg font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                tab === 'general_apps'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>General Applications</span>
              {newGenAppsCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {newGenAppsCount > 9 ? '9+' : newGenAppsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'add' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
            <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#134137]">
                {editingId ? 'Edit Property' : 'Add New Property'}
              </h2>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  message.includes('successfully')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., Lekki Luxury Penthouse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Price (NGN) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={form.discount_percentage}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., 15 for 15% off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Discounted Price (NGN)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="discount_price"
                    value={form.discount_price}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="Enter discounted price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Discount End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="discount_end_date"
                    value={form.discount_end_date}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Set when the discount offer expires
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., 234 Lekki Crescent, Lekki Phase 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., Lagos State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    value={form.property_type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="waterfront">Waterfront</option>
                    <option value="estate land">Estate Land</option>
                    <option value="hectare land">Hectare Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Estate Area Type
                  </label>
                  <select
                    name="area_type"
                    value={form.area_type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  >
                    <option value="">Not Specified</option>
                    <option value="prime">Prime Areas</option>
                    <option value="emerging">Emerging Areas</option>
                    <option value="suburb">Suburb</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Developer Name
                    <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Admin only</span>
                  </label>
                  <input
                    type="text"
                    name="developer"
                    value={form.developer}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., Crest Homes Limited"
                  />
                  <p className="text-xs text-gray-400 mt-1">Not shown to the public</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={handleFormChange}
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Square Metres
                  </label>
                  <input
                    type="number"
                    name="square_feet"
                    value={form.square_feet}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    name="parking_spaces"
                    value={form.parking_spaces}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Year Built
                  </label>
                  <input
                    type="number"
                    name="year_built"
                    value={form.year_built}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleFormChange}
                    required
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., 6.4969"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleFormChange}
                    required
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="e.g., 3.3686"
                  />
                </div>
              </div>

              {/* Size & Price Variants */}
              <div className="border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#134137]">Size &amp; Price Variants</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add multiple plot sizes with individual prices. Leave empty to use the single price and size above.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="flex items-center gap-2 bg-[#134137] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0d2e24] transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Size
                  </button>
                </div>

                {variants.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No variants — property uses the single price and square footage above.
                  </p>
                )}

                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Label (e.g., "450 sqm Plot")</label>
                        <input
                          type="text"
                          value={variant.label}
                          onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                          placeholder="e.g., 450 sqm Plot"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Plot Size (sqm)</label>
                        <input
                          type="number"
                          value={variant.square_feet}
                          onChange={(e) => handleVariantChange(index, 'square_feet', e.target.value)}
                          placeholder="e.g., 4844"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price (NGN)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          placeholder="e.g., 5,000,000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariantRow(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove this variant"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description (e.g., Semi-Detached, Duplex, Terrace)</label>
                      <input
                        type="text"
                        value={variant.description}
                        onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
                        placeholder="e.g., Semi-Detached Bungalow"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none"
                  placeholder="Detailed property description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">
                  Property Images {(existingImages.length + imagePreviews.length) > 0 && `(${existingImages.length + imagePreviews.length})`}
                </label>

                {/* Existing saved images — visible when editing */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Images (hover to remove)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {existingImages.map((img, index) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image_url}
                            alt={`Current image ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          {img.is_primary && (
                            <div className="absolute top-2 left-2 bg-[#F3CF92] text-[#134137] px-2 py-1 rounded text-xs font-bold">
                              Primary
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(img.id)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New images staged for upload */}
                {imagePreviews.length > 0 && (
                  <div className="mb-4">
                    {existingImages.length > 0 && (
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">New Images (pending upload)</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New image ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-dashed border-[#F3CF92]"
                          />
                          {index === 0 && existingImages.length === 0 && (
                            <div className="absolute top-2 left-2 bg-[#F3CF92] text-[#134137] px-2 py-1 rounded text-xs font-bold">
                              Primary
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500 font-semibold">
                      {(existingImages.length + imagePreviews.length) > 0 ? 'Add more images' : 'Click to upload property images'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB each)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_pool"
                    checked={form.has_pool}
                    onChange={handleFormChange}
                    className="w-4 h-4"
                  />
                  <span className="text-[#134137] font-medium">Has Swimming Pool</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_garden"
                    checked={form.has_garden}
                    onChange={handleFormChange}
                    className="w-4 h-4"
                  />
                  <span className="text-[#134137] font-medium">Has Garden</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#F3CF92] text-[#134137] py-4 rounded-lg font-bold text-lg hover:bg-[#e6c07f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (editingId ? 'Updating Property...' : 'Adding Property...') : (editingId ? 'Update Property' : 'Add Property')}
              </button>
            </form>
          </div>
        )}

        {tab === 'list' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Search by Developer</label>
                  <input
                    type="text"
                    value={listSearchDeveloper}
                    onChange={e => setListSearchDeveloper(e.target.value)}
                    placeholder="Developer name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Property Type</label>
                  <select
                    value={listFilterType}
                    onChange={e => setListFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="waterfront">Waterfront</option>
                    <option value="estate land">Estate Land</option>
                    <option value="hectare land">Hectare Land</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Estate Area Type</label>
                  <select
                    value={listFilterAreaType}
                    onChange={e => setListFilterAreaType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  >
                    <option value="">All Areas</option>
                    <option value="prime">Prime Areas</option>
                    <option value="emerging">Emerging Areas</option>
                    <option value="suburb">Suburb</option>
                  </select>
                </div>
                {(listSearchDeveloper || listFilterType || listFilterAreaType) && (
                  <button
                    onClick={() => { setListSearchDeveloper(''); setListFilterType(''); setListFilterAreaType(''); }}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Showing {filteredProperties.length} of {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>

            {message && (
              <div
                className={`p-4 m-4 rounded-lg ${
                  message.includes('successfully')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}
            {selectedProperties.length > 0 && (
              <div className="p-4 bg-red-50 border-b border-red-200 flex flex-wrap gap-3 items-center justify-between">
                <span className="text-red-900 font-semibold text-sm sm:text-base">
                  {selectedProperties.length} {selectedProperties.length === 1 ? 'property' : 'properties'} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredProperties.map((property) => (
                <div key={property.id} className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => toggleSelectProperty(property.id)}
                    className="w-4 h-4 cursor-pointer mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#134137] truncate">{property.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{property.property_type} · {property.city}</p>
                    <p className="text-sm font-bold text-[#134137] mt-1">₦{property.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{property.bedrooms} bed · {property.bathrooms} bath</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(property)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(property.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={filteredProperties.length > 0 && filteredProperties.every(p => selectedProperties.includes(p.id))}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Title</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">City</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Price</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Type</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Developer</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Beds/Baths</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(property.id)}
                          onChange={() => toggleSelectProperty(property.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-[#134137]">{property.title}</td>
                      <td className="px-6 py-4 text-gray-600">{property.city}</td>
                      <td className="px-6 py-4 font-bold text-[#F3CF92]">₦{property.price.toLocaleString()}</td>
                      <td className="px-6 py-4 capitalize text-gray-600">{property.property_type}</td>
                      <td className="px-6 py-4 text-gray-600">{property.developer || <span className="text-gray-300 italic">—</span>}</td>
                      <td className="px-6 py-4 text-gray-600">{property.bedrooms}/{property.bathrooms}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(property)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit property"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(property.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete property"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProperties.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                {properties.length === 0 ? 'No properties found' : 'No properties match the current filters'}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 w-full sm:max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-[#134137] mb-6">Change Password</h2>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#134137] transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134137] mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#134137] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {passwordMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full bg-[#F3CF92] text-[#134137] py-3 rounded-lg font-bold hover:bg-[#e6c07f] transition-all disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {tab === 'slots' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#134137] mb-2">Inspection Slots</h2>
            <p className="text-gray-500 text-sm mb-6">
              Add inspection date and time slots to one property, or apply the same slot to multiple properties at once.
            </p>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setSlotMode('single'); setBatchSelectedIds([]); setSlotMessage(null); }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${slotMode === 'single' ? 'bg-[#134137] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Single Property
              </button>
              <button
                type="button"
                onClick={() => { setSlotMode('batch'); setSelectedSlotPropertyId(''); setSlots([]); setSlotMessage(null); }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${slotMode === 'batch' ? 'bg-[#134137] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Batch (Multiple Properties)
              </button>
            </div>

            {slotMode === 'single' ? (
              <>
                {/* Single property selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#134137] mb-2">Select Property *</label>
                  <select
                    value={selectedSlotPropertyId}
                    onChange={(e) => {
                      setSelectedSlotPropertyId(e.target.value);
                      setSlots([]);
                      setSlotMessage(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                  >
                    <option value="">-- Choose a property --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} — {p.city}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedSlotPropertyId ? (
                  <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    Select a property above to manage its inspection slots.
                  </div>
                ) : (
                  <>
                    {/* Add slot form */}
                    <form onSubmit={handleAddSlot} className="mb-8 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
                      <h3 className="font-bold text-[#134137] text-lg">Add New Slot</h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#134137] mb-2">Date *</label>
                          <input
                            type="date"
                            value={slotForm.slot_date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setSlotForm(prev => ({ ...prev, slot_date: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#134137] mb-2">Time *</label>
                          <input
                            type="time"
                            value={slotForm.slot_time}
                            onChange={(e) => setSlotForm(prev => ({ ...prev, slot_time: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#134137] mb-2">Label (Optional)</label>
                          <input
                            type="text"
                            value={slotForm.label}
                            onChange={(e) => setSlotForm(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="e.g., Morning Tour"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      {slotMessage && (
                        <div className={`p-3 rounded-lg text-sm ${slotMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {slotMessage.text}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={addingSlot}
                        className="flex items-center gap-2 bg-[#134137] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#0d2e24] transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        {addingSlot ? 'Adding...' : 'Add Slot'}
                      </button>
                    </form>

                    {/* Slots list */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-[#134137] text-lg">
                        All Slots ({slots.length})
                      </h3>
                      {slots.length === 0 ? (
                        <p className="text-gray-400 text-sm italic py-4 text-center">No inspection slots yet for this property. Add one above.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                          {slots.map(slot => (
                            <div
                              key={slot.id}
                              className={`flex flex-wrap gap-3 items-center justify-between px-4 py-3 ${
                                slot.is_active ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${slot.is_active ? 'text-[#134137]' : 'text-gray-400 line-through'}`}>
                                  {formatSlotDate(slot.slot_date)}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {formatSlotTime(slot.slot_time)}
                                  {slot.label && <span className="ml-2 font-medium text-[#134137]/70">· {slot.label}</span>}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleToggleSlot(slot.id, slot.is_active)}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                    slot.is_active
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                  }`}
                                >
                                  {slot.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete slot"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Batch mode: developer filter + property checkboxes */}
                {(() => {
                  const developerList = [...new Set(properties.map(p => p.developer).filter(Boolean))].sort() as string[];
                  const filteredProps = batchDeveloperFilter
                    ? properties.filter(p => p.developer === batchDeveloperFilter)
                    : properties;
                  return (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-[#134137] mb-2">Filter by Developer</label>
                        <select
                          value={batchDeveloperFilter}
                          onChange={(e) => { setBatchDeveloperFilter(e.target.value); setBatchSelectedIds([]); }}
                          className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                        >
                          <option value="">All Properties</option>
                          {developerList.map(dev => (
                            <option key={dev} value={dev}>{dev}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <span className="text-sm font-semibold text-[#134137]">
                            Select Properties ({batchSelectedIds.length} selected)
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setBatchSelectedIds(filteredProps.map(p => p.id))}
                              className="text-xs font-semibold text-[#134137] hover:underline"
                            >
                              Select All
                            </button>
                            <span className="text-gray-300 select-none">|</span>
                            <button
                              type="button"
                              onClick={() => setBatchSelectedIds([])}
                              className="text-xs font-semibold text-gray-500 hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                        {filteredProps.length === 0 ? (
                          <p className="text-gray-400 text-sm italic py-6 text-center">No properties found.</p>
                        ) : (
                          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                            {filteredProps.map(p => (
                              <label
                                key={p.id}
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={batchSelectedIds.includes(p.id)}
                                  onChange={() => setBatchSelectedIds(prev =>
                                    prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                                  )}
                                  className="w-4 h-4 accent-[#134137]"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-[#134137] truncate">{p.title}</p>
                                  <p className="text-xs text-gray-500">{p.city}{p.developer ? ` · ${p.developer}` : ''}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Batch sub-mode toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setBatchSubMode('add')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${batchSubMode === 'add' ? 'bg-[#134137] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Add Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBatchSubMode('edit'); setEditingBatchSlotId(null); }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${batchSubMode === 'edit' ? 'bg-[#134137] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Edit / Manage Slots
                  </button>
                </div>

                {batchSubMode === 'add' ? (
                  <form onSubmit={handleAddSlot} className="border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
                    <h3 className="font-bold text-[#134137] text-lg">Add Slot to Selected Properties</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#134137] mb-2">Date *</label>
                        <input
                          type="date"
                          value={slotForm.slot_date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, slot_date: e.target.value }))}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#134137] mb-2">Time *</label>
                        <input
                          type="time"
                          value={slotForm.slot_time}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, slot_time: e.target.value }))}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#134137] mb-2">Label (Optional)</label>
                        <input
                          type="text"
                          value={slotForm.label}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, label: e.target.value }))}
                          placeholder="e.g., Morning Tour"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    {slotMessage && (
                      <div className={`p-3 rounded-lg text-sm ${slotMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {slotMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={addingSlot || batchSelectedIds.length === 0}
                      className="flex items-center gap-2 bg-[#134137] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#0d2e24] transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {addingSlot ? 'Adding...' : `Add Slot to ${batchSelectedIds.length} ${batchSelectedIds.length === 1 ? 'Property' : 'Properties'}`}
                    </button>
                  </form>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-bold text-[#134137]">Slots for Selected Properties</h3>
                      <button
                        type="button"
                        onClick={() => fetchBatchSlots(batchSelectedIds)}
                        disabled={batchSelectedIds.length === 0 || batchSlotsLoading}
                        className="text-sm font-semibold text-[#134137] hover:underline disabled:opacity-40 disabled:no-underline"
                      >
                        {batchSlotsLoading ? 'Loading...' : 'Load / Refresh Slots'}
                      </button>
                    </div>
                    {batchSelectedIds.length === 0 ? (
                      <p className="text-gray-400 text-sm italic py-8 text-center">Select properties above, then load their slots.</p>
                    ) : batchSlotsLoading ? (
                      <p className="text-gray-400 text-sm italic py-8 text-center">Loading slots...</p>
                    ) : batchSlots.length === 0 ? (
                      <p className="text-gray-400 text-sm italic py-8 text-center">No slots loaded yet. Click "Load / Refresh Slots" above.</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {properties
                          .filter(p => batchSelectedIds.includes(p.id))
                          .map(p => {
                            const propSlots = batchSlots.filter(s => s.property_id === p.id);
                            if (propSlots.length === 0) return null;
                            return (
                              <div key={p.id} className="px-4 py-3">
                                <p className="font-semibold text-sm text-[#134137] mb-2">{p.title} — {p.city}</p>
                                <div className="space-y-2">
                                  {propSlots.map(slot => (
                                    <div key={slot.id} className={`rounded-lg border p-3 ${slot.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                                      {editingBatchSlotId === slot.id ? (
                                        <div className="space-y-3">
                                          <div className="grid sm:grid-cols-3 gap-3">
                                            <div>
                                              <label className="block text-xs font-medium text-[#134137] mb-1">Date *</label>
                                              <input
                                                type="date"
                                                value={editBatchSlotForm.slot_date}
                                                onChange={(e) => setEditBatchSlotForm(prev => ({ ...prev, slot_date: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-[#134137] mb-1">Time *</label>
                                              <input
                                                type="time"
                                                value={editBatchSlotForm.slot_time}
                                                onChange={(e) => setEditBatchSlotForm(prev => ({ ...prev, slot_time: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-[#134137] mb-1">Label</label>
                                              <input
                                                type="text"
                                                value={editBatchSlotForm.label}
                                                onChange={(e) => setEditBatchSlotForm(prev => ({ ...prev, label: e.target.value }))}
                                                placeholder="Optional"
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              onClick={() => handleBatchSlotEditSave(slot.id)}
                                              disabled={!editBatchSlotForm.slot_date || !editBatchSlotForm.slot_time}
                                              className="px-4 py-1.5 bg-[#134137] text-white text-sm font-bold rounded-lg hover:bg-[#0d2e24] transition-colors disabled:opacity-50"
                                            >
                                              Save
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setEditingBatchSlotId(null)}
                                              className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex flex-wrap gap-2 items-center justify-between">
                                          <div>
                                            <p className={`font-semibold text-sm ${slot.is_active ? 'text-[#134137]' : 'text-gray-400 line-through'}`}>
                                              {formatSlotDate(slot.slot_date)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                              {formatSlotTime(slot.slot_time)}
                                              {slot.label && <span className="ml-2 font-medium text-[#134137]/70">· {slot.label}</span>}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => handleBatchToggleSlot(slot.id, slot.is_active)}
                                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${slot.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                            >
                                              {slot.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => { setEditingBatchSlotId(slot.id); setEditBatchSlotForm({ slot_date: slot.slot_date, slot_time: slot.slot_time, label: slot.label || '' }); }}
                                              className="px-3 py-1 text-xs font-bold text-[#134137] hover:bg-[#134137]/10 rounded-lg transition-colors"
                                              title="Edit slot"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleBatchDeleteSlot(slot.id)}
                                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                              title="Delete slot"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'openings' && (
          <div className="space-y-8">
            {/* Add / Edit Opening Form */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#134137] mb-6">
                {editingOpeningId ? 'Edit Opening' : 'Add New Opening'}
              </h2>
              {openingMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${openingMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {openingMessage.text}
                </div>
              )}
              <form onSubmit={handleSaveOpening} className="space-y-5">
                <p className="text-xs font-bold text-[#134137] uppercase tracking-widest pb-1 border-b border-gray-100">Basic Information</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Job Title *</label>
                    <input type="text" required value={openingForm.title} onChange={(e) => setOpeningForm({ ...openingForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="e.g. Senior Property Consultant" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Department</label>
                    <input type="text" value={openingForm.department} onChange={(e) => setOpeningForm({ ...openingForm, department: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="e.g. Sales & Marketing" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Location</label>
                    <input type="text" value={openingForm.location} onChange={(e) => setOpeningForm({ ...openingForm, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="e.g. Lagos, Nigeria" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Employment Type</label>
                    <select value={openingForm.type} onChange={(e) => setOpeningForm({ ...openingForm, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Experience Level</label>
                    <select value={openingForm.experience_level} onChange={(e) => setOpeningForm({ ...openingForm, experience_level: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white">
                      <option value="">Select level</option>
                      <option value="Entry-Level">Entry-Level</option>
                      <option value="Mid-Level">Mid-Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs font-bold text-[#134137] uppercase tracking-widest pb-1 border-b border-gray-100 pt-2">Compensation</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Salary Range <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input type="text" value={openingForm.salary_range} onChange={(e) => setOpeningForm({ ...openingForm, salary_range: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="e.g. ₦300,000 – ₦500,000/month" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Commission Details <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input type="text" value={openingForm.commission_details} onChange={(e) => setOpeningForm({ ...openingForm, commission_details: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="e.g. 3% on closed deals" />
                  </div>
                </div>

                <p className="text-xs font-bold text-[#134137] uppercase tracking-widest pb-1 border-b border-gray-100 pt-2">Job Content</p>
                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">Short Description <span className="text-gray-400 font-normal">(shown on job card)</span></label>
                  <input type="text" value={openingForm.short_description} onChange={(e) => setOpeningForm({ ...openingForm, short_description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" placeholder="One-line summary of the role" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#134137] mb-2">Full Job Description</label>
                  <textarea rows={4} value={openingForm.full_description} onChange={(e) => setOpeningForm({ ...openingForm, full_description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none" placeholder="Detailed overview of the position..." />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Responsibilities <span className="text-gray-400 text-xs font-normal">(one per line)</span></label>
                    <textarea rows={5} value={openingForm.responsibilities} onChange={(e) => setOpeningForm({ ...openingForm, responsibilities: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none text-sm" placeholder={"Manage property listings\nConduct inspections\nNegotiate deals"} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Requirements <span className="text-gray-400 text-xs font-normal">(one per line)</span></label>
                    <textarea rows={5} value={openingForm.requirements} onChange={(e) => setOpeningForm({ ...openingForm, requirements: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none text-sm" placeholder={"B.Sc/HND qualification\nMin 2 years experience\nExcellent communication"} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Benefits <span className="text-gray-400 text-xs font-normal">(one per line)</span></label>
                    <textarea rows={5} value={openingForm.benefits_list} onChange={(e) => setOpeningForm({ ...openingForm, benefits_list: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none text-sm" placeholder={"Attractive commission\nCareer advancement\nTraining & mentorship"} />
                  </div>
                </div>

                <p className="text-xs font-bold text-[#134137] uppercase tracking-widest pb-1 border-b border-gray-100 pt-2">Application Settings</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#134137] mb-2">Application Deadline <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input type="date" value={openingForm.application_deadline} onChange={(e) => setOpeningForm({ ...openingForm, application_deadline: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none" />
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    {([['is_active', 'Active (visible on careers page)'], ['accept_applications', 'Accept Applications'], ['featured', 'Featured Job'], ['allow_supporting_docs', 'Allow Supporting Documents']] as [string, string][]).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input type="checkbox" id={`of-${key}`} checked={openingForm[key as keyof typeof openingForm] as boolean} onChange={(e) => setOpeningForm({ ...openingForm, [key]: e.target.checked })} className="w-4 h-4 accent-[#134137]" />
                        <label htmlFor={`of-${key}`} className="text-sm text-[#134137]">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={savingOpening} className="flex items-center gap-2 bg-[#134137] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#0d2e24] transition-colors disabled:opacity-50">
                    <Plus className="w-4 h-4" />
                    {savingOpening ? 'Saving...' : editingOpeningId ? 'Update Opening' : 'Add Opening'}
                  </button>
                  {editingOpeningId && (
                    <button type="button" onClick={() => { setEditingOpeningId(null); setOpeningForm({ title: '', department: '', location: '', type: 'Full-time', experience_level: '', salary_range: '', commission_details: '', short_description: '', full_description: '', responsibilities: '', requirements: '', benefits_list: '', is_active: true, accept_applications: true, application_deadline: '', featured: false, allow_supporting_docs: true }); setOpeningMessage(null); }} className="px-6 py-2 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Openings List */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#134137] mb-6">All Openings ({jobOpenings.length})</h2>
              {jobOpenings.length === 0 ? (
                <p className="text-gray-400 text-center py-8 italic">No job openings yet. Add one above.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {jobOpenings.map(opening => (
                    <div key={opening.id} className="py-4 flex flex-wrap gap-3 items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-[#134137]">{opening.title}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opening.type === 'Full-time' ? 'bg-green-100 text-green-700' : opening.type === 'Part-time' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {opening.type}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opening.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {opening.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {(opening.department || opening.location) && (
                          <p className="text-sm text-gray-500">{[opening.department, opening.location].filter(Boolean).join(' · ')}</p>
                        )}
                        {opening.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{opening.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditOpening(opening)}
                          className="p-2 text-[#134137] hover:bg-[#134137]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateOpening(opening)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {opening.accept_applications && (
                          <button
                            onClick={() => handleCloseApplications(opening.id)}
                            className="px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Close Applications"
                          >
                            Close Apps
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOpening(opening.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'applications' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#134137]">
                Job Applications ({jobApplications.length})
              </h2>
              <select
                value={applicationFilter}
                onChange={(e) => setApplicationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white"
              >
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="reviewing">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loadingApplications ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : jobApplications.filter(a => applicationFilter === 'all' || a.status === applicationFilter).length === 0 ? (
              <p className="text-gray-400 text-center py-12 italic">No applications found.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {jobApplications
                  .filter(a => applicationFilter === 'all' || a.status === applicationFilter)
                  .map(app => (
                    <div key={app.id} className={`py-4 ${!app.read ? 'bg-[#F3CF92]/10' : ''}`}>
                      <div
                        className="flex flex-wrap gap-3 items-start justify-between cursor-pointer"
                        onClick={() => {
                          if (!app.read) handleMarkApplicationRead(app.id);
                          setExpandedApplicationId(prev => prev === app.id ? null : app.id);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {!app.read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                            <span className="font-bold text-[#134137]">{app.name}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              app.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              app.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                              app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {app.position} · {app.email}
                            {app.years_experience != null && ` · ${app.years_experience} yr${app.years_experience !== 1 ? 's' : ''} exp`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex-shrink-0 text-gray-400">
                          {expandedApplicationId === app.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {expandedApplicationId === app.id && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-4">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-semibold text-[#134137] mb-1">Contact</p>
                              <p className="text-gray-700">{app.email}</p>
                              <p className="text-gray-700">{app.phone}</p>
                              {app.address && <p className="text-gray-500 text-xs mt-0.5">{app.address}</p>}
                            </div>
                            <div>
                              <p className="font-semibold text-[#134137] mb-1">Professional</p>
                              {app.years_experience != null && <p className="text-gray-600">{app.years_experience} yr{app.years_experience !== 1 ? 's' : ''} experience</p>}
                              {app.linkedin_url && <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="block text-[#134137] hover:underline text-xs truncate mt-0.5">LinkedIn</a>}
                              {app.portfolio_url && <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="block text-[#134137] hover:underline text-xs truncate mt-0.5">Portfolio</a>}
                            </div>
                            {app.cover_letter && (
                              <div>
                                <p className="font-semibold text-[#134137] mb-1">Cover Letter (text)</p>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-xs">{app.cover_letter}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                            <button onClick={() => handleDownloadResume(app.resume_url, app.name, 'CV')} className="flex items-center gap-2 bg-[#134137] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0d2e24] transition-colors">
                              <Download className="w-4 h-4" />Download CV
                            </button>
                            {app.cover_letter_url && (
                              <button onClick={() => handleDownloadResume(app.cover_letter_url!, app.name, 'CoverLetter')} className="flex items-center gap-2 bg-gray-200 text-[#134137] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">
                                <Download className="w-4 h-4" />Cover Letter
                              </button>
                            )}
                            {app.supporting_doc_url && (
                              <button onClick={() => handleDownloadResume(app.supporting_doc_url!, app.name, 'SupportingDoc')} className="flex items-center gap-2 bg-gray-200 text-[#134137] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">
                                <Download className="w-4 h-4" />Supporting Doc
                              </button>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-sm font-medium text-gray-600">Status:</span>
                              <select value={app.status} disabled={updatingApplicationId === app.id} onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none bg-white disabled:opacity-50">
                                <option value="new">New</option>
                                <option value="reviewing">Under Review</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interview_scheduled">Interview Scheduled</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              {updatingApplicationId === app.id && <span className="text-xs text-gray-400">Saving...</span>}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm font-semibold text-[#134137] mb-2">Internal Notes <span className="text-gray-400 font-normal text-xs">(admin only)</span></p>
                            <textarea
                              rows={3}
                              value={notesValues[app.id] ?? app.internal_notes ?? ''}
                              onChange={(e) => setNotesValues(prev => ({ ...prev, [app.id]: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none resize-none"
                              placeholder="Add internal notes about this applicant..."
                            />
                            <button
                              onClick={() => handleSaveInternalNotes(app.id)}
                              disabled={savingNotes === app.id}
                              className="mt-2 px-4 py-1.5 bg-[#134137] text-white text-sm font-semibold rounded-lg hover:bg-[#0d2e24] transition-colors disabled:opacity-50"
                            >
                              {savingNotes === app.id ? 'Saving...' : 'Save Notes'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {tab === 'general_apps' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#134137] mb-6">
              General Applications ({generalApplications.length})
            </h2>
            {loadingGenApps ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : generalApplications.length === 0 ? (
              <p className="text-gray-400 text-center py-12 italic">No general applications yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {generalApplications.map(app => (
                  <div key={app.id} className={`py-4 ${!app.read ? 'bg-[#F3CF92]/10' : ''}`}>
                    <div
                      className="flex flex-wrap gap-3 items-start justify-between cursor-pointer"
                      onClick={() => {
                        if (!app.read) handleMarkGenAppRead(app.id);
                        setExpandedGenAppId(prev => prev === app.id ? null : app.id);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!app.read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                          <span className="font-bold text-[#134137]">{app.name}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {app.email}
                          {app.area_of_interest && ` · ${app.area_of_interest}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="flex-shrink-0 text-gray-400">
                        {expandedGenAppId === app.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                    {expandedGenAppId === app.id && (
                      <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                        <div>
                          <p className="font-semibold text-[#134137] mb-1">Contact</p>
                          <p className="text-gray-700">{app.email}</p>
                        </div>
                        {app.area_of_interest && (
                          <div>
                            <p className="font-semibold text-[#134137] mb-1">Area of Interest</p>
                            <p className="text-gray-600">{app.area_of_interest}</p>
                          </div>
                        )}
                        {app.notes && (
                          <div>
                            <p className="font-semibold text-[#134137] mb-1">Notes</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{app.notes}</p>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          <button
                            onClick={() => handleDownloadResume(app.resume_url, app.name, 'CV')}
                            className="flex items-center gap-2 bg-[#134137] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0d2e24] transition-colors"
                          >
                            <Download className="w-4 h-4" />Download CV
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-[#134137] mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 text-[#134137] py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
