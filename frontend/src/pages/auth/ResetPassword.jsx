import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Link may be expired.';
      toast.error(msg);
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page" style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)' }}>
      <div className="login-left" style={{ flex: '0 0 480px', maxWidth: '100%' }}>
        <div className="login-form-container">
          {/* Logo & Brand */}
          <div className="login-brand">
            <div className="login-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="login-logo-svg">
                <circle cx="20" cy="20" r="18" stroke="url(#rLogoGrad)" strokeWidth="2.5" fill="none" />
                <circle cx="20" cy="12" r="3" fill="url(#rLogoGrad)" />
                <circle cx="12" cy="24" r="3" fill="url(#rLogoGrad)" />
                <circle cx="28" cy="24" r="3" fill="url(#rLogoGrad)" />
                <line x1="20" y1="12" x2="12" y2="24" stroke="url(#rLogoGrad)" strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="12" x2="28" y2="24" stroke="url(#rLogoGrad)" strokeWidth="1.5" opacity="0.6" />
                <line x1="12" y1="24" x2="28" y2="24" stroke="url(#rLogoGrad)" strokeWidth="1.5" opacity="0.6" />
                <defs>
                  <linearGradient id="rLogoGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="login-brand-name">SalesSphere</h1>
          </div>

          {/* Card */}
          <div className="login-card">
            <h2 className="login-card-title">Reset Your Password</h2>

            <p className="login-forgot-desc">
              Enter a new password for your account. Make sure it's at least 6 characters long.
            </p>

            <form onSubmit={submit} className="login-form">
              {/* New Password */}
              <div className="login-field">
                <label className="login-label" htmlFor="reset-password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handle}
                    required
                    autoFocus
                    className="login-input"
                    placeholder="Min 6 characters"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0' }}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="login-field">
                <label className="login-label" htmlFor="reset-confirm">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handle}
                    required
                    className="login-input"
                    placeholder="Re-enter password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0' }}
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength hint */}
              {form.password && (
                <div style={{ fontSize: '12px', color: form.password.length >= 8 ? '#10b981' : form.password.length >= 6 ? '#f59e0b' : '#ef4444', marginTop: '-8px' }}>
                  {form.password.length < 6 ? '⚠ Too short' : form.password.length < 8 ? '⚡ Acceptable' : '✓ Strong password'}
                </div>
              )}

              <button type="submit" disabled={loading} className="login-btn" style={{ marginTop: '8px' }}>
                {loading ? (
                  <span className="login-btn-loading">
                    <svg className="login-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" /></svg>
                    Resetting Password...
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>

            <Link to="/login" className="login-back-btn" style={{ display: 'block', marginTop: '20px', textAlign: 'center', color: '#4f46e5', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
