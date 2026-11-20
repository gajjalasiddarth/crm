import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Please enter your email');
    setForgotLoading(true);
    try {
      const { authAPI } = await import('../../services/api');
      await authAPI.forgotPassword({ email: forgotEmail });
      toast.success('Password reset link sent! Check your email.');
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset link');
    } finally { setForgotLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Left Panel — Login Form */}
      <div className="login-left">
        <div className="login-form-container">
          {/* Logo & Brand */}
          <div className="login-brand">
            <div className="login-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="login-logo-svg">
                <circle cx="20" cy="20" r="18" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" />
                <circle cx="20" cy="12" r="3" fill="url(#logoGrad)" />
                <circle cx="12" cy="24" r="3" fill="url(#logoGrad)" />
                <circle cx="28" cy="24" r="3" fill="url(#logoGrad)" />
                <line x1="20" y1="12" x2="12" y2="24" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="12" x2="28" y2="24" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
                <line x1="12" y1="24" x2="28" y2="24" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
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
            <h2 className="login-card-title">SalesSphere login</h2>

            {!showForgot ? (
              <>
                <form onSubmit={submit} className="login-form">
                  <div className="login-field">
                    <label className="login-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handle}
                      required
                      autoFocus
                      className="login-input"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="login-field">
                    <label className="login-label" htmlFor="password">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handle}
                      required
                      className="login-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="login-btn">
                    {loading ? (
                      <span className="login-btn-loading">
                        <svg className="login-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" /></svg>
                        Signing in...
                      </span>
                    ) : 'Log In'}
                  </button>
                </form>

                <div className="login-options">
                  <label className="login-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="login-checkbox"
                    />
                    <span>Remember me</span>
                  </label>
                  <button onClick={() => setShowForgot(true)} className="login-forgot-link" type="button">
                    Forgot Your Password?
                  </button>
                </div>

                <div className="login-divider">
                  <span className="login-divider-line" />
                  <span className="login-divider-text">or</span>
                  <span className="login-divider-line" />
                </div>

                <p className="login-register-text">
                  Not a member yet?{' '}
                  <Link to="/register" className="login-register-link">Create an account</Link>
                </p>
              </>
            ) : (
              <>
                <p className="login-forgot-desc">
                  Enter the email address associated with your SalesSphere account. We'll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword} className="login-form">
                  <div className="login-field">
                    <label className="login-label" htmlFor="forgot-email">Email address</label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                      className="login-input"
                      placeholder="you@company.com"
                    />
                  </div>
                  <button type="submit" disabled={forgotLoading} className="login-btn">
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
                <button onClick={() => setShowForgot(false)} className="login-back-btn" type="button">
                  ← Back to login
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel — Hero / Welcome */}
      <div className="login-right">
        <div className="login-right-content">
          <img
            src="/salessphere-hero.png"
            alt="SalesSphere Global CRM Network"
            className="login-hero-img"
          />
          <h2 className="login-hero-title">
            Welcome to <span className="login-hero-highlight">SalesSphere</span>
          </h2>
          <p className="login-hero-subtitle">
            Your all-in-one Customer Relationship Management platform.
            Manage contacts, track deals, and grow revenue — all from one powerful dashboard.
          </p>
          <div className="login-hero-features">
            <div className="login-hero-feature">
              <div className="login-hero-feature-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span>Contact Management</span>
            </div>
            <div className="login-hero-feature">
              <div className="login-hero-feature-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <span>Pipeline & Analytics</span>
            </div>
            <div className="login-hero-feature">
              <div className="login-hero-feature-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <span>Integrated Email</span>
            </div>
            <div className="login-hero-feature">
              <div className="login-hero-feature-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span>Role-Based Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
