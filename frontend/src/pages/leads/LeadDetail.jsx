import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leadsAPI } from '../../services/api';
import { Badge, Modal, Spinner } from '../../components/ui';
import { PencilIcon, TrashIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import LeadForm from './LeadForm';
import toast from 'react-hot-toast';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await leadsAPI.getOne(id); setLead(data.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this lead?')) return;
    await leadsAPI.delete(id); toast.success('Lead deleted'); navigate('/leads');
  };

  const handleConvert = async () => {
    if (!window.confirm('Convert this lead to a deal?')) return;
    try {
      const res = await leadsAPI.convert(id, { dealTitle: `Deal: ${lead.title}`, dealValue: lead.estimatedValue });
      toast.success('Converted!'); navigate(`/deals/${res.data.data.deal._id}`);
    } catch { toast.error('Conversion failed'); }
  };

  if (loading) return <Spinner />;
  if (!lead) return <p className="text-center mt-12 text-gray-500">Lead not found</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/leads" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><ArrowLeftIcon className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{lead.title}</h1>
        {lead.status !== 'converted' && (
          <button onClick={handleConvert} className="btn-secondary text-green-700 border-green-300 hover:bg-green-50">
            <ArrowPathIcon className="w-4 h-4" /> Convert to Deal
          </button>
        )}
        <button onClick={() => setEdit(true)} className="btn-secondary"><PencilIcon className="w-4 h-4" />Edit</button>
        <button onClick={handleDelete} className="btn-danger"><TrashIcon className="w-4 h-4" />Delete</button>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Badge value={lead.status} />
          <Badge value={lead.priority} />
          <Badge value={lead.source} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          {[
            ['Email',    lead.email || '—'],
            ['Phone',    lead.phone || '—'],
            ['Company',  lead.company || '—'],
            ['Est. Value', lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '—'],
            ['Probability', `${lead.probability}%`],
            ['Assigned To', lead.assignedTo?.name || '—'],
            ['Follow-up',  lead.followUpDate ? format(new Date(lead.followUpDate),'MMM d, yyyy') : '—'],
            ['Created',    format(new Date(lead.createdAt), 'MMM d, yyyy')],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="font-medium text-gray-900">{val}</p>
            </div>
          ))}
        </div>
        {lead.notes && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{lead.notes}</p>
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEdit(false)} title="Edit Lead" size="lg">
        <LeadForm initial={lead} onSave={() => { setEdit(false); load(); }} onCancel={() => setEdit(false)} />
      </Modal>
    </div>
  );
}
