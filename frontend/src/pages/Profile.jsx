import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Avatar, PageHeader, Badge } from '../components/ui';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [pwForm, setPw]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading]           = useState(false);

  const setP = (f,v) => setProfile(p=>({...p,[f]:v}));
  const setPF = (f,v) => setPw(p=>({...p,[f]:v}));

  const saveProfile = async (e) => {
    e.preventDefault(); setProfileLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.data); toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setProfileLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!'); setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPwLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" />

      {/* Current info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name || ''} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="mt-2"><Badge value={user?.role} /></div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={profileForm.name} onChange={e=>setP('name',e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Phone</label><input className="input" value={profileForm.phone} onChange={e=>setP('phone',e.target.value)} /></div>
            <div><label className="label">Department</label><input className="input" value={profileForm.department} onChange={e=>setP('department',e.target.value)} /></div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={profileLoading} className="btn-primary">{profileLoading ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <div><label className="label">Current Password</label><input type="password" className="input" value={pwForm.currentPassword} onChange={e=>setPF('currentPassword',e.target.value)} required /></div>
          <div><label className="label">New Password</label><input type="password" className="input" value={pwForm.newPassword} onChange={e=>setPF('newPassword',e.target.value)} required /></div>
          <div><label className="label">Confirm New Password</label><input type="password" className="input" value={pwForm.confirm} onChange={e=>setPF('confirm',e.target.value)} required /></div>
          <div className="flex justify-end">
            <button type="submit" disabled={pwLoading} className="btn-primary">{pwLoading ? 'Updating...' : 'Change Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
