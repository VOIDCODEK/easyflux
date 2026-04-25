import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function TransactionsView({ type }: { type: 'income' | 'expense' }) {
  const { transactions, addTransaction, deleteTransaction, currentCompanyId } = useStore();
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');

  const filtered = transactions.filter(t => t.type === type && t.companyId === currentCompanyId);

  return (
    <div className="space-y-6">
      <Card className="dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="dark:text-white flex items-center gap-2">
            {type === 'income' ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />}
            Novo {type === 'income' ? 'Recebimento' : 'Pagamento'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} />
          <Input type="number" placeholder="Valor" value={val} onChange={e => setVal(e.target.value)} />
          <Button onClick={() => { 
            addTransaction({ 
              companyId: currentCompanyId!, 
              type, 
              value: Number(val), 
              description: desc, 
              category: 'Geral', 
              date: new Date().toISOString() 
            }); 
            setDesc(''); setVal(''); 
          }} className={type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}>
            <Plus size={18} className="mr-2" /> Registrar
          </Button>
        </CardContent>
      </Card>
      
      <Card className="dark:bg-slate-900 overflow-hidden">
        <div className="divide-y dark:divide-slate-800">
          {filtered.map(t => (
            <div key={t.id} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <p className="font-semibold dark:text-white">{t.description}</p>
                <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
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

import { cn } from '@/lib/utils';
