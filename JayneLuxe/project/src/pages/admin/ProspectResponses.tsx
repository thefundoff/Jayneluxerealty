import { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Download, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProspectSubmission, ProspectFormField } from '../../lib/database.types';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const answerToText = (value: string | string[] | undefined): string => {
  if (value === undefined || value === null) return '';
  return Array.isArray(value) ? value.join(', ') : String(value);
};

// RFC-4180-ish CSV escaping so the file opens cleanly in Excel.
const csvCell = (value: string): string => {
  const v = value ?? '';
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

export const ProspectResponses = () => {
  const [submissions, setSubmissions] = useState<ProspectSubmission[]>([]);
  const [fields, setFields] = useState<ProspectFormField[]>([]);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<ProspectSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [subRes, fieldRes] = await Promise.all([
      supabase.from('prospect_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('prospect_form_fields').select('*').order('sort_order'),
    ]);
    if (subRes.data) setSubmissions(subRes.data);
    if (fieldRes.data) setFields(fieldRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    await supabase.from('prospect_submissions').delete().eq('id', id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    if (viewing?.id === id) setViewing(null);
  };

  const filtered = submissions.filter((s) => {
    if (search.trim() === '') return true;
    const q = search.toLowerCase();
    const haystack = [s.full_name, s.phone, s.email, JSON.stringify(s.answers)].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  const exportCsv = () => {
    const headers = ['Submission ID', 'Date', 'Name', 'Phone', 'Email', ...fields.map((f) => f.label)];
    const rows = filtered.map((s) => [
      s.id,
      formatDate(s.created_at),
      s.full_name || '',
      s.phone || '',
      s.email || '',
      ...fields.map((f) => answerToText(s.answers?.[f.id])),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => csvCell(String(c))).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prospect-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#134137]">Prospect Responses</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {submissions.length} submissions</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="flex items-center space-x-2 bg-[#134137] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#0d2d26] transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, email, or any answer…"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No submissions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Phone</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-[#134137]">{s.full_name || '—'}</td>
                  <td className="py-3 pr-4 text-gray-600">{s.phone || '—'}</td>
                  <td className="py-3 pr-4 text-gray-600">{s.email || '—'}</td>
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{formatDate(s.created_at)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewing(s)} className="text-gray-500 hover:text-[#134137]" title="View">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="text-gray-500 hover:text-red-600" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-[#134137]">Submission Details</h3>
              <button onClick={() => setViewing(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-400">Submitted {formatDate(viewing.created_at)}</p>
              {fields.map((f) => {
                const ans = answerToText(viewing.answers?.[f.id]);
                if (ans === '') return null;
                return (
                  <div key={f.id}>
                    <p className="text-sm font-medium text-[#134137]">{f.label}</p>
                    <p className="text-gray-600">{ans}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
