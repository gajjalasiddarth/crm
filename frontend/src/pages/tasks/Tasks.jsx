import { useEffect, useState, useCallback } from 'react';
import { tasksAPI } from '../../services/api';
import { Badge, Modal, PageHeader, SearchInput, EmptyState, Pagination } from '../../components/ui';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const TYPES  = ['call','email','meeting','follow_up','demo','other'];
const STATUS = ['todo','in_progress','completed','cancelled'];

function TaskForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '', description: initial?.description || '',
    type: initial?.type || 'other', status: initial?.status || 'todo',
    priority: initial?.priority || 'medium',
    dueDate: initial?.dueDate ? initial.dueDate.slice(0,10) : '',
  });
  const [loading, setLoading] = useState(false);
  const set = (f,v) => setForm(p => ({...p,[f]:v}));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (initial?._id) { await tasksAPI.update(initial._id, form); toast.success('Task updated'); }
      else              { await tasksAPI.create(form);              toast.success('Task created'); }
      onSave();
    } catch { toast.error('Error saving task'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e=>set('title',e.target.value)} required /></div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={e=>set('type',e.target.value)}>
            {TYPES.map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={e=>set('priority',e.target.value)}>
            {['low','medium','high','urgent'].map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
            {STATUS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)} /></div>
      <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} /></div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Task'}</button>
      </div>
    </form>
  );
}

export default function Tasks() {
  const [tasks, setTasks]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [priorityF, setPriorityF] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await tasksAPI.getAll({ page, limit: 15, status: statusF, priority: priorityF });
      setTasks(data.data); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, statusF, priorityF]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (task) => {
    await tasksAPI.update(task._id, { status: task.status === 'completed' ? 'todo' : 'completed' });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete task?')) return;
    await tasksAPI.delete(id); toast.success('Deleted'); load();
  };

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${total} tasks`}
        actions={<button onClick={() => { setEditing(null); setModal(true); }} className="btn-primary"><PlusIcon className="w-4 h-4" />New Task</button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All Statuses</option>
          {STATUS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={priorityF} onChange={e => { setPriorityF(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All Priorities</option>
          {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : tasks.length === 0 ? (
          <EmptyState title="No tasks found" description="Create your first task."
            action={<button onClick={() => { setEditing(null); setModal(true); }} className="btn-primary"><PlusIcon className="w-4 h-4" />New Task</button>} />
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map(task => {
              const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';
              return (
                <div key={task._id} className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                  <button onClick={() => handleComplete(task)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-primary-500'}`}>
                    {task.status === 'completed' && <CheckIcon className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400 capitalize">{task.type.replace('_',' ')}</span>
                      {task.dueDate && (
                        <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {overdue ? 'Overdue · ' : ''}{format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge value={task.priority} />
                    <Badge value={task.status} />
                    <button onClick={() => { setEditing(task); setModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModal(false)} title={editing ? 'Edit Task' : 'New Task'}>
        <TaskForm initial={editing} onSave={() => { setModal(false); load(); }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}
