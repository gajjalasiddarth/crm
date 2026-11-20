import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dealsAPI } from '../../services/api';
import { Badge, Modal, Spinner } from '../../components/ui';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import DealForm from './DealForm';
import toast from 'react-hot-toast';

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEdit]   = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await dealsAPI.getOne(id); setDeal(data.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this deal?')) return;
    await dealsAPI.delete(id); toast.success('Deleted'); navigate('/deals');
  };

  if (loading) return <Spinner />;
  if (!deal) return <p className="text-center mt-12 text-gray-500">Deal not found</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/deals" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><ArrowLeftIcon className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{deal.title}</h1>
        <button onClick={() => setEdit(true)} className="btn-secondary"><PencilIcon className="w-4 h-4" />Edit</button>
        <button onClick={handleDelete} className="btn-danger"><TrashIcon className="w-4 h-4" />Delete</button>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Badge value={deal.stage} />
          <span className="text-2xl font-bold text-gray-900">${deal.value?.toLocaleString()}</span>
          <span className="text-gray-400 text-sm">{deal.probability}% probability</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          {[
            ['Weighted Value', `$${((deal.value * deal.probability) / 100).toLocaleString()}`],
            ['Contact', deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '—'],
            ['Assigned To', deal.assignedTo?.name || '—'],
            ['Expected Close', deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate),'MMM d, yyyy') : '—'],
            ['Created', format(new Date(deal.createdAt), 'MMM d, yyyy')],
            ['Currency', deal.currency || 'USD'],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="font-medium text-gray-900">{val}</p>
            </div>
          ))}
        </div>
        {deal.description && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{deal.description}</p>
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEdit(false)} title="Edit Deal" size="lg">
        <DealForm initial={deal} onSave={() => { setEdit(false); load(); }} onCancel={() => setEdit(false)} />
      </Modal>
    </div>
  );
}
