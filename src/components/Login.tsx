import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const loadAllData = useStore((state) => state.loadAllData);

  // Setup auth state listener and check existing session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Defer data loading to avoid deadlocks
        setTimeout(() => loadAllData(), 0);
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadAllData();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAllData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: name,
              company_name: companyName,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este email já está cadastrado. Faça login.');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        // Send custom verification email via Resend
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: { email, name, companyName },
          });
        } catch (err) {
          console.error('Email send error:', err);
        }

        setEmailSent(true);
        toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Verifique seu email antes de entrar.');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        toast.success('Login realizado com sucesso!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          <Card className="shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Mail className="text-emerald-600" size={32} />
              </div>
              <CardTitle className="text-2xl">Verifique seu email</CardTitle>
              <CardDescription>
                Enviamos um link de confirmação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => { setEmailSent(false); setIsRegistering(false); }}
              >
                Voltar para o login
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-2xl border-slate-200/50 backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-1 flex flex-col items-center pb-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-500/20"
            >
              <Building2 size={32} />
            </motion.div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
              Easy Flux
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-500">
              {isRegistering ? 'Crie sua conta corporativa' : 'Bem-vindo de volta'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input id="name" placeholder="Seu nome" className="pl-10 h-11" required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da Empresa</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input id="company" placeholder="Ex: Sua Empresa Ltda" className="pl-10 h-11" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input id="email" type="email" placeholder="voce@empresa.com" className="pl-10 h-11" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
              <Button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-500/20 group"
                type="submit"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {isRegistering ? 'Criar conta agora' : 'Entrar no sistema'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-slate-500">
                {isRegistering ? 'Já possui uma conta?' : 'Ainda não utiliza o Easy Flux?'}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-2 text-blue-600 font-bold hover:text-blue-700"
                >
                  {isRegistering ? 'Fazer Login' : 'Cadastre-se grátis'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 Easy Flux • Gestão Financeira Inteligente
        </p>
      </motion.div>
    </div>
  );
}
