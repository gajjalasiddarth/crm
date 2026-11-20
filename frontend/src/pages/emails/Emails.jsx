import { useEffect, useState, useCallback } from 'react';
import { emailsAPI } from '../../services/api';
import { Badge, Modal, PageHeader, EmptyState, Pagination } from '../../components/ui';
import { PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function ComposeForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ to: '', subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const set = (f,v) => setForm(p=>({...p,[f]:v}));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await emailsAPI.send({ ...form, to: form.to.split(',').map(s=>s.trim()) });
      toast.success('Email sent!'); onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label">To *</label><input className="input" placeholder="email@example.com, ..." value={form.to} onChange={e=>set('to',e.target.value)} required /></div>
      <div><label className="label">Subject *</label><input className="input" value={form.subject} onChange={e=>set('subject',e.target.value)} required /></div>
      <div>
        <label className="label">Body</label>
        <textarea className="input font-mono text-sm" rows={10} value={form.body} onChange={e=>set('body',e.target.value)} placeholder="Write your email here..." />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Sending...' : 'Send Email'}</button>
      </div>
    </form>
  );
}

function EmailPreview({ email, onClose }) {
  if (!email) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-gray-400">From: </span><span className="font-medium">{email.from}</span></div>
        <div><span className="text-gray-400">To: </span><span className="font-medium">{email.to?.join(', ')}</span></div>
        <div><span className="text-gray-400">Status: </span><Badge value={email.status} /></div>
        <div><span className="text-gray-400">Sent: </span><span>{email.sentAt ? format(new Date(email.sentAt),'MMM d, h:mm a') : '—'}</span></div>
      </div>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Body</p>
        <div className="text-sm text-gray-800 whitespace-pre-wrap">{email.body}</div>
      </div>
      <div className="flex justify-end"><button onClick={onClose} className="btn-secondary">Close</button></div>
    </div>
  );
}

export default function Emails() {
  const [emails, setEmails]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setCompose] = useState(false);
  const [preview, setPreview]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await emailsAPI.getAll({ page, limit: 15 });
      setEmails(data.data); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this email?')) return;
    await emailsAPI.delete(id); toast.success('Deleted'); load();
  };

  return (
    <div>
      <PageHeader title="Emails" subtitle={`${total} emails`}
        actions={<button onClick={() => setCompose(true)} className="btn-primary"><PlusIcon className="w-4 h-4" />Compose</button>}
      />

      <div className="card overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : emails.length === 0 ? (
          <EmptyState title="No emails yet" description="Compose your first email."
            action={<button onClick={() => setCompose(true)} className="btn-primary"><PlusIcon className="w-4 h-4" />Compose</button>} />
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-th">Subject</th>
                  <th className="table-th hidden md:table-cell">To</th>
                  <th className="table-th hidden lg:table-cell">Status</th>
                  <th className="table-th hidden lg:table-cell">Sent</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emails.map(email => (
                  <tr key={email._id} className="hover:bg-gray-50">
                    <td className="table-td font-medium text-gray-900">{email.subject}</td>
                    <td className="table-td hidden md:table-cell text-gray-500 text-xs">{email.to?.join(', ')}</td>
                    <td className="table-td hidden lg:table-cell"><Badge value={email.status} /></td>
                    <td className="table-td hidden lg:table-cell text-gray-400 text-xs">
                      {email.sentAt ? format(new Date(email.sentAt),'MMM d, h:mm a') : '—'}
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setPreview(email)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600"><EyeIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(email._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </div>

      <Modal open={composeOpen} onClose={() => setCompose(false)} title="Compose Email" size="lg">
        <ComposeForm onSave={() => { setCompose(false); load(); }} onCancel={() => setCompose(false)} />
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.subject || 'Email'} size="lg">
        <EmailPreview email={preview} onClose={() => setPreview(null)} />
      </Modal>
    </div>
  );
}
