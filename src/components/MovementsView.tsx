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
