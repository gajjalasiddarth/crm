import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { Badge, PageHeader, Avatar } from '../components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await usersAPI.getAll(); setUsers(data.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    await usersAPI.update(id, { role });
    toast.success('Role updated'); load();
  };

  const handleToggleActive = async (user) => {
    await usersAPI.update(user._id, { isActive: !user.isActive });
    toast.success(user.isActive ? 'User deactivated' : 'User activated'); load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return;
    await usersAPI.delete(id); toast.success('User deleted'); load();
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${users.length} users`} />

      <div className="card overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th hidden md:table-cell">Role</th>
                <th className="table-th hidden lg:table-cell">Status</th>
                <th className="table-th hidden lg:table-cell">Last Login</th>
                <th className="table-th hidden md:table-cell">Department</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td hidden md:table-cell">
                    <select value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)}
                      className="input py-1 w-auto text-xs">
                      {['admin','manager','sales_rep','viewer'].map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
                    </select>
                  </td>
                  <td className="table-td hidden lg:table-cell">
                    <Badge value={user.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td className="table-td hidden lg:table-cell text-gray-400 text-xs">
                    {user.lastLogin ? format(new Date(user.lastLogin),'MMM d, yyyy') : 'Never'}
                  </td>
                  <td className="table-td hidden md:table-cell text-gray-500 text-sm">{user.department || '—'}</td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleActive(user)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${user.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(user._id, user.name)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
