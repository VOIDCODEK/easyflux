import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  Filter,
  Download,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign
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
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Dashboard() {
  const { transactions, companies, currentCompanyId } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  
  const companyTransactions = transactions.filter(t => t.companyId === currentCompanyId);
  
  const totalIncome = companyTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.value, 0);
    
  const totalExpenses = companyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.value, 0);
    
  const netProfit = totalIncome - totalExpenses;

  // Mock data for charts if empty
  const chartData = useMemo(() => {
    if (companyTransactions.length === 0) {
      return [
        { name: 'Jan', income: 4000, expense: 2400 },
        { name: 'Fev', income: 3000, expense: 1398 },
        { name: 'Mar', income: 2000, expense: 9800 },
        { name: 'Abr', income: 2780, expense: 3908 },
        { name: 'Mai', income: 1890, expense: 4800 },
        { name: 'Jun', income: 2390, expense: 3800 },
      ];
    }
    // Simple grouping by month (simplified for demo)
    return [
      { name: 'Mês Atual', income: totalIncome, expense: totalExpenses }
    ];
  }, [companyTransactions, totalIncome, totalExpenses]);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            {currentCompany?.name.charAt(0) || 'F'}
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">SaaS Finance</h1>
            <p className="text-xs text-slate-500">{currentCompany?.name}</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<ArrowUpCircle size={20} />} label="Entradas" />
          <NavItem icon={<ArrowDownCircle size={20} />} label="Saídas" />
          <NavItem icon={<Building2 size={20} />} label="Empresas" />
          <NavItem icon={<Settings size={20} />} label="Configurações" />
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-red-600 transition-colors w-full">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900">Visão Geral</h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input placeholder="Buscar transação..." className="pl-10 w-64 bg-slate-100/50 border-transparent focus:bg-white" />
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus size={18} className="mr-1" /> Novo Registro
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Stats Cards */}
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
            {/* Main Chart */}
            <Card className="lg:col-span-2 shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
                  <p className="text-sm text-slate-500">Comparativo mensal de receitas e despesas</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Mensal</Button>
                  <Button variant="outline" size="sm">Anual</Button>
                </div>
              </CardHeader>
              <CardContent className="h-[350px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$ ${val}`} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} name="Entradas" />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} name="Saídas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">Ver tudo</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {companyTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Plus size={24} />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Nenhuma transação registrada</p>
                      <Button variant="link" size="sm" className="mt-2">Começar agora</Button>
                    </div>
                  ) : (
                    companyTransactions.slice(0, 5).map(t => (
                      <div key={t.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                          )}>
                            {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{t.description}</p>
                            <p className="text-xs text-slate-500">{t.category}</p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-sm font-bold",
                          t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.value)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href="#" 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm",
        active 
          ? "bg-blue-50 text-blue-600" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function StatsCard({ title, value, icon, trend, trendType, isHighlight = false }: any) {
  return (
    <Card className={cn("shadow-sm border-slate-200 overflow-hidden", isHighlight && "border-blue-200 bg-blue-50/30")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
            {icon}
          </div>
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full",
            trendType === 'positive' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}>
            {trend}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}
