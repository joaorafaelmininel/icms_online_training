// src/components/auth/AuthClient.tsx
'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type Tab = 'signin' | 'signup';
type Lang = 'en' | 'es';

interface AuthClientProps {
  initialTab?: Tab;
  redirectTo?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const i18n: Record<Lang, Record<string, string>> = {
  en: {
    platformTitle: 'ICMS 3.0 Online Training Platform',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    welcomeBack: 'Welcome back!',
    createAccount: 'Create your account',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: '••••••••  (min. 6 characters)',
    forgotPassword: 'Forgot password?',
    signingIn: 'Signing in...',
    backToMain: '← Back to main page',
    requiredInfo: 'Required Information',
    titleLabel: 'Title',
    firstName: 'First Name',
    lastName: 'Last Name',
    username: 'Username',
    usernamePlaceholder: 'joao_silva',
    usernameHint: 'Lowercase letters, numbers and underscore only',
    usernameAvailable: '— Available!',
    usernameTaken: '— Already taken',
    country: 'Country',
    countrySelect: 'Select...',
    language: 'Language',
    optionalInfo: 'Optional Professional Information',
    middleName: 'Middle Name',
    organization: 'Organization',
    orgCountry: 'Org. Country',
    jobTitle: 'Job Title',
    usarRole: 'USAR Role',
    teamType: 'Team Type',
    yearsExperience: 'Years Experience',
    phone: 'Phone',
    termsText: 'I accept the',
    termsOfUse: 'Terms of Use',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    creatingAccount: 'Creating account...',
    signUpBtn: 'Sign Up',
    footerText: 'By continuing, you agree to the',
    accountCreated: 'Account created! Please check your email to confirm your account.',
    errFirstName: 'First name must be at least 2 characters',
    errLastName: 'Last name must be at least 2 characters',
    errUsername: 'Username must be at least 3 characters',
    errUsernameTaken: 'Username is not available',
    errEmail: 'Please enter a valid email address',
    errPassword: 'Password must be at least 6 characters',
    errCountry: 'Please select a country',
    errTerms: 'You must accept the Terms of Use',
  },
  es: {
    platformTitle: 'Plataforma de Capacitación ICMS 3.0',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    welcomeBack: '¡Bienvenido de nuevo!',
    createAccount: 'Crea tu cuenta',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@email.com',
    password: 'Contraseña',
    passwordPlaceholder: '••••••••  (mín. 6 caracteres)',
    forgotPassword: '¿Olvidaste tu contraseña?',
    signingIn: 'Iniciando sesión...',
    backToMain: '← Volver a la página principal',
    requiredInfo: 'Información Requerida',
    titleLabel: 'Título',
    firstName: 'Nombre',
    lastName: 'Apellido',
    username: 'Usuario',
    usernamePlaceholder: 'juan_garcia',
    usernameHint: 'Solo letras minúsculas, números y guion bajo',
    usernameAvailable: '— ¡Disponible!',
    usernameTaken: '— Ya está en uso',
    country: 'País',
    countrySelect: 'Seleccionar...',
    language: 'Idioma',
    optionalInfo: 'Información Profesional Opcional',
    middleName: 'Segundo Nombre',
    organization: 'Organización',
    orgCountry: 'País Org.',
    jobTitle: 'Cargo',
    usarRole: 'Rol USAR',
    teamType: 'Tipo de Equipo',
    yearsExperience: 'Años de Experiencia',
    phone: 'Teléfono',
    termsText: 'Acepto los',
    termsOfUse: 'Términos de Uso',
    and: 'y la',
    privacyPolicy: 'Política de Privacidad',
    creatingAccount: 'Creando cuenta...',
    signUpBtn: 'Registrarse',
    footerText: 'Al continuar, aceptas los',
    accountCreated: '¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.',
    errFirstName: 'El nombre debe tener al menos 2 caracteres',
    errLastName: 'El apellido debe tener al menos 2 caracteres',
    errUsername: 'El usuario debe tener al menos 3 caracteres',
    errUsernameTaken: 'El nombre de usuario no está disponible',
    errEmail: 'Por favor ingresa un correo válido',
    errPassword: 'La contraseña debe tener al menos 6 caracteres',
    errCountry: 'Por favor selecciona un país',
    errTerms: 'Debes aceptar los Términos de Uso',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const TEAM_TYPES = [
  'Assessment', 'Coordination', 'EMT', 'Environmental', 'Firefighting',
  'Flood', 'Logistics', 'Shelter', 'Telecom', 'USAR', 'WASH',
];

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bangladesh','Belarus','Belgium','Bolivia',
  'Bosnia and Herzegovina','Brazil','Bulgaria','Cambodia','Cameroon',
  'Canada','Chile','China','Colombia','Costa Rica','Croatia','Cuba',
  'Cyprus','Czech Republic','Denmark','Dominican Republic','Ecuador',
  'Egypt','El Salvador','Estonia','Ethiopia','Finland','France',
  'Georgia','Germany','Ghana','Greece','Guatemala','Haiti','Honduras',
  'Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya',
  'Kuwait','Kyrgyzstan','Latvia','Lebanon','Libya','Lithuania',
  'Luxembourg','Malaysia','Mali','Malta','Mexico','Moldova','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Macedonia','Norway',
  'Oman','Pakistan','Palestine','Panama','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia',
  'Senegal','Serbia','Singapore','Slovakia','Slovenia','Somalia',
  'South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Tunisia','Turkey','Turkmenistan','Uganda','Ukraine',
  'United Arab Emirates','United Kingdom','United States','Uruguay',
  'Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AuthClient({
  initialTab = 'signin',
  redirectTo = '/dashboard',
}: AuthClientProps) {
  // ─── Language — reads cookie on mount, updates UI instantly ────────────────
  const [lang, setLang] = useState<Lang>('en');
  const t = i18n[lang];

  useEffect(() => {
    const match = document.cookie.match(/user_language=(en|es)/);
    if (match) setLang(match[1] as Lang);
  }, []);

  const switchLanguage = useCallback((newLang: Lang) => {
    document.cookie = `user_language=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    setLang(newLang);
  }, []);

  // ─── Auth state ───────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>(initialTab);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [signUpData, setSignUpData] = useState({
    username: '',
    title: 'mr' as 'mr' | 'mrs' | 'ms',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    country: '',
    preferred_language: 'en' as Lang,
    organization: '',
    organization_country: '',
    job_title: '',
    usar_role: '',
    team_type: '',
    years_experience: '',
    phone: '',
    terms_accepted: false,
  });

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const set = useCallback(
    (field: string, value: string | boolean) =>
      setSignUpData((p) => ({ ...p, [field]: value })),
    []
  );

  const handleUsernameChange = (raw: string) => {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, '');
    set('username', cleaned);
    setUsernameAvailable(null);
  };

  // Sync preferred_language with UI language
  useEffect(() => {
    set('preferred_language', lang);
  }, [lang, set]);

  // Debounced username check
  useEffect(() => {
    if (!signUpData.username || signUpData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const id = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data } = await supabase.rpc('is_username_available', {
          p_username: signUpData.username,
        });
        setUsernameAvailable(data === true);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [signUpData.username, supabase]);

  // ─── Sign In ──────────────────────────────────────────────────────────────
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: signInEmail,
          password: signInPassword,
        });
        if (err) throw err;
        if (data.session) window.location.href = redirectTo;
      } catch (err: any) {
        setError(err.message || 'Failed to sign in');
      }
    });
  };

  // ─── Sign Up ──────────────────────────────────────────────────────────────
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (signUpData.first_name.trim().length < 2) { setError(t.errFirstName); return; }
    if (signUpData.last_name.trim().length < 2) { setError(t.errLastName); return; }
    if (signUpData.username.length < 3) { setError(t.errUsername); return; }
    if (usernameAvailable === false) { setError(t.errUsernameTaken); return; }
    if (!signUpData.email.includes('@')) { setError(t.errEmail); return; }
    if (signUpData.password.length < 6) { setError(t.errPassword); return; }
    if (!signUpData.country) { setError(t.errCountry); return; }
    if (!signUpData.terms_accepted) { setError(t.errTerms); return; }

    startTransition(async () => {
      try {
        const { data: authData, error: err } = await supabase.auth.signUp({
          email: signUpData.email,
          password: signUpData.password,
          options: {
            data: {
              username: signUpData.username,
              first_name: signUpData.first_name.trim(),
              last_name: signUpData.last_name.trim(),
              title: signUpData.title,
              country: signUpData.country,
              preferred_language: signUpData.preferred_language,
            },
          },
        });
        if (err) throw err;

        if (authData.user) {
          const payload: Record<string, any> = {
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
            privacy_accepted: true,
            privacy_accepted_at: new Date().toISOString(),
            profile_completed: true,
          };
          if (signUpData.middle_name.trim()) payload.middle_name = signUpData.middle_name.trim();
          if (signUpData.organization.trim()) payload.organization = signUpData.organization.trim();
          if (signUpData.organization_country) payload.organization_country = signUpData.organization_country;
          if (signUpData.job_title.trim()) payload.job_title = signUpData.job_title.trim();
          if (signUpData.usar_role.trim()) payload.usar_role = signUpData.usar_role.trim();
          if (signUpData.team_type) payload.team_type = signUpData.team_type;
          if (signUpData.years_experience) payload.years_experience = parseInt(signUpData.years_experience);
          if (signUpData.phone.trim()) payload.phone = signUpData.phone.trim();
          await supabase.from('profiles').update(payload).eq('id', authData.user.id);
        }

        if (authData.user && !authData.session) {
          setSuccess(t.accountCreated);
        } else if (authData.session) {
          window.location.href = redirectTo;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create account');
      }
    });
  };

  // ─── Shared input classes ─────────────────────────────────────────────────
  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-60';

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#062a47] via-[#0B4A7C] to-[#083457] px-4 py-10">
      <div className="w-full max-w-md">

        {/* ── LOGO ───────────────────────────────────────────────────────── */}
        <div className="mb-6 text-center">
          <Image
            src="/insarag-logo.svg"
            alt="INSARAG"
            width={220}
            height={55}
            priority
            className="mx-auto h-14 w-auto"
          />
          <p className="mt-3 text-sm font-medium text-blue-200">{t.platformTitle}</p>

          {/* ── LANGUAGE FLAGS ────────────────────────────────────────────── */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {(['en', 'es'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLanguage(l)}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                  lang === l
                    ? 'border-white/40 bg-white/15 text-white shadow-sm'
                    : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Image
                  src={l === 'en' ? '/flag-gb.svg' : '/flag-es.svg'}
                  alt={l.toUpperCase()}
                  width={20}
                  height={14}
                  className="rounded-sm"
                />
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ── CARD ───────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

          {/* Tabs */}
          <div className="mb-6 flex overflow-hidden rounded-lg bg-gray-100 p-1">
            {(['signin', 'signup'] as Tab[]).map((tb) => (
              <button
                key={tb}
                onClick={() => { setTab(tb); setError(null); setSuccess(null); }}
                className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition ${
                  tab === tb ? 'bg-[#0B4A7C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tb === 'signin' ? t.signIn : t.signUp}
              </button>
            ))}
          </div>

          <h2 className="mb-5 text-center text-xl font-bold text-gray-900">
            {tab === 'signin' ? t.welcomeBack : t.createAccount}
          </h2>

          {/* Messages */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SIGN IN                                                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.email}</label>
                <input type="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} placeholder={t.emailPlaceholder} required disabled={isPending} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.password}</label>
                <input type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} placeholder="••••••••" required disabled={isPending} className={inputCls} />
              </div>
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-sm text-[#0B4A7C] hover:underline">{t.forgotPassword}</Link>
              </div>
              <button type="submit" disabled={isPending} className="w-full rounded-lg bg-[#FF6B35] py-3 font-semibold text-white shadow-sm transition hover:bg-[#E55A2B] disabled:cursor-not-allowed disabled:opacity-50">
                {isPending ? t.signingIn : t.signIn}
              </button>
              <div className="text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">{t.backToMain}</Link>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SIGN UP                                                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t.requiredInfo}</p>

              {/* Title + First + Last */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <label className="mb-1 block text-xs font-medium text-gray-700">{t.titleLabel} *</label>
                  <select value={signUpData.title} onChange={(e) => set('title', e.target.value)} disabled={isPending} className={inputCls}>
                    <option value="mr">Mr.</option>
                    <option value="mrs">Mrs.</option>
                    <option value="ms">Ms.</option>
                  </select>
                </div>
                <div className="col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-700">{t.firstName} *</label>
                  <input type="text" value={signUpData.first_name} onChange={(e) => set('first_name', e.target.value)} required minLength={2} disabled={isPending} className={inputCls} />
                </div>
                <div className="col-span-5">
                  <label className="mb-1 block text-xs font-medium text-gray-700">{t.lastName} *</label>
                  <input type="text" value={signUpData.last_name} onChange={(e) => set('last_name', e.target.value)} required minLength={2} disabled={isPending} className={inputCls} />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">{t.username} *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={signUpData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    required minLength={3} maxLength={30}
                    disabled={isPending}
                    className={`${inputCls} pr-10 ${
                      usernameAvailable === true ? 'border-green-400 bg-green-50' :
                      usernameAvailable === false ? 'border-red-400 bg-red-50' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && (
                      <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {t.usernameHint}
                  {usernameAvailable === true && <span className="ml-1 font-medium text-green-600">{t.usernameAvailable}</span>}
                  {usernameAvailable === false && <span className="ml-1 font-medium text-red-600">{t.usernameTaken}</span>}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">{t.email} *</label>
                <input type="email" value={signUpData.email} onChange={(e) => set('email', e.target.value)} placeholder={t.emailPlaceholder} required disabled={isPending} className={inputCls} />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">{t.password} *</label>
                <input type="password" value={signUpData.password} onChange={(e) => set('password', e.target.value)} placeholder={t.passwordPlaceholder} required minLength={6} disabled={isPending} className={inputCls} />
              </div>

              {/* Country + Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">{t.country} *</label>
                  <select value={signUpData.country} onChange={(e) => set('country', e.target.value)} required disabled={isPending} className={inputCls}>
                    <option value="">{t.countrySelect}</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">{t.language}</label>
                  <select
                    value={lang}
                    onChange={(e) => switchLanguage(e.target.value as Lang)}
                    disabled={isPending}
                    className={inputCls}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>

              {/* ── OPTIONAL (collapsible) ────────────────────────────────── */}
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600">
                  <svg className="h-3 w-3 transition group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {t.optionalInfo}
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">{t.middleName}</label>
                    <input type="text" value={signUpData.middle_name} onChange={(e) => set('middle_name', e.target.value)} disabled={isPending} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">{t.organization}</label>
                      <input type="text" value={signUpData.organization} onChange={(e) => set('organization', e.target.value)} disabled={isPending} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">{t.orgCountry}</label>
                      <select value={signUpData.organization_country} onChange={(e) => set('organization_country', e.target.value)} disabled={isPending} className={inputCls}>
                        <option value="">{t.countrySelect}</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">{t.jobTitle}</label>
                      <input type="text" value={signUpData.job_title} onChange={(e) => set('job_title', e.target.value)} disabled={isPending} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">{t.usarRole}</label>
                      <input type="text" value={signUpData.usar_role} onChange={(e) => set('usar_role', e.target.value)} disabled={isPending} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">{t.teamType}</label>
                      <select value={signUpData.team_type} onChange={(e) => set('team_type', e.target.value)} disabled={isPending} className={inputCls}>
                        <option value="">{t.countrySelect}</option>
                        {TEAM_TYPES.map((tt) => <option key={tt} value={tt.toLowerCase()}>{tt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">{t.yearsExperience}</label>
                      <input type="number" min={0} max={99} value={signUpData.years_experience} onChange={(e) => set('years_experience', e.target.value)} disabled={isPending} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">{t.phone}</label>
                    <input type="tel" value={signUpData.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 234 567 890" disabled={isPending} className={inputCls} />
                  </div>
                </div>
              </details>

              {/* ── TERMS ────────────────────────────────────────────────── */}
              <div className="pt-1">
                <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={signUpData.terms_accepted}
                    onChange={(e) => set('terms_accepted', e.target.checked)}
                    disabled={isPending}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0B4A7C] focus:ring-[#0B4A7C]"
                  />
                  <span>
                    {t.termsText}{' '}
                    <Link href="/terms" className="text-[#0B4A7C] hover:underline">{t.termsOfUse}</Link>
                    {' '}{t.and}{' '}
                    <Link href="/privacy" className="text-[#0B4A7C] hover:underline">{t.privacyPolicy}</Link>
                    {' '}<span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* ── SUBMIT ───────────────────────────────────────────────── */}
              <button type="submit" disabled={isPending} className="w-full rounded-lg bg-[#FF6B35] py-3 font-semibold text-white shadow-sm transition hover:bg-[#E55A2B] disabled:cursor-not-allowed disabled:opacity-50">
                {isPending ? t.creatingAccount : t.signUpBtn}
              </button>

              <div className="text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">{t.backToMain}</Link>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            {t.footerText}{' '}
            <Link href="/terms" className="text-[#0B4A7C] hover:underline">{t.termsOfUse}</Link>
            {' '}{t.and}{' '}
            <Link href="/privacy" className="text-[#0B4A7C] hover:underline">{t.privacyPolicy}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
