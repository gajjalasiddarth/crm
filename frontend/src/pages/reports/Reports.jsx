import { useEffect, useState } from 'react';
import { reportsAPI } from '../../services/api';
import { PageHeader, Spinner, Avatar } from '../../components/ui';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BAR_COLORS  = ['#6366f1','#22c55e','#fbbf24','#f97316','#ef4444','#8b5cf6'];

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [revenue,   setRevenue]   = useState(null);
  const [team,      setTeam]      = useState(null);
  const [period,    setPeriod]    = useState('6months');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([reportsAPI.getDashboard(), reportsAPI.getRevenue({ period }), reportsAPI.getTeam().catch(() => null)])
      .then(([d, r, t]) => {
        setDashboard(d.data.data);
        setRevenue(r.data.data);
        if (t) setTeam(t.data.data);
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <Spinner />;

  const revenueChartData = revenue?.revenue?.map(r => ({
    name: `${MONTH_NAMES[r._id.month]} ${r._id.year}`,
    revenue: r.revenue,
    deals: r.count,
    avg: Math.round(r.avgDeal),
  })) || [];

  const pipelineData = revenue?.pipeline?.map(p => ({
    name: p._id.replace(/_/g, ' '),
    value: p.value,
    count: p.count,
  })) || [];

  const kpis = dashboard?.kpis || {};

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        actions={
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input w-auto">
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="12months">Last 12 months</option>
          </select>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue',   value: `$${(kpis.monthRevenue||0).toLocaleString()}`, sub: 'This month' },
          { label: 'Win Rate',        value: `${kpis.winRate||0}%`, sub: `${kpis.wonDeals||0} won / ${kpis.lostDeals||0} lost` },
          { label: 'Total Contacts',  value: kpis.totalContacts||0, sub: 'In CRM' },
          { label: 'Open Pipeline',   value: kpis.openDeals||0, sub: 'Active deals' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue over time */}
      <div className="card p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5">Revenue Over Time</h3>
        {revenueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `$${v.toLocaleString()}` : v, n]} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-gray-400 py-12 text-sm">No closed deals in this period</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline value */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Open Pipeline by Stage</h3>
          {pipelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-12 text-sm">No open deals</p>}
        </div>

        {/* Team performance */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Team Performance</h3>
          {team?.teamDeals?.length > 0 ? (
            <div className="space-y-5">
              {team.teamDeals.slice(0, 8).map(row => {
                const winRate = row.totalDeals > 0 ? Math.round((row.wonDeals / row.totalDeals) * 100) : 0;
                const leadConversion = row.totalLeads > 0 ? Math.round((row.convertedLeads / row.totalLeads) * 100) : 0;
                return (
                  <div key={row._id} className="flex items-start gap-3">
                    <Avatar name={row.user?.name || '?'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{row.user?.name}</span>
                        <span className="text-sm font-semibold text-green-600">${(row.revenue||0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${winRate}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{winRate}% win</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{row.totalDeals} deal{row.totalDeals !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>${(row.pipelineValue||0).toLocaleString()} pipeline</span>
                        {row.totalLeads > 0 && (
                          <>
                            <span>·</span>
                            <span>{row.convertedLeads}/{row.totalLeads} leads ({leadConversion}%)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12 text-sm">
              {team === null ? 'Manager or Admin role required to view team data' : 'No team data yet — assign deals to team members'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
