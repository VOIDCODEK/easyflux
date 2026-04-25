import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, RefreshCw, Lock } from 'lucide-react';
import TransactionsView from './TransactionsView';
import RecurringTransactionsView from './RecurringTransactionsView';
import { PeriodSelector } from './PeriodSelector';

export default function MovementsView() {
  const { companies, currentCompanyId, selectedMonth, selectedYear } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const isClosed = currentCompany?.closedMonths?.includes(`${selectedMonth}-${selectedYear}`);
  const [activeSubTab, setActiveSubTab] = useState('income');

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold dark:text-white">Movimentações Financeiras</h2>
          <p className="text-sm text-slate-500">Gerencie todas as entradas, saídas e custos fixos da sua empresa.</p>
        </div>
        <div className="flex justify-start md:justify-end">
          <PeriodSelector />
        </div>
      </div>

      {isClosed && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Lock size={20} />
          </div>
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-400">Período Trancado</p>
            <p className="text-sm text-amber-700 dark:text-amber-500/80">Este mês foi concluído nos relatórios e novos lançamentos estão desabilitados.</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="income" className="w-full" onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-auto">
          <TabsTrigger 
            value="income" 
            className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            <TrendingUp size={18} className="text-emerald-500" />
            <span className="font-semibold">Entradas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expense" 
            className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            <TrendingDown size={18} className="text-rose-500" />
            <span className="font-semibold">Saídas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="recurring" 
            className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            <RefreshCw size={18} className="text-blue-500" />
            <span className="font-semibold">Recorrência</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-0 focus-visible:outline-none">
          <TransactionsView type="income" />
        </TabsContent>
        <TabsContent value="expense" className="mt-0 focus-visible:outline-none">
          <TransactionsView type="expense" />
        </TabsContent>
        <TabsContent value="recurring" className="mt-0 focus-visible:outline-none">
          <RecurringTransactionsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
