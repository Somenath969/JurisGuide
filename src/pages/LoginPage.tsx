import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import Disclaimer from '@/components/Disclaimer';

type Mode = 'password' | 'otp';
type Step = 'credentials' | 'verify';

export default function LoginPage() {
  const { signIn, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('password');
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'password') {
      setLoading(true);
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        navigate('/app');
      }
    } else {
      // OTP mode - send code
      setLoading(true);
      const { error } = await sendOtp(email);
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        setStep('verify');
        setInfo(`A 6-digit verification code has been sent to ${email}`);
        setResendTimer(60);
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = otp.join('');
    if (token.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(email, token);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/app');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    const { error } = await sendOtp(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setInfo(`A new verification code has been sent to ${email}`);
      setResendTimer(60);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setStep('credentials');
    setError('');
    setInfo('');
    setOtp(['', '', '', '', '', '']);
  };

  const backToCredentials = () => {
    setStep('credentials');
    setError('');
    setInfo('');
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-navy-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-800 dark:bg-navy-900 relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-navy-600/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-gold-600/15 rounded-full blur-3xl" />
        </div>
        <Link to="/" className="relative">
          <Logo />
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Welcome back to JurisGuide
          </h2>
          <p className="mt-3 text-navy-200 max-w-md">
            Your AI-powered legal assistant. Sign in to access your documents, chat history, and court reminders.
          </p>
          <div className="mt-8 space-y-3">
            {['Document analysis with risk indicators', 'AI legal chatbot with document context', 'Court reminders and legal topic guides'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-navy-100">
                <div className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-navy-300">© 2026 JurisGuide. Legal information, not legal advice.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex justify-center mb-8">
            <Logo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 dark:hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          {step === 'verify' ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Verify your email</h1>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                We sent a 6-digit code to <span className="font-medium text-navy-800 dark:text-white">{email}</span>
              </p>

              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-2">Verification Code</label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white dark:bg-navy-900 border-2 border-gray-200 dark:border-navy-700 text-navy-900 dark:text-white focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {info && (
                  <div className="flex items-start gap-2 text-sm text-navy-600 dark:text-navy-300 bg-navy-50 dark:bg-navy-800/50 border border-navy-200 dark:border-navy-700 rounded-lg p-3">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{info}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={backToCredentials} className="text-gray-500 hover:text-navy-700 dark:hover:text-white transition-colors">
                    Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    className="text-navy-600 dark:text-gold-400 font-medium hover:underline disabled:opacity-50 disabled:no-underline transition-colors"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Sign in to your account</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-navy-600 dark:text-gold-400 font-medium hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Mode toggle */}
              <div className="mt-6 inline-flex rounded-xl border border-gray-200 dark:border-navy-700 p-1 bg-white dark:bg-navy-900 w-full">
                <button
                  onClick={() => switchMode('password')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'password' ? 'bg-navy-700 text-white dark:bg-navy-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Lock className="w-4 h-4" /> Password
                </button>
                <button
                  onClick={() => switchMode('otp')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'otp' ? 'bg-navy-700 text-white dark:bg-navy-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <KeyRound className="w-4 h-4" /> OTP Login
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-11"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {mode === 'password' && (
                  <div>
                    <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pl-11"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {mode === 'otp' && (
                  <div className="flex items-start gap-2 text-sm text-navy-600 dark:text-navy-300 bg-navy-50 dark:bg-navy-800/50 border border-navy-200 dark:border-navy-700 rounded-lg p-3">
                    <KeyRound className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>We'll send a one-time verification code to your email. No password needed.</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : mode === 'password' ? (
                    'Sign In'
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-8">
            <Disclaimer compact />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
