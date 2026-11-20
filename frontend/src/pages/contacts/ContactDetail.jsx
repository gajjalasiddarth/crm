import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contactsAPI } from '../../services/api';
import { Badge, Avatar, Modal, Spinner } from '../../components/ui';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ContactForm from './ContactForm';
import toast from 'react-hot-toast';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact]       = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editOpen, setEditOpen]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([contactsAPI.getOne(id), contactsAPI.getActivities(id)]);
      setContact(c.data.data); setActivities(a.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${contact.firstName}?`)) return;
    await contactsAPI.delete(id);
    toast.success('Contact deleted');
    navigate('/contacts');
  };

  if (loading) return <Spinner />;
  if (!contact) return <p className="text-center text-gray-500 mt-12">Contact not found</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/contacts" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{contact.firstName} {contact.lastName}</h1>
        <button onClick={() => setEditOpen(true)} className="btn-secondary"><PencilIcon className="w-4 h-4" />Edit</button>
        <button onClick={handleDelete} className="btn-danger"><TrashIcon className="w-4 h-4" />Delete</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info panel */}
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-6">
              <Avatar name={`${contact.firstName} ${contact.lastName}`} size="lg" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{contact.firstName} {contact.lastName}</h2>
                <p className="text-gray-500">{contact.jobTitle}{contact.jobTitle && contact.company ? ' at ' : ''}{contact.company}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge value={contact.status} />
                  <Badge value={contact.source} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Email',   contact.email],
                ['Phone',   contact.phone || '—'],
                ['Company', contact.company || '—'],
                ['City',    contact.address?.city || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-gray-900 font-medium">{val}</p>
                </div>
              ))}
            </div>

            {contact.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{contact.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity timeline */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Activity Timeline</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {activities.map((a, i) => (
                <div key={a._id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <Avatar name={a.performedBy?.name || '?'} size="sm" />
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-700">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.performedBy?.name} · {format(new Date(a.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Contact" size="lg">
        <ContactForm initial={contact} onSave={() => { setEditOpen(false); load(); }} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
