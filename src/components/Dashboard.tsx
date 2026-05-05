import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
  LogOut,
  Plus,
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Moon,
  Sun,
  Camera,
  Paintbrush,
  Trash2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  RefreshCw,
  ArrowLeftRight,
  AlertCircle,
  BarChart3,
  FileText,
} from 'lucide-react';

import { useStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useMemo, useEffect } from 'react';
import { useSupabaseData } from '@/lib/useSupabaseData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Login from './Login';
import ProductsView from './ProductsView';
import CategoriesView from './CategoriesView';
import MovementsView from './MovementsView';
import ReportsView from './ReportsView';
import { PeriodSelector } from './PeriodSelector';
import { AnimatedBackground } from './AnimatedBackground';

export default function Dashboard() {
  const {
    transactions,
    companies,
    currentCompanyId,
    user,
    subscription,
    logout,
    theme,
    setTheme,
    updateCompany,
    processRecurringTransactions,
    selectedMonth,
    selectedYear,
    resetAllData,
  } = useStore();
  useSupabaseData();

  const [activeTab, setActiveTab] = useState('movements');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      processRecurringTransactions();
    }
  }, [user, processRecurringTransactions, selectedMonth, selectedYear]);

  const currentCompany = useMemo(() => {
    return (
      companies.find((c) => c.id === currentCompanyId) ||
      companies[0] || {
        id: 'fallback',
        name: 'Empresa',
        primaryColor: '#3b82f6',
        businessType: 'Serviços',
      }
    );
  }, [companies, currentCompanyId]);

  const companyTransactions = useMemo(() => {
    return transactions.filter((t) => t.companyId === currentCompanyId);
  }, [transactions, currentCompanyId]);

  const currentMonthTransactions = useMemo(() => {
    return companyTransactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [companyTransactions, selectedMonth, selectedYear]);

  const totalIncome = useMemo(() => {
    return companyTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.value, 0);
  }, [companyTransactions]);

  const totalExpenses = useMemo(() => {
    return companyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.value, 0);
  }, [companyTransactions]);

  const currentMonthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.value, 0);
  }, [currentMonthTransactions]);

  const netProfit = totalIncome - totalExpenses;

  const revenueGoal = currentCompany?.monthlyRevenueGoal || 0;
  const revenueProgress =
    revenueGoal > 0 ? Math.min(Math.round((currentMonthIncome / revenueGoal) * 100), 100) : 0;

  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth);
      d.setMonth(d.getMonth() - i);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthTransactions = companyTransactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === monthIdx && transDate.getFullYear() === year;
      });
      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.value, 0);
      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.value, 0);
      last6Months.push({ name: months[monthIdx], income, expense });
    }
    return last6Months;
  }, [companyTransactions, selectedMonth, selectedYear]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCompany(currentCompanyId!, { logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // ── NÃO AUTENTICADO ──
  if (!user) {
    return <Login />;
  }

  // ── LICENÇA INATIVA ──
  const isExpired =
    subscription?.expires_at && new Date(subscription.expires_at) < new Date();
  const isInactive =
    !subscription || subscription.status === 'inactive' || isExpired;

  if (isInactive) {
    return (
      <div
        className={cn(
          'min-h-screen flex items-center justify-center p-4 relative overflow-hidden',
          theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-100'
        )}
      >
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700 p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
              <AlertCircle size={36} className="text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Licença expirada
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Sua licença está inativa ou expirada. Entre em contato para renovar e continuar
                usando o EasyFlux.
              </p>
            </div>

            <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-1">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
                Plano mensal
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                R$ 49,90
                <span className="text-sm font-normal text-slate-500">/mês</span>
              </p>
            </div>

            
             <a href="https://wa.me/5511933424521?text=Olá,%20preciso%20renovar%20minha%20licença%20do%20EasyFlux"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-opacity text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            >
              💬 Falar no WhatsApp
            </a>

            <button
              onClick={logout}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Sair da conta
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── DASHBOARD PRINCIPAL ──
  return (
    <div className={cn('flex min-h-screen transition-all duration-300', theme === 'dark' ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900')}>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isMobileMenuOpen) && (
          <motion.aside
            initial={isMobileMenuOpen ? { x: -300 } : { width: 0, opacity: 0 }}
            animate={isMobileMenuOpen ? { x: 0 } : { width: 256, opacity: 1 }}
            exit={isMobileMenuOpen ? { x: -300 } : { width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col h-screen sticky top-0 z-50 overflow-hidden',
              isMobileMenuOpen ? 'fixed left-0 w-64 shadow-2xl' : 'hidden md:flex'
            )}
          >
            <div className="p-6 flex items-center justify-between gap-3 min-w-[256px]">
              <div className="flex items-center gap-3">
                {currentCompany?.logo ? (
                  <img src={currentCompany.logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: currentCompany?.primaryColor || '#3b82f6' }}
                  >
                    {currentCompany?.name?.charAt(0) || 'F'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h1 className="font-bold leading-tight truncate rounded-none text-slate-100">Easy Flux</h1>
                  <p className="text-xs text-slate-500 truncate">{currentCompany?.name}</p>
                </div>
              </div>
              <button
                onClick={() => (isMobileMenuOpen ? setIsMobileMenuOpen(false) : setIsSidebarOpen(false))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 md:block"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 min-w-[256px]">
              <NavItem icon={<ArrowLeftRight size={20} />} label="Movimentações" active={activeTab === 'movements'} onClick={() => { setActiveTab('movements'); setIsMobileMenuOpen(false); }} primaryColor={currentCompany?.primaryColor} />
              <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} primaryColor={currentCompany?.primaryColor} />
              <NavItem icon={<BarChart3 size={20} />} label="Relatórios" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }} primaryColor={currentCompany?.primaryColor} />
              <NavItem icon={<Package size={20} />} label="Produtos" active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} primaryColor={currentCompany?.primaryColor} />
              <NavItem icon={<Tag size={20} />} label="Categorias" active={activeTab === 'categories'} onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }} primaryColor={currentCompany?.primaryColor} />
              <NavItem icon={<Settings size={20} />} label="Configurações" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} primaryColor={currentCompany?.primaryColor} />
            </nav>

            <div className="p-4 border-t dark:border-slate-800 min-w-[256px]">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
                  {user?.name?.charAt(0) || '?'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors w-full rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/10"
              >
                <LogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white capitalize truncate">
              {activeTab === 'movements' ? 'Movimentações Financeiras' :
               activeTab === 'dashboard' ? 'Painel de Controle' :
               activeTab === 'reports' ? 'Relatórios Financeiros' :
               activeTab === 'products' ? 'Catálogo de Produtos' :
               activeTab === 'categories' ? 'Gestão de Categorias' : 'Configurações do Sistema'}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-yellow-400" />}
            </Button>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <div className="relative group">
              <Button
                size="sm"
                className="hover:opacity-90 shadow-md transition-all hidden sm:flex border-none text-white"
                style={{ backgroundColor: currentCompany?.primaryColor || '#3b82f6' }}
              >
                <Plus size={18} className="mr-1" /> Novo Registro
              </Button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button onClick={() => setActiveTab('movements')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 dark:text-white">
                  <TrendingUp size={16} className="text-emerald-500" /> Nova Entrada
                </button>
                <button onClick={() => setActiveTab('movements')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 dark:text-white border-t dark:border-slate-800">
                  <TrendingDown size={16} className="text-rose-500" /> Nova Saída
                </button>
                <button onClick={() => setActiveTab('products')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 dark:text-white border-t dark:border-slate-800">
                  <Package size={16} className="text-blue-500" /> Novo Produto
                </button>
                <button onClick={() => setActiveTab('categories')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 dark:text-white border-t dark:border-slate-800">
                  <Tag size={16} className="text-violet-500" /> Nova Categoria
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold dark:text-white">Resumo Financeiro</h2>
                  <p className="text-sm text-slate-500">Acompanhe a saúde financeira da sua empresa em tempo real.</p>
                </div>
                <PeriodSelector />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total de Entradas" value={formatCurrency(totalIncome)} icon={<TrendingUp className="text-emerald-500" />} trend="+12.5%" trendType="positive" />
                <StatsCard title="Total de Saídas" value={formatCurrency(totalExpenses)} icon={<TrendingDown className="text-rose-500" />} trend="-2.4%" trendType="negative" />
                <StatsCard title="Lucro Líquido" value={formatCurrency(netProfit)} icon={<DollarSign style={{ color: currentCompany?.primaryColor }} />} trend="+8.2%" trendType="positive" isHighlight primaryColor={currentCompany?.primaryColor} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader><CardTitle className="dark:text-white text-lg">Fluxo de Caixa Mensal</CardTitle></CardHeader>
                  <CardContent className="h-[350px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `R$ ${val}`} />
                        <Tooltip cursor={{ fill: theme === 'dark' ? '#0f172a' : '#f8fafc' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="income" fill={currentCompany?.primaryColor || '#10b981'} radius={[4, 4, 0, 0]} barSize={32} name="Entradas" />
                        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} name="Saídas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader><CardTitle className="dark:text-white text-lg">Resumo</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700">
                      <p className="text-sm text-slate-500 mb-1">Empresa</p>
                      <p className="font-bold dark:text-white">{currentCompany?.name}</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Metas do mês</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="dark:text-slate-400">Meta de Receita ({formatCurrency(revenueGoal)})</span>
                          <span className="font-semibold dark:text-white">{revenueProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full transition-all duration-500', revenueProgress >= 100 ? 'bg-emerald-500' : '')}
                            style={{ width: `${revenueProgress}%`, backgroundColor: revenueProgress < 100 ? currentCompany?.primaryColor : undefined }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'movements' && <MovementsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'categories' && <CategoriesView />}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Identidade da Empresa</CardTitle>
                  <CardDescription>Personalize como sua empresa aparece no sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden">
                        {currentCompany?.logo ? (
                          <img src={currentCompany.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="text-slate-400" size={32} />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 shadow-md bg-white dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600">
                        <Plus size={16} className="text-blue-600" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Logo da Empresa</Label>
                        <p className="text-xs text-slate-500 mb-2">Envie um arquivo de imagem (PNG, JPG) para usar como logo.</p>
                        <Button variant="outline" size="sm" className="w-full relative">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                          Selecionar Arquivo
                        </Button>
                        {currentCompany?.logo && (
                          <Button variant="ghost" size="sm" className="w-full mt-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => updateCompany(currentCompanyId!, { logo: undefined })}>
                            <Trash2 size={14} className="mr-2" /> Remover Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input value={currentCompany?.name || ''} onChange={(e) => updateCompany(currentCompanyId!, { name: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Meta de Receita Mensal (R$)</Label>
                    <div className="flex gap-4">
                      <Input type="number" value={currentCompany?.monthlyRevenueGoal || ''} onChange={(e) => updateCompany(currentCompanyId!, { monthlyRevenueGoal: Number(e.target.value) })} placeholder="Ex: 10000" className="flex-1" />
                      <Button variant="outline" onClick={() => updateCompany(currentCompanyId!, { monthlyRevenueGoal: 0 })}>Zerar Meta</Button>
                    </div>
                    <p className="text-xs text-slate-500">Esta meta será exibida no gráfico de progresso do painel principal.</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t dark:border-slate-800">
                    <Label className="flex items-center gap-2">
                      <Paintbrush size={16} className="text-blue-500" />
                      Cor da Marca
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#0ea5e9', '#6366f1', '#ec4899'].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateCompany(currentCompanyId!, { primaryColor: color })}
                          className={cn('w-10 h-10 rounded-full transition-all border-2', currentCompany?.primaryColor === color ? 'border-slate-900 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110')}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: currentCompany?.primaryColor }} />
                        <Input type="text" className="w-24 h-9 text-xs" value={currentCompany?.primaryColor || ''} onChange={(e) => updateCompany(currentCompanyId!, { primaryColor: e.target.value })} placeholder="#000000" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Esta cor será aplicada a botões, ícones e destaques do sistema.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Preferências do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                        <Paintbrush size={20} />
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">Tema do Sistema</p>
                        <p className="text-sm text-slate-500">Alternar entre modo claro e escuro</p>
                      </div>
                    </div>
                    <div className="flex p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                      <button onClick={() => setTheme('light')} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-all', theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}>Claro</button>
                      <button onClick={() => setTheme('dark')} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-all', theme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500')}>Escuro</button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-200 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
                <CardHeader>
                  <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle size={20} /> Zona de Perigo
                  </CardTitle>
                  <CardDescription className="text-rose-500/80">Ações irreversíveis que afetam todos os dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-100 dark:border-rose-900/20 bg-white dark:bg-slate-900">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Resetar Todo o Sistema</p>
                      <p className="text-xs text-slate-500">Apaga todos os lançamentos, categorias, produtos e configurações de empresa.</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema (lançamentos, categorias, produtos, etc) e não poderá ser desfeito. Deseja continuar?')) {
                          resetAllData();
                          setActiveTab('dashboard');
                          alert('Sistema resetado com sucesso.');
                        }
                      }}
                    >
                      Resetar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, primaryColor }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  primaryColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn('flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all font-medium text-sm', active ? 'shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800')}
      style={active ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
    >
      <div style={active ? { color: primaryColor } : {}}>{icon}</div>
      <span>{label}</span>
    </button>
  );
}

function StatsCard({ title, value, icon, trend, trendType, isHighlight = false, primaryColor }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative';
  isHighlight?: boolean;
  primaryColor?: string;
}) {
  return (
    <Card
      className={cn('shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1', isHighlight && 'border-opacity-50')}
      style={isHighlight ? { borderColor: primaryColor, backgroundColor: `${primaryColor}05` } : {}}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm flex items-center justify-center">
            {icon}
          </div>
          {trend && (
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', trendType === 'positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400')}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}