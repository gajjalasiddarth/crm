import { useState } from 'react';
import { contactsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const empty = {
  firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '',
  status: 'prospect', source: 'other', notes: '',
  address: { street: '', city: '', state: '', country: '', zip: '' },
  socialLinks: { linkedin: '', twitter: '' },
};

export default function ContactForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    firstName: initial.firstName, lastName: initial.lastName, email: initial.email,
    phone: initial.phone || '', company: initial.company || '', jobTitle: initial.jobTitle || '',
    status: initial.status, source: initial.source, notes: initial.notes || '',
    address: initial.address || empty.address,
    socialLinks: initial.socialLinks || empty.socialLinks,
  } : empty);
  const [loading, setLoading] = useState(false);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setNested = (group, field, val) => setForm(f => ({ ...f, [group]: { ...f[group], [field]: val } }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial) { await contactsAPI.update(initial._id, form); toast.success('Contact updated'); }
      else         { await contactsAPI.create(form);              toast.success('Contact created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving contact'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">First Name *</label><input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} required /></div>
        <div><label className="label">Last Name *</label><input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Company</label><input className="input" value={form.company} onChange={e => set('company', e.target.value)} /></div>
        <div><label className="label">Job Title</label><input className="input" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            {['prospect','active','customer','inactive','churned'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Source</label>
          <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
            {['website','referral','cold_call','email','social','event','other'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Address</label>
        <div className="grid grid-cols-2 gap-2">
          <input className="input col-span-2" placeholder="Street" value={form.address.street} onChange={e => setNested('address','street',e.target.value)} />
          <input className="input" placeholder="City"    value={form.address.city}    onChange={e => setNested('address','city',e.target.value)} />
          <input className="input" placeholder="State"   value={form.address.state}   onChange={e => setNested('address','state',e.target.value)} />
          <input className="input" placeholder="Country" value={form.address.country} onChange={e => setNested('address','country',e.target.value)} />
          <input className="input" placeholder="ZIP"     value={form.address.zip}     onChange={e => setNested('address','zip',e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">LinkedIn</label><input className="input" placeholder="linkedin.com/in/..." value={form.socialLinks.linkedin} onChange={e => setNested('socialLinks','linkedin',e.target.value)} /></div>
        <div><label className="label">Twitter</label><input className="input" placeholder="@handle" value={form.socialLinks.twitter} onChange={e => setNested('socialLinks','twitter',e.target.value)} /></div>
      </div>

      <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Contact'}</button>
      </div>
    </form>
  );
}
