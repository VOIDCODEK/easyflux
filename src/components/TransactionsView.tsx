import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function TransactionsView({ type }: { type: 'income' | 'expense' }) {
  const { transactions, addTransaction, deleteTransaction, currentCompanyId, selectedMonth, selectedYear, companies } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const isClosed = currentCompany?.closedMonths?.includes(`${selectedMonth}-${selectedYear}`);
  
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  
  // Default date to the first of the selected month/year
  const defaultDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
  const [date, setDate] = useState(defaultDate);
  
  const categories = useStore(state => state.categories);
  const [category, setCategory] = useState(categories[0] || 'Geral');

  // Update date input when period changes
  useEffect(() => {
    const newDefaultDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
    setDate(newDefaultDate);
  }, [selectedMonth, selectedYear]);

  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === type && 
           t.companyId === currentCompanyId && 
           d.getMonth() === selectedMonth && 
           d.getFullYear() === selectedYear;
  });

  return (
    <div className="space-y-6">
      <Card className="dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="dark:text-white flex items-center gap-2">
            {type === 'income' ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />}
            Novo {type === 'income' ? 'Recebimento' : 'Pagamento'}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4",
          categories.length === 0 && "lg:grid-cols-4"
        )}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Descrição</label>
            <Input placeholder="Ex: Venda de Produto" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Valor (R$)</label>
            <Input type="number" placeholder="0,00" value={val} onChange={e => setVal(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          {categories.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Categoria</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <Button 
              onClick={() => { 
                if (!desc || !val) return;
                addTransaction({ 
                  companyId: currentCompanyId!, 
                  type, 
                  value: Number(val), 
                  description: desc, 
                  category: categories.length > 0 ? category : 'Sem Categoria', 
                  date: new Date(date).toISOString() 
                }); 
                setDesc(''); setVal(''); 
              }} 
              className={cn("w-full", type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700')}
            >
              <Plus size={18} className="mr-2" /> Registrar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dark:bg-slate-900 overflow-hidden">
        <div className="divide-y dark:divide-slate-800">
          {filtered.map(t => (
            <div key={t.id} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <p className="font-semibold dark:text-white">{t.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium uppercase">
                    {t.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={cn("font-bold", type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                  {type === 'income' ? '+' : '-'} {formatCurrency(t.value)}
                </p>
                <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-rose-500">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 italic">Nenhum registro encontrado.</div>
          )}
        </div>
      </Card>
    </div>
  );
}