import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dealsAPI } from '../../services/api';
import { Badge, Modal, PageHeader } from '../../components/ui';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DealForm from './DealForm';

const STAGES = [
  { key: 'prospecting',   label: 'Prospecting',   color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { key: 'qualification', label: 'Qualification',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'proposal',      label: 'Proposal',       color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'negotiation',   label: 'Negotiation',    color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'closed_won',    label: 'Closed Won',     color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'closed_lost',   label: 'Closed Lost',    color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function Deals() {
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModal]   = useState(false);
  const [editing, setEditing]   = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await dealsAPI.getPipeline(); setPipeline(data.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDragStart = (dealId, fromStage) => setDragging({ dealId, fromStage });
  const handleDragOver  = (e, stage) => { e.preventDefault(); setDragOver(stage); };

  const handleDrop = async (e, toStage) => {
    e.preventDefault();
    if (!dragging || dragging.fromStage === toStage) { setDragging(null); setDragOver(null); return; }
    try {
      await dealsAPI.update(dragging.dealId, { stage: toStage });
      toast.success('Deal stage updated'); load();
    } catch { toast.error('Failed to update stage'); }
    setDragging(null); setDragOver(null);
  };

  const totalPipelineValue = Object.entries(pipeline)
    .filter(([s]) => !['closed_won','closed_lost'].includes(s))
    .reduce((sum, [, v]) => sum + (v.totalValue || 0), 0);

  return (
    <div>
      <PageHeader
        title="Deals Pipeline"
        subtitle={`Open pipeline: $${totalPipelineValue.toLocaleString()}`}
        actions={<button onClick={() => { setEditing(null); setModal(true); }} className="btn-primary"><PlusIcon className="w-4 h-4" />New Deal</button>}
      />

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading pipeline...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const col = pipeline[stage.key] || { count: 0, totalValue: 0, deals: [] };
            const isOver = dragOver === stage.key;
            return (
              <div
                key={stage.key}
                className={`flex-shrink-0 w-72 flex flex-col rounded-xl border transition-colors ${isOver ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200 bg-gray-50'}`}
                onDragOver={e => handleDragOver(e, stage.key)}
                onDrop={e => handleDrop(e, stage.key)}
              >
                {/* Column header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${stage.color}`}>{stage.label}</span>
                    <span className="text-xs font-medium text-gray-500">{col.count}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">${(col.totalValue || 0).toLocaleString()}</p>
                </div>

                {/* Deal cards */}
                <div className="flex-1 p-3 space-y-3 min-h-40">
                  {col.deals.map(deal => (
                    <div
                      key={deal._id}
                      draggable
                      onDragStart={() => handleDragStart(deal._id, stage.key)}
                      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <Link to={`/deals/${deal._id}`} className="font-medium text-sm text-gray-900 hover:text-primary-700 block mb-2">{deal.title}</Link>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">${(deal.value || 0).toLocaleString()}</span>
                        <span className="text-xs text-gray-400">{deal.probability}%</span>
                      </div>
                    </div>
                  ))}

                  {col.deals.length === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      Drop deals here
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setEditing({ stage: stage.key }); setModal(true); }}
                  className="m-3 p-2 text-xs text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg border border-dashed border-gray-300 hover:border-primary-300 transition-colors flex items-center justify-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add deal
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModal(false)} title={editing?._id ? 'Edit Deal' : 'New Deal'} size="lg">
        <DealForm initial={editing} onSave={() => { setModal(false); load(); }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}
