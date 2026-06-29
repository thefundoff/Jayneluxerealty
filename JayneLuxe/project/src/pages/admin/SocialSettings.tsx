import { useState, useEffect } from 'react';
import { Save, QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '../../lib/supabase';
import type { ProspectSocialLink } from '../../lib/database.types';

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
};

export const SocialSettings = () => {
  const [links, setLinks] = useState<ProspectSocialLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  const pageUrl = `${window.location.origin}${window.location.pathname}#/prospect`;

  useEffect(() => {
    supabase
      .from('prospect_social_links')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setLinks(data);
      });
  }, []);

  useEffect(() => {
    QRCode.toDataURL(pageUrl, { width: 320, margin: 2, color: { dark: '#134137', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [pageUrl]);

  const update = (platform: string, patch: Partial<ProspectSocialLink>) =>
    setLinks((prev) => prev.map((l) => (l.platform === platform ? { ...l, ...patch } : l)));

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const { error } = await supabase
      .from('prospect_social_links')
      .upsert(links.map((l) => ({ platform: l.platform, url: l.url, is_enabled: l.is_enabled, sort_order: l.sort_order })));
    setSaving(false);
    setMessage(error ? 'Could not save. Please try again.' : 'Social links saved successfully.');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#134137] mb-1">Social Media Settings</h2>
        <p className="text-gray-500 text-sm mb-6">These links appear on the public prospect page. Changes apply immediately after saving.</p>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          {links.map((l) => (
            <div key={l.platform} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="w-32 font-medium text-[#134137] flex-shrink-0">{PLATFORM_LABELS[l.platform] || l.platform}</label>
              <input
                type="url"
                value={l.url}
                onChange={(e) => update(l.platform, { url: e.target.value })}
                placeholder={`https://…`}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3CF92] focus:border-transparent outline-none"
              />
              <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <button
                  type="button"
                  onClick={() => update(l.platform, { is_enabled: !l.is_enabled })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${l.is_enabled ? 'bg-[#134137]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${l.is_enabled ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-gray-500 w-14">{l.is_enabled ? 'Shown' : 'Hidden'}</span>
              </label>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center space-x-2 bg-[#F3CF92] text-[#134137] px-5 py-2 rounded-lg font-bold hover:bg-[#e6c07f] transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving…' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <div className="flex items-center space-x-2 mb-2">
          <QrCode className="w-6 h-6 text-[#134137]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#134137]">Prospect Page QR Code</h2>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Print or share this code at outreaches and events. It permanently points to the prospect page, even when you change the form questions.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {qrDataUrl && (
            <div className="bg-white border border-gray-200 p-4 rounded-xl">
              <img src={qrDataUrl} alt="Prospect page QR code" className="w-48 h-48" />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 mb-1">Links to:</p>
            <p className="text-[#134137] font-mono text-sm break-all mb-4">{pageUrl}</p>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download="jayne-luxe-realty-qr.png"
                className="inline-flex items-center space-x-2 bg-[#134137] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#0d2d26] transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Download QR Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
