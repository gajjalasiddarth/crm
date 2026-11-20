import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, tasksAPI } from '../services/api';
import { StatCard, Badge, Avatar, Spinner, PageHeader } from '../components/ui';
import {
  UsersIcon, FunnelIcon, CurrencyDollarIcon, CheckCircleIcon,
  TrophyIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format } from 'date-fns';

const STAGE_COLORS = {
  prospecting: '#94a3b8', qualification: '#60a5fa', proposal: '#fbbf24',
  negotiation: '#f97316', closed_won: '#22c55e', closed_lost: '#ef4444',
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportsAPI.getDashboard(), tasksAPI.getUpcoming()])
      .then(([dash, tasks]) => {
        setData(dash.data.data);
        setUpcoming(tasks.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const { kpis, dealsByStage = [], leadsByStatus = [], recentActivities = [] } = data;

  const stageData = dealsByStage.map(d => ({
    name: d._id.replace(/_/g, ' '),
    value: d.value,
    count: d.count,
    fill: STAGE_COLORS[d._id] || '#6366f1',
  }));

  const leadData = leadsByStatus.map(l => ({ name: l._id, value: l.count }));
  const LEAD_COLORS = ['#6366f1', '#22c55e', '#fbbf24', '#ef4444', '#8b5cf6'];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Here's what's happening today.`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Contacts"  value={kpis.totalContacts}  icon={UsersIcon}          color="primary" />
        <StatCard label="Active Leads"    value={kpis.totalLeads}     icon={FunnelIcon}          color="yellow" />
        <StatCard label="Open Deals"      value={kpis.openDeals}      icon={CurrencyDollarIcon}  color="purple" />
        <StatCard label="Tasks Overdue"   value={kpis.tasksDue}       icon={CheckCircleIcon}     color="red" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue This Month" value={`$${(kpis.monthRevenue || 0).toLocaleString()}`} icon={TrophyIcon} color="green" trend={kpis.revenueGrowth} />
        <StatCard label="Deals Won"   value={kpis.wonDeals}  icon={TrophyIcon}   color="green" />
        <StatCard label="Deals Lost"  value={kpis.lostDeals} icon={ChartBarIcon} color="red" />
        <StatCard label="Win Rate"    value={`${kpis.winRate}%`} icon={ChartBarIcon} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pipeline by stage */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-sm text-gray-400">No deals yet</div>}
        </div>

        {/* Leads by status */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Leads by Status</h3>
          {leadData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={leadData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {leadData.map((_, i) => <Cell key={i} fill={LEAD_COLORS[i % LEAD_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {leadData.map((l, i) => (
                  <div key={l.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: LEAD_COLORS[i % LEAD_COLORS.length] }} />
                      <span className="text-gray-600 capitalize">{l.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{l.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-48 flex items-center justify-center text-sm text-gray-400">No leads yet</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Upcoming Tasks</h3>
            <Link to="/tasks" className="text-sm text-primary-600 hover:underline font-medium">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 6).map(task => (
                <div key={task._id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high'   ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No due date'} · <span className="capitalize">{task.type}</span>
                    </p>
                  </div>
                  <Badge value={task.priority} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.slice(0, 7).map(a => (
                <div key={a._id} className="flex items-start gap-3">
                  <Avatar name={a.performedBy?.name || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-tight">{a.description}</p>
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
    </div>
  );
}
