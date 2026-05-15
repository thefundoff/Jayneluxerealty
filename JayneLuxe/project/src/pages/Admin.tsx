import { useState, useEffect } from 'react';
import { Lock, LogOut, Plus, List, X, Upload, CreditCard as Edit2, Trash2, Eye, EyeOff, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

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
}

interface VariantRow {
  id?: string;
  label: string;
  description: string;
  square_feet: string;
  price: string;
}

export const Admin = () => {
  const [auth, setAuth] = useState<AdminAuthState>({ isAuthenticated: false, isLoading: true });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<'add' | 'list' | 'settings'>('add');
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
  });
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

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

  useEffect(() => {
    if (auth.isAuthenticated && tab === 'list') {
      fetchProperties();
    }
  }, [auth.isAuthenticated, tab]);

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
      });
      setImageFiles([]);
      setImagePreviews([]);
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
    });
    setImageFiles([]);
    setImagePreviews([]);
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
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
          <div className="flex gap-3 pb-3">
            <button
              onClick={() => setTab('add')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-bold transition-all ${
                tab === 'add'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Add Property</span>
            </button>
            <button
              onClick={() => setTab('list')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-bold transition-all ${
                tab === 'list'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <List className="w-5 h-5" />
              <span>All Properties</span>
            </button>
            <button
              onClick={() => setTab('settings')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-bold transition-all ${
                tab === 'settings'
                  ? 'bg-[#F3CF92] text-[#134137]'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'add' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#134137]">
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
                    <option value="townhouse">Townhouse</option>
                    <option value="condo">Condo</option>
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
              <div className="border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
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
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
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
                  Property Images {imagePreviews.length > 0 && `(${imagePreviews.length})`}
                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Property preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        {index === 0 && (
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
                )}

                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500 font-semibold">
                      {imagePreviews.length > 0 ? 'Add more images' : 'Click to upload property images'}
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
              <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
                <span className="text-red-900 font-semibold">
                  {selectedProperties.length} {selectedProperties.length === 1 ? 'property' : 'properties'} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProperties.length === properties.length && properties.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Title</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">City</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Price</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Type</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Beds/Baths</th>
                    <th className="px-6 py-4 text-left font-bold text-[#134137]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
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
            {properties.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                No properties found
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-[#134137] mb-6">Change Password</h2>

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
