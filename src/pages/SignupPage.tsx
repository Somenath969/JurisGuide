import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import Disclaimer from '@/components/Disclaimer';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      // Update profile with extra fields
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: fullName,
          mobile,
          location,
        });
      }
      setLoading(false);
      navigate('/app');
    }
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
            Start understanding your legal documents today
          </h2>
          <p className="mt-3 text-navy-200 max-w-md">
            Create a free JurisGuide account and get instant AI-powered analysis of contracts, agreements, and court notices.
          </p>
          <div className="mt-8 space-y-3">
            {['Free to get started', 'Upload and analyze unlimited documents', 'Get explanations in 6 languages', 'Track court dates and reminders'].map((item) => (
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
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-600 dark:text-gold-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-11"
                  placeholder="John Doe"
                />
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Mobile</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="input-field pl-11"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field pl-11"
                    placeholder="Mumbai, India"
                  />
                </div>
              </div>
            </div>
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
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <Disclaimer compact />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
