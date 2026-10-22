import BrandLogo from '@/components/BrandLogo';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UnavailableAuth, safeReturnTarget, useAuth } from '@/auth/AuthProvider';
import { useSEO } from '@/hooks/useSEO';

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password';
type Props = { mode?: AuthMode };
const validModes: AuthMode[] = ['sign-in', 'sign-up', 'forgot-password', 'reset-password'];
const EMAIL_MAX = 254;
const PASSWORD_MAX = 128;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage({ mode: initialMode = 'sign-in' }: Props) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = params.get('mode') as AuthMode | null;
  const mode = requested && validModes.includes(requested) ? requested : initialMode;
  const returnTo = safeReturnTarget(params.get('returnTo'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  useSEO({ title: 'Student account', description: 'Sign in or manage your Clinova student account.', noindex: true });

  useEffect(() => { setEmail(''); setPassword(''); setConfirmation(''); setMessage(null); setLocalError(null); }, [mode]);
  useEffect(() => {
    if (mode === 'reset-password') setLocalError(auth.status === 'ready' && (!auth.recovery || !auth.session) ? 'This password recovery link is no longer valid. Request a new one to continue.' : null);
    else if (auth.session && !auth.recovery) navigate('/student', { replace: true });
  }, [auth.recovery, auth.session, auth.status, mode, navigate]);

  if (!auth.enabled || auth.status === 'error') return <UnavailableAuth message={auth.error ?? 'Authentication is not enabled for this site.'} />;
  if (auth.status === 'loading') return <section className="mx-auto max-w-3xl px-6 py-20 text-center" role="status" aria-live="polite"><h1 className="text-3xl font-bold text-navy-900">Checking your student session…</h1><p className="mt-4 text-navy-600">Please wait while we check authentication.</p></section>;
  if (mode === 'reset-password' && auth.session && !auth.recovery) return <UnavailableAuth message="Password changes require a valid recovery link." />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busyRef.current || auth.status !== 'ready') return;
    setMessage(null); setLocalError(null);
    const trimmedEmail = email.trim();
    if (mode !== 'reset-password' && (!trimmedEmail || trimmedEmail.length > EMAIL_MAX || !emailPattern.test(trimmedEmail))) { setLocalError('Enter a valid email address.'); return; }
    if (mode === 'sign-in' && !password) { setLocalError('Enter your password.'); return; }
    if (password.length > PASSWORD_MAX) { setLocalError(`Password must be ${PASSWORD_MAX} characters or fewer.`); return; }
    if ((mode === 'sign-up' || mode === 'reset-password') && password.length < 8) { setLocalError('Use a password with at least 8 characters.'); return; }
    if (mode === 'reset-password' && password !== confirmation) { setLocalError('Passwords do not match.'); return; }
    busyRef.current = true; setBusy(true);
    try {
      const result = mode === 'sign-in' ? await auth.signIn(trimmedEmail, password)
        : mode === 'sign-up' ? await auth.signUp(trimmedEmail, password)
        : mode === 'forgot-password' ? await auth.sendPasswordReset(trimmedEmail)
        : await auth.updatePassword(password);
      if (result.error) { setLocalError(result.error.message); return; }
      if (mode === 'sign-in') navigate(returnTo, { replace: true });
      else if (mode === 'sign-up') setMessage('If an account can be created for that email, check your inbox for next steps.');
      else if (mode === 'forgot-password') setMessage('If an account exists for that email, a recovery link has been sent.');
      else { setMessage('Your password has been updated.'); navigate('/student', { replace: true }); }
    } finally { busyRef.current = false; setBusy(false); }
  };

  const titles = { 'sign-in': 'Sign in to your student account', 'sign-up': 'Create your student account', 'forgot-password': 'Reset your password', 'reset-password': 'Choose a new password' };
  const submitLabel = { 'sign-in': 'Sign in', 'sign-up': 'Create account', 'forgot-password': 'Send recovery email', 'reset-password': 'Update password' };
  return <section className="mx-auto max-w-xl px-6 py-16" aria-labelledby="auth-title">
    <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
      <BrandLogo className="w-[240px] max-w-full mb-6" />
      <h1 id="auth-title" className="mt-2 text-3xl font-bold text-navy-900">{titles[mode]}</h1>
      <p className="mt-3 text-navy-600">Use your account to access student learning information.</p>
      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        {mode !== 'reset-password' && <label className="block text-sm font-medium text-navy-700">Email address<input className="mt-2 w-full rounded-lg border border-navy-200 px-3 py-3" type="email" autoComplete="email" maxLength={EMAIL_MAX} value={email} onChange={e => setEmail(e.target.value)} /></label>}
        {mode !== 'forgot-password' && <label className="block text-sm font-medium text-navy-700">Password<input className="mt-2 w-full rounded-lg border border-navy-200 px-3 py-3" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} maxLength={PASSWORD_MAX} value={password} onChange={e => setPassword(e.target.value)} /></label>}
        {mode === 'reset-password' && <label className="block text-sm font-medium text-navy-700">Confirm new password<input className="mt-2 w-full rounded-lg border border-navy-200 px-3 py-3" type="password" autoComplete="new-password" maxLength={PASSWORD_MAX} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>}
        {(localError || auth.error) && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{localError || auth.error}</p>}
        {message && <p className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800" role="status">{message}</p>}
        <button className="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={busy || (mode === 'reset-password' && !auth.recovery)}>{busy ? 'Please wait…' : submitLabel[mode]}</button>
      </form>
      <nav className="mt-6 flex flex-wrap gap-4 text-sm text-teal-700" aria-label="Account options">
        {mode === 'sign-in' && <><Link to="/forgot-password">Forgot password?</Link><Link to="/sign-up">Create an account</Link></>}
        {mode === 'sign-up' && <Link to="/sign-in">Already have an account? Sign in</Link>}
        {mode === 'forgot-password' && <Link to="/sign-in">Back to sign in</Link>}
        {mode === 'reset-password' && auth.recovery && <Link to="/sign-in">Back to sign in</Link>}
      </nav>
    </div>
  </section>;
}
