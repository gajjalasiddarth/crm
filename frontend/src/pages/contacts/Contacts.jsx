import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contactsAPI } from '../../services/api';
import { Badge, Modal, PageHeader, SearchInput, Pagination, EmptyState, Avatar } from '../../components/ui';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ContactForm from './ContactForm';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('');
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModal]   = useState(false);
  const [editing, setEditing]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contactsAPI.getAll({ page, limit: 10, search, status: statusFilter });
      setContacts(data.data); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openCreate = () => { setEditing(null); setModal(true); };
  const openEdit   = (c) => { setEditing(c); setModal(true); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await contactsAPI.delete(id);
    toast.success('Contact deleted');
    load();
  };

  const handleSave = () => { setModal(false); load(); };

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${total} contacts total`}
        actions={<button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" />New Contact</button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search contacts..." />
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="input w-auto">
          <option value="">All Statuses</option>
          {['prospect','active','customer','inactive','churned'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : contacts.length === 0 ? (
          <EmptyState
            title="No contacts found"
            description="Add your first contact to get started."
            action={<button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" />Add Contact</button>}
          />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th hidden md:table-cell">Company</th>
                <th className="table-th hidden lg:table-cell">Status</th>
                <th className="table-th hidden lg:table-cell">Source</th>
                <th className="table-th hidden md:table-cell">Assigned To</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
                      <div>
                        <Link to={`/contacts/${c._id}`} className="font-medium text-primary-700 hover:underline">
                          {c.firstName} {c.lastName}
                        </Link>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td hidden md:table-cell text-gray-600">{c.company || '—'}</td>
                  <td className="table-td hidden lg:table-cell"><Badge value={c.status} /></td>
                  <td className="table-td hidden lg:table-cell capitalize text-gray-500 text-xs">{c.source}</td>
                  <td className="table-td hidden md:table-cell text-gray-500 text-xs">{c.assignedTo?.name || '—'}</td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c._id, `${c.firstName} ${c.lastName}`)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
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

      <Modal open={modalOpen} onClose={() => setModal(false)} title={editing ? 'Edit Contact' : 'New Contact'} size="lg">
        <ContactForm initial={editing} onSave={handleSave} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}
