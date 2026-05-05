import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield, Users, CheckCircle2, XCircle, Loader2,
  LogOut, RefreshCw, UserPlus, Building2, Calendar, DollarSign
} from 'lucide-react';

export const Route = createFileRoute('/admin')({
  component: AdminPage,
});

interface Client {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  is_admin: boolean | null;
  subscription: {
    id: string;
    status: string | null;
    plan: string | null;
    price: number | null;
    started_at: string | null;
    expires_at: string | null;
  } | null;
  company: {
    name: string;
  } | null;
}

type PageState = 'checking' | 'authorized' | 'unauthorized';

function AdminPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('checking');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal criar conta
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Verifica se é admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState('unauthorized'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_admin) {
        setPageState('authorized');
        loadClients();
      } else {
        setPageState('unauthorized');
      }
    };
    checkAdmin();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      // Busca todos os profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada profile, busca subscription e company
      const enriched: Client[] = await Promise.all(
        (profiles ?? []).map(async (p) => {
          const [{ data: sub }, { data: company }] = await Promise.all([
            supabase.from('subscriptions').select('*').eq('user_id', p.id).single(),
            supabase.from('companies').select('name').eq('user_id', p.id).single(),
          ]);
          return {
            ...p,
            subscription: sub ?? null,
            company: company ?? null,
          };
        })
      );

      setClients(enriched);
    } catch (err: any) {
      toast.error('Erro ao carregar clientes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (client: Client) => {
    if (!client.subscription) return;
    setActionLoading(client.id);
    try {
      const newStatus = client.subscription.status === 'active' ? 'inactive' : 'active';
      const updates: any = { status: newStatus };

      if (newStatus === 'active') {
        updates.started_at = new Date().toISOString();
        updates.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        updates.plan = 'monthly';
        updates.price = 49.90;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', client.subscription.id);

      if (error) throw error;

      toast.success(`Assinatura ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`);
      loadClients();
    } catch (err: any) {
      toast.error('Erro ao atualizar assinatura: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Cria usuário via signUp (o trigger do Supabase cria profile e subscription automaticamente)
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: { full_name: newName, company_name: newCompany },
        },
      });
      if (error) throw error;
      toast.success(`Conta criada para ${newEmail}!`);
      setShowCreateModal(false);
      setNewEmail(''); setNewName(''); setNewCompany(''); setNewPassword('');
      setTimeout(loadClients, 1500);
    } catch (err: any) {
      toast.error('Erro ao criar conta: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle2 size={11} /> Ativo</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600"><XCircle size={11} /> Inativo</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Trial</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">—</span>;
    }
  };

  // Stats
  const totalClients = clients.filter(c => !c.is_admin).length;
  const activeClients = clients.filter(c => c.subscription?.status === 'active').length;
  const inactiveClients = clients.filter(c => c.subscription?.status === 'inactive').length;
  const monthlyRevenue = activeClients * 49.90;

  // ── CHECKING ──
  if (pageState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // ── UNAUTHORIZED ──
  if (pageState === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <Card className="w-full max-w-sm text-center shadow-2xl z-10">
          <CardHeader>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Shield className="text-red-500" size={28} />
            </div>
            <CardTitle className="text-xl text-slate-900">Acesso negado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">Você não tem permissão para acessar esta página.</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate({ to: '/' })}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── AUTHORIZED ──
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">EasyFlux</h1>
              <p className="text-xs text-slate-400 mt-0.5">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={loadClients}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus size={14} />
              Nova conta
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut size={15} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de clientes', value: totalClients, icon: Users, color: 'from-blue-600 to-indigo-600' },
            { label: 'Assinaturas ativas', value: activeClients, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
            { label: 'Inativos', value: inactiveClients, icon: XCircle, color: 'from-red-500 to-rose-600' },
            { label: 'Receita mensal', value: `R$ ${monthlyRevenue.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: 'from-violet-500 to-purple-600' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={17} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabela de clientes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Clientes cadastrados
            </h2>
            <span className="text-xs text-slate-500">{totalClients} cliente{totalClients !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : clients.filter(c => !c.is_admin).length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              Nenhum cliente cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Cliente</th>
                    <th className="px-6 py-3 text-left">Empresa</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Início</th>
                    <th className="px-6 py-3 text-left">Vencimento</th>
                    <th className="px-6 py-3 text-left">Plano</th>
                    <th className="px-6 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {clients.filter(c => !c.is_admin).map((client) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{client.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{client.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Building2 size={13} className="text-slate-500" />
                          {client.company?.name ?? <span className="text-slate-600">—</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(client.subscription?.status ?? null)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Calendar size={11} />
                          {formatDate(client.subscription?.started_at ?? null)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${
                          client.subscription?.expires_at && new Date(client.subscription.expires_at) < new Date()
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}>
                          {formatDate(client.subscription?.expires_at ?? null)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {client.subscription?.price
                          ? `R$ ${client.subscription.price.toFixed(2).replace('.', ',')}/mês`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`text-xs h-7 border-slate-700 ${
                            client.subscription?.status === 'active'
                              ? 'hover:bg-red-900/30 hover:text-red-400 hover:border-red-700'
                              : 'hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-700'
                          } text-slate-300 bg-transparent`}
                          disabled={actionLoading === client.id || !client.subscription}
                          onClick={() => toggleSubscription(client)}
                        >
                          {actionLoading === client.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : client.subscription?.status === 'active' ? (
                            'Desativar'
                          ) : (
                            'Ativar'
                          )}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal criar conta */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="bg-slate-900 border-slate-700 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <UserPlus size={18} className="text-blue-400" />
                    Criar nova conta
                  </CardTitle>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome completo</Label>
                    <Input
                      placeholder="Nome do cliente"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email</Label>
                    <Input
                      type="email"
                      placeholder="email@cliente.com"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome da empresa</Label>
                    <Input
                      placeholder="Lava Rápido do João"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Senha provisória</Label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-slate-400 hover:text-white border border-slate-700"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={creating}
                    >
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}