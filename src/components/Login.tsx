import { useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, Lock, Mail, User, ArrowRight, Loader2, MailCheck, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type View = 'login' | 'register' | 'verify-sent' | 'forgot-password';

export default function Login() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const login = useStore(state => state.login);
  const theme = useStore(state => state.theme);
  const setTheme = useStore(state => state.setTheme);

  const isRegistering = view === 'register';

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name, company_name: companyName },
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setView('verify-sent');
          startCooldown();
          toast.success('Conta criada! Verifique seu email.');
        } else if (data.session && data.user) {
          login({ id: data.user.id, email: data.user.email ?? email, name });
          toast.success('Conta criada com sucesso!');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          login({
            id: data.user.id,
            email: data.user.email ?? email,
            name: (data.user.user_metadata as any)?.full_name ?? email.split('@')[0],
          });
          toast.success('Bem-vindo de volta!');
        }
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro de autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast.success('Email de confirmação reenviado!');
      startCooldown();
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao reenviar email');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Se o email existir, enviaremos as instruções de recuperação.');
      setView('login');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-100'}`}>
      <AnimatedBackground />

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-2xl border-slate-200/50 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 dark:border-slate-700">
          <CardHeader className="space-y-1 flex flex-col items-center pb-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-500/20"
            >
              {view === 'verify-sent' ? <MailCheck size={32} /> : view === 'forgot-password' ? <KeyRound size={32} /> : <Building2 size={32} />}
            </motion.div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {view === 'verify-sent' ? 'Verifique seu email' : view === 'forgot-password' ? 'Recuperar senha' : 'EasyFlux'}
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-500 text-center">
              {view === 'verify-sent' && `Enviamos um link de confirmação para ${email}`}
              {view === 'forgot-password' && 'Informe seu email para receber o link de recuperação'}
              {view === 'login' && 'Bem-vindo de volta'}
              {view === 'register' && 'Crie sua conta corporativa'}
            </CardDescription>
          </CardHeader>

          {/* ── VERIFY SENT ── */}
          {view === 'verify-sent' ? (
            <>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-slate-700 leading-relaxed">
                  Clique no link enviado para <span className="font-semibold">{email}</span> para ativar sua conta. Verifique também a pasta de spam.
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 pb-8">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-500/20"
                  onClick={handleResendVerification}
                  disabled={loading || resendCooldown > 0}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : resendCooldown > 0 ? (
                    `Reenviar em ${resendCooldown}s`
                  ) : (
                    'Reenviar email de confirmação'
                  )}
                </Button>
                <Button variant="ghost" className="w-full text-slate-600" onClick={() => setView('login')}>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar para o login
                </Button>
              </CardFooter>
            </>

          /* ── FORGOT PASSWORD ── */
          ) : view === 'forgot-password' ? (
            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-forgot">Email corporativo</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                      id="email-forgot"
                      type="email"
                      placeholder="voce@empresa.com"
                      className="pl-10 h-11 border-slate-200 focus:border-blue-500 transition-all"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 pt-2 pb-8">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-500/20"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar link de recuperação'}
                </Button>
                <Button type="button" variant="ghost" className="w-full text-slate-600" onClick={() => setView('login')}>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar para o login
                </Button>
              </CardFooter>
            </form>

          /* ── LOGIN / REGISTER ── */
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <AnimatePresence mode="wait">
                  {isRegistering && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <Input
                            id="name"
                            placeholder="Seu nome"
                            className="pl-10 h-11 border-slate-200 focus:border-blue-500 transition-all"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Nome da Empresa</Label>
                        <div className="relative group">
                          <Building2 className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <Input
                            id="company"
                            placeholder="Ex: Sua Empresa Ltda"
                            className="pl-10 h-11 border-slate-200 focus:border-blue-500 transition-all"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email corporativo</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@empresa.com"
                      className="pl-10 h-11 border-slate-200 focus:border-blue-500 transition-all"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Senha com olhinho */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {!isRegistering && (
                      <button
                        type="button"
                        onClick={() => setView('forgot-password')}
                        className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500 transition-all"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-blue-500 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-500/20 group transition-all"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isRegistering ? 'Criar conta agora' : 'Entrar no sistema'}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-slate-500">
                  {isRegistering ? 'Já possui uma conta corporativa?' : 'Ainda não utiliza o EasyFlux?'}
                  <button
                    type="button"
                    onClick={() => setView(isRegistering ? 'login' : 'register')}
                    className="ml-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                  >
                    {isRegistering ? 'Fazer Login' : 'Cadastre-se grátis'}
                  </button>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>

        <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 EasyFlux • Gestão Financeira Inteligente
        </p>
      </motion.div>
    </div>
  );
}