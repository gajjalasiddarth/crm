import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { leadsAPI } from '../../services/api';
import { Badge, Modal, PageHeader, SearchInput, Pagination, EmptyState } from '../../components/ui';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LeadForm from './LeadForm';

export default function Leads() {
  const [leads, setLeads]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getAll({ page, limit: 10, search, status: statusF });
      setLeads(data.data); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, search, statusF]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusF]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await leadsAPI.delete(id);
    toast.success('Lead deleted'); load();
  };

  const handleConvert = async (lead) => {
    if (!window.confirm(`Convert "${lead.title}" to a deal?`)) return;
    try {
      await leadsAPI.convert(lead._id, { dealTitle: `Deal: ${lead.title}`, dealValue: lead.estimatedValue });
      toast.success('Lead converted to deal!'); load();
    } catch { toast.error('Conversion failed'); }
  };

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${total} leads total`}
        actions={<button onClick={() => { setEditing(null); setModal(true); }} className="btn-primary"><PlusIcon className="w-4 h-4" />New Lead</button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="input w-auto">
          <option value="">All Statuses</option>
          {['new','contacted','qualified','unqualified','converted'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : leads.length === 0 ? (
          <EmptyState title="No leads found" description="Create your first lead."
            action={<button onClick={() => { setEditing(null); setModal(true); }} className="btn-primary"><PlusIcon className="w-4 h-4" />New Lead</button>} />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-th">Lead</th>
                <th className="table-th hidden md:table-cell">Status</th>
                <th className="table-th hidden lg:table-cell">Priority</th>
                <th className="table-th hidden lg:table-cell">Est. Value</th>
                <th className="table-th hidden md:table-cell">Assigned</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map(l => (
                <tr key={l._id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <Link to={`/leads/${l._id}`} className="font-medium text-primary-700 hover:underline">{l.title}</Link>
                    <p className="text-xs text-gray-400">{l.company || l.email}</p>
                  </td>
                  <td className="table-td hidden md:table-cell"><Badge value={l.status} /></td>
                  <td className="table-td hidden lg:table-cell"><Badge value={l.priority} /></td>
                  <td className="table-td hidden lg:table-cell text-gray-700">{l.estimatedValue ? `$${l.estimatedValue.toLocaleString()}` : '—'}</td>
                  <td className="table-td hidden md:table-cell text-gray-500 text-xs">{l.assignedTo?.name || '—'}</td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      {l.status !== 'converted' && (
                        <button onClick={() => handleConvert(l)} title="Convert to deal" className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { setEditing(l); setModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(l._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModal(false)} title={editing ? 'Edit Lead' : 'New Lead'} size="lg">
        <LeadForm initial={editing} onSave={() => { setModal(false); load(); }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}
