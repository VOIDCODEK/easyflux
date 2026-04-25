import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { PeriodSelector } from './PeriodSelector';
import { TrendingUp, TrendingDown, CheckCircle2, Lock, FileText, Download } from 'lucide-react';

export default function ReportsView() {
  const { 
    transactions, 
    companies, 
    currentCompanyId, 
    selectedMonth, 
    selectedYear,
    toggleMonthStatus,
    theme
  } = useStore();

  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const periodKey = `${selectedMonth}-${selectedYear}`;
  const isClosed = currentCompany?.closedMonths?.includes(periodKey);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return t.companyId === currentCompanyId && 
             d.getMonth() === selectedMonth && 
             d.getFullYear() === selectedYear;
    });
  }, [transactions, currentCompanyId, selectedMonth, selectedYear]);

  const incomeByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'income').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.value;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.value;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
  const netProfit = totalIncome - totalExpense;

  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#0ea5e9', '#ec4899'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <FileText className="text-blue-500" /> Relatórios e Fechamento
          </h2>
          <p className="text-sm text-slate-500">Analise o desempenho financeiro detalhado do período selecionado.</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector />
          <Button 
            onClick={() => toggleMonthStatus(selectedMonth, selectedYear)}
            variant={isClosed ? "outline" : "default"}
            className={cn(
              "flex items-center gap-2 font-bold transition-all",
              !isClosed && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            )}
          >
            {isClosed ? (
              <><Lock size={18} /> Mês Fechado</>
            ) : (
              <><CheckCircle2 size={18} /> Fechar Mês</>
            )}
          </Button>
        </div>
      </div>

      {isClosed && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-bold text-emerald-900 dark:text-emerald-400">Este mês está concluído!</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-500/80">As informações foram validadas e o período está trancado para novos lançamentos.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-slate-900 border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Total de Entradas</p>
            <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</h3>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Total de Saídas</p>
            <h3 className="text-2xl font-bold text-rose-600">{formatCurrency(totalExpense)}</h3>
          </CardContent>
        </Card>
        <Card className={cn(
          "dark:bg-slate-900 border-none shadow-sm",
          netProfit >= 0 ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-rose-50/50 dark:bg-rose-900/10"
        )}>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Resultado Líquido</p>
            <h3 className={cn("text-2xl font-bold", netProfit >= 0 ? "text-blue-600" : "text-rose-600")}>
              {formatCurrency(netProfit)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} /> Entradas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {incomeByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">Sem dados de entrada</div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="text-rose-500" size={20} /> Saídas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">Sem dados de saída</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Comparativo de Fluxo</CardTitle>
            <CardDescription>Entradas vs Saídas no período</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} /> Exportar PDF
          </Button>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Entradas', value: totalIncome, fill: '#10b981' },
              { name: 'Saídas', value: totalExpense, fill: '#f43f5e' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
