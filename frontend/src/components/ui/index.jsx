import { useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/* ─── Modal ─── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── ConfirmDialog ─── */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <ExclamationTriangleIcon className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 justify-center ${danger ? 'btn-danger' : 'btn-primary'}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Badge ─── */
const badgeColors = {
  // Status
  active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-700',
  prospect: 'bg-blue-100 text-blue-800', customer: 'bg-purple-100 text-purple-800',
  churned: 'bg-red-100 text-red-700',
  // Lead status
  new: 'bg-blue-100 text-blue-800', contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800', unqualified: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-800',
  // Deal stage
  prospecting: 'bg-gray-100 text-gray-700', qualification: 'bg-blue-100 text-blue-800',
  proposal: 'bg-yellow-100 text-yellow-800', negotiation: 'bg-orange-100 text-orange-800',
  closed_won: 'bg-green-100 text-green-800', closed_lost: 'bg-red-100 text-red-700',
  // Priority
  low: 'bg-gray-100 text-gray-700', medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800', urgent: 'bg-red-100 text-red-700',
  // Task status
  todo: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-700',
  // Roles
  admin: 'bg-purple-100 text-purple-800', manager: 'bg-blue-100 text-blue-800',
  sales_rep: 'bg-green-100 text-green-800', viewer: 'bg-gray-100 text-gray-700',
  // Email
  sent: 'bg-green-100 text-green-800', draft: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-700',
};

export function Badge({ value, label }) {
  const key = (value || '').toLowerCase().replace(' ', '_');
  const colors = badgeColors[key] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`badge ${colors}`}>
      {label || (value || '').replace(/_/g, ' ')}
    </span>
  );
}

/* ─── StatCard ─── */
export function StatCard({ label, value, sub, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green:   'bg-green-50 text-green-600',
    yellow:  'bg-yellow-50 text-yellow-600',
    red:     'bg-red-50 text-red-600',
    purple:  'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Spinner ─── */
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`} />
    </div>
  );
}

/* ─── EmptyState ─── */
export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

/* ─── Avatar ─── */
export function Avatar({ name = '', size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-primary-100 text-primary-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${sizes[size]} ${color}`}>
      {initials}
    </div>
  );
}

/* ─── PageHeader ─── */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0 ml-4">{actions}</div>}
    </div>
  );
}

/* ─── SearchInput ─── */
export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input pl-9 w-64" />
    </div>
  );
}

/* ─── Pagination ─── */
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-500">Page {page} of {pages}</p>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => onPage(page - 1)} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Prev</button>
        <button disabled={page === pages} onClick={() => onPage(page + 1)} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
