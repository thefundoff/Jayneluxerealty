import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProspectReview } from '../../lib/database.types';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};

export const Reviews = () => {
  const [reviews, setReviews] = useState<ProspectReview[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [reviewsPublic, setReviewsPublic] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [revRes, setRes] = await Promise.all([
      supabase.from('prospect_reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('prospect_settings').select('value').eq('key', 'reviews_public').maybeSingle(),
    ]);
    if (revRes.data) setReviews(revRes.data);
    if (setRes.data) setReviewsPublic(setRes.data.value !== false);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('prospect_reviews').update({ status }).eq('id', id);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const toggleFeatured = async (r: ProspectReview) => {
    await supabase.from('prospect_reviews').update({ is_featured: !r.is_featured }).eq('id', r.id);
    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_featured: !x.is_featured } : x)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    await supabase.from('prospect_reviews').delete().eq('id', id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const togglePublic = async () => {
    const next = !reviewsPublic;
    setReviewsPublic(next);
    await supabase.from('prospect_settings').upsert({ key: 'reviews_public', value: next });
  };

  const filtered = reviews.filter((r) => filter === 'all' || r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#134137]">Customer Reviews</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm font-medium text-[#134137]">Show approved reviews publicly</span>
          <button
            type="button"
            onClick={togglePublic}
            className={`relative w-11 h-6 rounded-full transition-colors ${reviewsPublic ? 'bg-[#134137]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${reviewsPublic ? 'translate-x-5' : ''}`} />
          </button>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-[#F3CF92] text-[#134137]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
            {s === 'pending' && pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews in this view.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#134137]">{r.name || 'Anonymous'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${STATUS_STYLES[r.status] || ''}`}>{r.status}</span>
                    {r.is_featured && <span className="text-xs px-2 py-0.5 rounded font-medium bg-[#F3CF92]/40 text-[#134137]">Featured</span>}
                  </div>
                  {r.rating && (
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= (r.rating || 0) ? 'fill-[#F3CF92] text-[#F3CF92]' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
              </div>

              <p className="text-gray-700 mb-3">{r.review}</p>

              <div className="flex flex-wrap gap-2">
                {r.status !== 'approved' && (
                  <button onClick={() => setStatus(r.id, 'approved')} className="flex items-center gap-1 text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-medium hover:bg-green-200">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => setStatus(r.id, 'rejected')} className="flex items-center gap-1 text-sm bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-medium hover:bg-red-200">
                    <X className="w-4 h-4" /> Reject
                  </button>
                )}
                <button onClick={() => toggleFeatured(r)} className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200">
                  <Star className={`w-4 h-4 ${r.is_featured ? 'fill-[#F3CF92] text-[#F3CF92]' : ''}`} />
                  {r.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1 text-sm text-gray-500 px-3 py-1.5 rounded-lg font-medium hover:text-red-600">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
