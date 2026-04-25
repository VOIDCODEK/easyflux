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
  Trash2
} from 'lucide-react';

import { useStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import Login from './Login';
import ProductsView from './ProductsView';
import TransactionsView from './TransactionsView';

export default function Dashboard() {
  const { 
    transactions, 
    companies, 
    currentCompanyId, 
    user, 
    logout, 
    theme, 
    setTheme,
    updateCompany 
  } = useStore();
  
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCompany(currentCompanyId!, { logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  
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
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Fev', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 3800 },
    { name: 'Abr', income: 2780, expense: 3908 },
    { name: 'Mai', income: totalIncome || 1890, expense: totalExpenses || 4800 },
  ], [totalIncome, totalExpenses]);

  return (
    <div className={cn("flex min-h-screen", theme === 'dark' ? "dark bg-slate-950" : "bg-slate-50")}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          {currentCompany?.logo ? (
            <img src={currentCompany.logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 dark:shadow-none">
              {currentCompany?.name.charAt(0) || 'F'}
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight truncate">SaaS Finance</h1>
            <p className="text-xs text-slate-500 truncate">{currentCompany?.name}</p>
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
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors w-full rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/10">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
            {activeTab === 'dashboard' ? 'Painel de Controle' : 
             activeTab === 'income' ? 'Gestão de Entradas' :
             activeTab === 'expenses' ? 'Gestão de Saídas' :
             activeTab === 'products' ? 'Catálogo de Produtos' : 'Configurações do Sistema'}
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-yellow-400" />}
            </Button>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-none hidden sm:flex">
              <Plus size={18} className="mr-1" /> Novo Registro
            </Button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                  title="Total de Entradas" 
                  value={formatCurrency(totalIncome)} 
                  icon={<TrendingUp className="text-emerald-500" />} 
                  trend="+12.5%"
                  trendType="positive"
                />
                <StatsCard 
                  title="Total de Saídas" 
                  value={formatCurrency(totalExpenses)} 
                  icon={<TrendingDown className="text-rose-500" />} 
                  trend="-2.4%"
                  trendType="negative"
                />
                <StatsCard 
                  title="Lucro Líquido" 
                  value={formatCurrency(netProfit)} 
                  icon={<DollarSign className="text-blue-500" />} 
                  trend="+8.2%"
                  trendType="positive"
                  isHighlight 
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader><CardTitle className="dark:text-white text-lg">Fluxo de Caixa Mensal</CardTitle></CardHeader>
                  <CardContent className="h-[350px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `R$ ${val}`} />
                        <Tooltip cursor={{fill: theme === 'dark' ? '#0f172a' : '#f8fafc'}} contentStyle={{backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} name="Entradas" />
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
                          <span className="dark:text-slate-400">Meta de Receita</span>
                          <span className="font-semibold dark:text-white">85%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[85%]"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'income' && <TransactionsView type="income" />}
          {activeTab === 'expenses' && <TransactionsView type="expense" />}

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
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*" 
                            onChange={handleLogoUpload} 
                          />
                          Selecionar Arquivo
                        </Button>
                        {currentCompany?.logo && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => updateCompany(currentCompanyId!, { logo: undefined })}
                          >
                            <Trash2 size={14} className="mr-2" /> Remover Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>


                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input 
                      value={currentCompany?.name || ''} 
                      onChange={e => updateCompany(currentCompanyId!, { name: e.target.value })}
                    />
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
                      <button 
                        onClick={() => setTheme('light')}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", theme === 'light' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                      >
                        Claro
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", theme === 'dark' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500")}
                      >
                        Escuro
                      </button>
                    </div>
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

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all font-medium text-sm", 
        active 
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatsCard({ title, value, icon, trend, trendType, isHighlight = false }: any) {
  return (
    <Card className={cn(
      "shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-all hover:shadow-md", 
      isHighlight && "border-blue-200 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-900/50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm flex items-center justify-center">
            {icon}
          </div>
          {trend && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              trendType === 'positive' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
            )}>
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
