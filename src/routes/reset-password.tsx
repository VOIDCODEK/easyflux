import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { KeyRound, Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
});

type PageState = 'verifying' | 'ready' | 'success' | 'invalid';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>('verifying');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      const type = params.get('type');

      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (error) {
          console.error('Token inválido:', error.message);
          setPageState('invalid');
          return;
        }
        setPageState('ready');
        return;
      }

      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setPageState('ready');
            sub.subscription.unsubscribe();
          }
        });
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setPageState('ready');
          } else {
            setPageState('invalid');
          }
        }, 5000);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setPageState('ready');
      } else {
        setPageState('invalid');
      }
    };

    verifyToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPageState('success');
      toast.success('Senha atualizada com sucesso!');
      await supabase.auth.signOut();
      setTimeout(() => navigate({ to: '/' }), 2500);
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  const isReady = pageState === 'ready';

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
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl
              ${pageState === 'invalid'
                ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'
                : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/20'
              }`}
            >
              {pageState === 'success' && <CheckCircle2 size={32} />}
              {pageState === 'invalid' && <AlertCircle size={32} />}
              {(pageState === 'verifying' || pageState === 'ready') && <KeyRound size={32} />}
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
              {pageState === 'success' && 'Senha alterada!'}
              {pageState === 'invalid' && 'Link inválido'}
              {pageState === 'verifying' && 'Verificando...'}
              {pageState === 'ready' && 'Nova senha'}
            </CardTitle>

            <CardDescription className="text-base font-medium text-slate-500 text-center">
              {pageState === 'success' && 'Redirecionando para o login...'}
              {pageState === 'invalid' && 'Este link expirou ou já foi utilizado.'}
              {pageState === 'verifying' && 'Validando link de recuperação...'}
              {pageState === 'ready' && 'Defina sua nova senha de acesso'}
            </CardDescription>
          </CardHeader>

          {/* Estado: link inválido */}
          {pageState === 'invalid' && (
            <CardFooter className="pb-8 flex flex-col gap-3">
              <p className="text-sm text-slate-500 text-center">
                Solicite um novo link de recuperação na tela de login.
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold"
                onClick={() => navigate({ to: '/' })}
              >
                Voltar ao login
              </Button>
            </CardFooter>
          )}

          {/* Estado: verificando */}
          {pageState === 'verifying' && (
            <CardFooter className="pb-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </CardFooter>
          )}

          {/* Estado: pronto */}
          {isReady && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">

                {/* Nova senha */}
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500 transition-all"
                      required
                      minLength={6}
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

                {/* Confirmar senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar senha</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500 transition-all"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-blue-500 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="pt-2 pb-8">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-500/20"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : 'Atualizar senha'
                  }
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}