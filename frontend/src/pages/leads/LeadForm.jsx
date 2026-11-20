import { useState } from 'react';
import { leadsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const empty = { title: '', email: '', phone: '', company: '', status: 'new', priority: 'medium', source: 'other', estimatedValue: '', probability: 20, notes: '', followUpDate: '' };

export default function LeadForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    title: initial.title, email: initial.email || '', phone: initial.phone || '',
    company: initial.company || '', status: initial.status, priority: initial.priority,
    source: initial.source, estimatedValue: initial.estimatedValue || '',
    probability: initial.probability, notes: initial.notes || '',
    followUpDate: initial.followUpDate ? initial.followUpDate.slice(0,10) : '',
  } : empty);
  const [loading, setLoading] = useState(false);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial) { await leadsAPI.update(initial._id, form); toast.success('Lead updated'); }
      else         { await leadsAPI.create(form);              toast.success('Lead created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => set('title',e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => set('email',e.target.value)} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => set('phone',e.target.value)} /></div>
      </div>
      <div><label className="label">Company</label><input className="input" value={form.company} onChange={e => set('company',e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status',e.target.value)}>
            {['new','contacted','qualified','unqualified'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={e => set('priority',e.target.value)}>
            {['low','medium','high'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Source</label>
          <select className="input" value={form.source} onChange={e => set('source',e.target.value)}>
            {['website','referral','cold_call','email','social','event','other'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Est. Value ($)</label><input type="number" className="input" value={form.estimatedValue} onChange={e => set('estimatedValue',e.target.value)} /></div>
        <div>
          <label className="label">Probability ({form.probability}%)</label>
          <input type="range" min="0" max="100" value={form.probability} onChange={e => set('probability',+e.target.value)} className="w-full mt-2 accent-primary-600" />
        </div>
      </div>
      <div><label className="label">Follow-up Date</label><input type="date" className="input" value={form.followUpDate} onChange={e => set('followUpDate',e.target.value)} /></div>
      <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e => set('notes',e.target.value)} /></div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Lead'}</button>
      </div>
    </form>
  );
}
