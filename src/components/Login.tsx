import { useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore(state => state.login);

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
            data: {
              full_name: name,
              company_name: companyName,
            },
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
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
              EasyFlux
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-500">
              {isRegistering ? 'Crie sua conta corporativa' : 'Bem-vindo de volta'}
            </CardDescription>
          </CardHeader>
          
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {!isRegistering && (
                    <Button variant="link" className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Esqueceu a senha?
                    </Button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500 transition-all" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-500/20 group transition-all" 
                type="submit"
              >
                {isRegistering ? 'Criar conta agora' : 'Entrar no sistema'}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="text-center text-sm text-slate-500">
                {isRegistering ? 'Já possui uma conta corporativa?' : 'Ainda não utiliza o EasyFlux?'}
                <button 
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  {isRegistering ? 'Fazer Login' : 'Cadastre-se grátis'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 EasyFlux • Gestão Financeira Inteligente
        </p>
      </motion.div>
    </div>
  );
}
