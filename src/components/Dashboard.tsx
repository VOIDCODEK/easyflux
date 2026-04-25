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
  Sun
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Input } from '@/components/ui/input';
import Login from './Login';

export default function Dashboard() {
  const { transactions, companies, currentCompanyId, user, logout, theme, setTheme } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  if (!user) return <Login />;
  
  const companyTransactions = transactions.filter(t => t.companyId === currentCompanyId);
  
  const totalIncome = companyTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.value, 0);
    
  const totalExpenses = companyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.value, 0);
    
  const netProfit = totalIncome - totalExpenses;

  const chartData = useMemo(() => [
    { name: 'Atual', income: totalIncome, expense: totalExpenses }
  ], [totalIncome, totalExpenses]);

  return (
    <div className={cn("flex min-h-screen bg-slate-50", theme === 'dark' && "dark bg-slate-950")}>
      <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            {currentCompany?.name.charAt(0) || 'F'}
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight">SaaS Finance</h1>
            <p className="text-xs text-slate-500">{currentCompany?.name}</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Package size={20} />} label="Produtos" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <NavItem icon={<ArrowUpCircle size={20} />} label="Entradas" active={activeTab === 'income'} onClick={() => setActiveTab('income')} />
          <NavItem icon={<ArrowDownCircle size={20} />} label="Saídas" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
          <NavItem icon={<Settings size={20} />} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t dark:border-slate-800">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors w-full">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto dark:bg-slate-950">
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus size={18} className="mr-1" /> Novo
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total de Entradas" value={formatCurrency(totalIncome)} icon={<TrendingUp className="text-emerald-500" />} />
                <StatsCard title="Total de Saídas" value={formatCurrency(totalExpenses)} icon={<TrendingDown className="text-rose-500" />} />
                <StatsCard title="Lucro Líquido" value={formatCurrency(netProfit)} icon={<DollarSign className="text-blue-500" />} isHighlight />
              </div>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader><CardTitle className="dark:text-white">Fluxo de Caixa</CardTitle></CardHeader>
                <CardContent className="h-[350px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="name" tick={{fill: '#94a3b8'}} />
                      <YAxis tick={{fill: '#94a3b8'}} />
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none'}} />
                      <Bar dataKey="income" fill="#10b981" barSize={32} />
                      <Bar dataKey="expense" fill="#f43f5e" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'settings' && (
            <Card className="dark:bg-slate-900">
              <CardHeader><CardTitle className="dark:text-white">Configurações</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-slate-300">Modo de visualização</label>
                  <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-full">
                    Alternar para {theme === 'light' ? 'Escuro' : 'Claro'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all font-medium text-sm", active ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800")}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatsCard({ title, value, icon, isHighlight = false }: any) {
  return (
    <Card className={cn("shadow-sm dark:bg-slate-900 dark:border-slate-800", isHighlight && "border-blue-200 bg-blue-50 dark:bg-blue-900/20")}>
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border flex items-center justify-center mb-4">{icon}</div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </CardContent>
    </Card>
  );
}
