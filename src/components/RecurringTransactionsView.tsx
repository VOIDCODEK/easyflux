import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Trash2, Plus, Calendar, TrendingDown, TrendingUp, Power } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RecurringTransactionsView() {
  const { 
    recurringTransactions, 
    addRecurringTransaction, 
    deleteRecurringTransaction, 
    updateRecurringTransaction,
    currentCompanyId, 
    companies,
    categories,
    processRecurringTransactions
  } = useStore();
  
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [day, setDay] = useState('1');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0] || 'Geral');

  const filtered = recurringTransactions.filter(t => t.companyId === currentCompanyId);

  const handleAdd = () => {
    if (!desc || !val || !currentCompanyId) return;
    
    addRecurringTransaction({
      companyId: currentCompanyId,
      type,
      value: Number(val),
      description: desc,
      category,
      dayOfMonth: Number(day),
      active: true
    });
    
    setDesc('');
    setVal('');
    setDay('1');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Custos Fixos e Recorrência</h2>
          <p className="text-slate-500">Configure saídas ou entradas que se repetem todos os meses.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={processRecurringTransactions}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} /> Processar Lançamentos do Mês
        </Button>
      </div>

      <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white flex items-center gap-2">
            <Plus size={20} className="text-blue-500" /> Nova Recorrência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Descrição</Label>
              <Input placeholder="Ex: Aluguel, Prolabore..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" placeholder="0,00" value={val} onChange={e => setVal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Dia de Vencimento</Label>
              <Input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                value={type}
                onChange={e => setType(e.target.value as 'income' | 'expense')}
              >
                <option value="expense">Saída Fixa</option>
                <option value="income">Entrada Fixa</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAdd}
                className="w-full text-white"
                style={{ backgroundColor: currentCompany?.primaryColor || '#3b82f6' }}
              >
                <Plus size={18} className="mr-1" /> Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(rt => (
          <Card key={rt.id} className={cn(
            "dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden",
            !rt.active && "opacity-60 grayscale"
          )}>
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    rt.type === 'income' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-100 text-rose-600 dark:bg-rose-900/20"
                  )}>
                    {rt.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold dark:text-white">{rt.description}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Todo dia {rt.dayOfMonth}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingDown size={14} /> {rt.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    rt.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {rt.type === 'income' ? '+' : '-'} {formatCurrency(rt.value)}
                  </p>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8", rt.active ? "text-emerald-500" : "text-slate-400")}
                      onClick={() => updateRecurringTransaction(rt.id, { active: !rt.active })}
                      title={rt.active ? "Pausar recorrência" : "Ativar recorrência"}
                    >
                      <Power size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-rose-500"
                      onClick={() => deleteRecurringTransaction(rt.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-[10px] text-slate-400 uppercase tracking-widest flex justify-between">
                <span>Status: {rt.active ? 'Ativo' : 'Pausado'}</span>
                <span>ID: {rt.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-slate-500 italic border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          Nenhuma recorrência configurada.<br />
          Adicione custos fixos como aluguel e salários para que o Easy Flux os lance automaticamente todo mês.
        </div>
      )}
    </div>
  );
}