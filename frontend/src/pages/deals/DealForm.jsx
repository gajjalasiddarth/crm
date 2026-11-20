import { useState } from 'react';
import { dealsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STAGES = ['prospecting','qualification','proposal','negotiation','closed_won','closed_lost'];

export default function DealForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '', value: initial?.value || '',
    stage: initial?.stage || 'prospecting', probability: initial?.probability || 20,
    expectedCloseDate: initial?.expectedCloseDate ? initial.expectedCloseDate.slice(0,10) : '',
    description: initial?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?._id) { await dealsAPI.update(initial._id, form); toast.success('Deal updated'); }
      else              { await dealsAPI.create(form);              toast.success('Deal created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label">Deal Title *</label><input className="input" value={form.title} onChange={e => set('title',e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Value ($) *</label><input type="number" className="input" value={form.value} onChange={e => set('value',e.target.value)} required min="0" /></div>
        <div>
          <label className="label">Stage</label>
          <select className="input" value={form.stage} onChange={e => set('stage',e.target.value)}>
            {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Probability ({form.probability}%)</label>
          <input type="range" min="0" max="100" value={form.probability} onChange={e => set('probability',+e.target.value)} className="w-full mt-2 accent-primary-600" />
        </div>
        <div><label className="label">Expected Close Date</label><input type="date" className="input" value={form.expectedCloseDate} onChange={e => set('expectedCloseDate',e.target.value)} /></div>
      </div>
      <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e => set('description',e.target.value)} /></div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Deal'}</button>
      </div>
    </form>
  );
}
