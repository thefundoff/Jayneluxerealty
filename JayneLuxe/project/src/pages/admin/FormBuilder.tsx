import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProspectFormField, ProspectFieldType } from '../../lib/database.types';

const FIELD_TYPES: { value: ProspectFieldType; label: string }[] = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date Picker' },
];

const typeLabel = (t: string) => FIELD_TYPES.find((f) => f.value === t)?.label || t;
const needsOptions = (t: string) => ['dropdown', 'radio', 'checkbox'].includes(t);

interface Editor {
  id: string | null;
  label: string;
  field_type: ProspectFieldType;
  field_role: '' | 'name' | 'email' | 'phone';
  placeholder: string;
  optionsText: string;
  is_required: boolean;
  is_enabled: boolean;
}

const emptyEditor: Editor = {
  id: null,
  label: '',
  field_type: 'short_text',
  field_role: '',
  placeholder: '',
  optionsText: '',
  is_required: false,
  is_enabled: true,
};

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none';

export const FormBuilder = () => {
  const [fields, setFields] = useState<ProspectFormField[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const fetchFields = async () => {
    const { data } = await supabase.from('prospect_form_fields').select('*').order('sort_order');
    if (data) setFields(data);
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const openNew = () => setEditor({ ...emptyEditor });
  const openEdit = (f: ProspectFormField) =>
    setEditor({
      id: f.id,
      label: f.label,
      field_type: f.field_type as ProspectFieldType,
      field_role: (f.field_role as Editor['field_role']) || '',
      placeholder: f.placeholder || '',
      optionsText: (f.options || []).join('\n'),
      is_required: f.is_required,
      is_enabled: f.is_enabled,
    });

  const handleSave = async () => {
    if (!editor) return;
    if (editor.label.trim() === '') {
      setError('Question label is required.');
      return;
    }
    const options = needsOptions(editor.field_type)
      ? editor.optionsText.split('\n').map((o) => o.trim()).filter((o) => o !== '')
      : [];
    if (needsOptions(editor.field_type) && options.length === 0) {
      setError('Please add at least one option for this field type.');
      return;
    }

    setSaving(true);
    setError('');
    const payload = {
      label: editor.label.trim(),
      field_type: editor.field_type,
      field_role: editor.field_role || null,
      placeholder: editor.placeholder.trim() || null,
      options,
      is_required: editor.is_required,
      is_enabled: editor.is_enabled,
    };

    let err;
    if (editor.id) {
      ({ error: err } = await supabase.from('prospect_form_fields').update(payload).eq('id', editor.id));
    } else {
      const nextOrder = fields.length > 0 ? Math.max(...fields.map((f) => f.sort_order)) + 1 : 1;
      ({ error: err } = await supabase.from('prospect_form_fields').insert({ ...payload, sort_order: nextOrder }));
    }
    setSaving(false);
    if (err) {
      setError('Could not save the question. Please try again.');
      return;
    }
    setEditor(null);
    fetchFields();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    await supabase.from('prospect_form_fields').delete().eq('id', id);
    fetchFields();
  };

  const quickToggle = async (f: ProspectFormField, key: 'is_required' | 'is_enabled') => {
    await supabase.from('prospect_form_fields').update({ [key]: !f[key] }).eq('id', f.id);
    fetchFields();
  };

  const persistOrder = async (ordered: ProspectFormField[]) => {
    setFields(ordered);
    await Promise.all(
      ordered.map((f, i) =>
        f.sort_order === i + 1 ? Promise.resolve() : supabase.from('prospect_form_fields').update({ sort_order: i + 1 }).eq('id', f.id)
      )
    );
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  };

  const onDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...fields];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    persistOrder(next);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#134137]">Form Builder</h2>
          <p className="text-gray-500 text-sm mt-1">Drag to reorder. Changes apply to the public form immediately.</p>
        </div>
        {!editor && (
          <button
            onClick={openNew}
            className="flex items-center space-x-2 bg-[#134137] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#0d2d26] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Question</span>
          </button>
        )}
      </div>

      {editor && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#134137]">{editor.id ? 'Edit Question' : 'New Question'}</h3>
            <button onClick={() => setEditor(null)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#134137] mb-2">Question Label *</label>
              <input
                type="text"
                value={editor.label}
                onChange={(e) => setEditor({ ...editor, label: e.target.value })}
                className={inputClass}
                placeholder="e.g., What is your estimated budget range?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134137] mb-2">Field Type</label>
              <select
                value={editor.field_type}
                onChange={(e) => setEditor({ ...editor, field_type: e.target.value as ProspectFieldType })}
                className={inputClass}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134137] mb-2">
                Maps To <span className="text-gray-400 font-normal">(for the responses table)</span>
              </label>
              <select
                value={editor.field_role}
                onChange={(e) => setEditor({ ...editor, field_role: e.target.value as Editor['field_role'] })}
                className={inputClass}
              >
                <option value="">— None —</option>
                <option value="name">Name column</option>
                <option value="email">Email column</option>
                <option value="phone">Phone column</option>
              </select>
            </div>

            {needsOptions(editor.field_type) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#134137] mb-2">Options (one per line)</label>
                <textarea
                  rows={5}
                  value={editor.optionsText}
                  onChange={(e) => setEditor({ ...editor, optionsText: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder={'Option 1\nOption 2\nOption 3'}
                />
              </div>
            )}

            {!needsOptions(editor.field_type) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#134137] mb-2">Placeholder (optional)</label>
                <input
                  type="text"
                  value={editor.placeholder}
                  onChange={(e) => setEditor({ ...editor, placeholder: e.target.value })}
                  className={inputClass}
                  placeholder="Hint text shown inside the field"
                />
              </div>
            )}

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editor.is_required}
                onChange={(e) => setEditor({ ...editor, is_required: e.target.checked })}
                className="w-4 h-4 rounded text-[#134137] focus:ring-[#F3CF92]"
              />
              <span className="text-gray-700">Required field</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editor.is_enabled}
                onChange={(e) => setEditor({ ...editor, is_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#134137] focus:ring-[#F3CF92]"
              />
              <span className="text-gray-700">Enabled (visible on form)</span>
            </label>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-[#F3CF92] text-[#134137] px-5 py-2 rounded-lg font-bold hover:bg-[#e6c07f] transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving…' : 'Save Question'}</span>
            </button>
            <button onClick={() => setEditor(null)} className="px-5 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {fields.length === 0 && <p className="text-gray-500 text-center py-8">No questions yet. Add your first one above.</p>}
        {fields.map((f, index) => (
          <div
            key={f.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(index)}
            className={`flex items-center gap-3 p-3 border rounded-lg bg-white ${
              dragIndex === index ? 'border-[#F3CF92] opacity-60' : 'border-gray-200'
            } ${!f.is_enabled ? 'opacity-60' : ''}`}
          >
            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab flex-shrink-0" />

            <div className="flex flex-col flex-shrink-0">
              <button onClick={() => move(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-[#134137] disabled:opacity-30">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === fields.length - 1}
                className="text-gray-400 hover:text-[#134137] disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-grow min-w-0">
              <p className="font-semibold text-[#134137] truncate">
                {f.label}
                {f.is_required && <span className="text-red-500 ml-1">*</span>}
              </p>
              <div className="flex flex-wrap gap-2 items-center mt-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{typeLabel(f.field_type)}</span>
                {f.field_role && <span className="text-xs bg-[#F3CF92]/40 text-[#134137] px-2 py-0.5 rounded">→ {f.field_role}</span>}
                {f.options.length > 0 && <span className="text-xs text-gray-400">{f.options.length} options</span>}
              </div>
            </div>

            <button
              onClick={() => quickToggle(f, 'is_required')}
              title={f.is_required ? 'Make optional' : 'Make required'}
              className={`text-xs px-2 py-1 rounded font-medium flex-shrink-0 ${
                f.is_required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f.is_required ? 'Required' : 'Optional'}
            </button>

            <button
              onClick={() => quickToggle(f, 'is_enabled')}
              title={f.is_enabled ? 'Disable' : 'Enable'}
              className="text-gray-500 hover:text-[#134137] flex-shrink-0"
            >
              {f.is_enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>

            <button onClick={() => openEdit(f)} className="text-gray-500 hover:text-[#134137] flex-shrink-0">
              <Edit2 className="w-5 h-5" />
            </button>

            <button onClick={() => handleDelete(f.id)} className="text-gray-500 hover:text-red-600 flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
