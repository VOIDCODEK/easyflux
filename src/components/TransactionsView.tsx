import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, TrendingUp, TrendingDown, X, BarChart3, Sun } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { addTransaction as addTransactionDB, deleteTransaction as deleteTransactionDB } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsView({ type }: { type: 'income' | 'expense' }) {
  const { transactions, addTransaction, deleteTransaction, currentCompanyId, selectedMonth, selectedYear, companies, products } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const isClosed = currentCompany?.closedMonths?.includes(`${selectedMonth}-${selectedYear}`);
  
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showDayClose, setShowDayClose] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const categories = useStore(state => state.categories);
  const [category, setCategory] = useState(categories[0] || 'Geral');

  const companyProducts = products.filter(p => p.companyId === currentCompanyId);

  useEffect(() => {
    setDate(today);
  }, [selectedMonth, selectedYear]);

  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === type &&
      t.companyId === currentCompanyId &&
      d.getMonth() === selectedMonth &&
      d.getFullYear() === selectedYear;
  });

  // Resumo do dia
  const todayTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return t.companyId === currentCompanyId &&
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  });
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.value, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.value, 0);
  const todayProfit = todayIncome - todayExpense;

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = companyProducts.find(p => p.id === productId);
    if (product) {
      setDesc(product.name);
      setVal(String(product.price));
    }
  };

  return (
    <div className="space-y-6">
      {/* Popup Fechar Dia */}
      <AnimatePresence>
        {showDayClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="text-emerald-400 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Resumo do Dia</h2>
              <p className="text-slate-400 text-sm mb-6">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-400 font-medium">Total Entradas</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(todayIncome)}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-rose-400 font-medium">Total Saídas</span>
                  <span className="text-rose-400 font-bold">{formatCurrency(todayExpense)}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-blue-400 font-bold">Lucro do Dia</span>
                  <span className="text-blue-400 font-bold">{formatCurrency(todayProfit)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300"
                  onClick={() => setShowDayClose(false)}
                >
                  <Sun size={16} className="mr-2" /> Novo Dia
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setShowDayClose(false);
                    // navegar para relatórios
                  }}
                >
                  <BarChart3 size={16} className="mr-2" /> Relatórios
                </Button>
              </div>

              <button onClick={() => setShowDayClose(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="dark:text-white flex items-center gap-2">
            {type === 'income' ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />}
            Novo {type === 'income' ? 'Recebimento' : 'Pagamento'}
          </CardTitle>
          {type === 'income' && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => setShowDayClose(true)}
            >
              <Sun size={16} className="mr-2" /> Fechar Dia
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'income' && companyProducts.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Selecionar Serviço/Produto</label>
              <div className="flex flex-wrap gap-2">
                {companyProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProductSelect(p.id)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                      selectedProduct === p.id
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "border-slate-700 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    {p.name} — {formatCurrency(p.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Descrição</label>
              <Input placeholder="Ex: Lavagem completa" value={desc} onChange={e => setDesc(e.target.value)} disabled={isClosed} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Valor (R$)</label>
              <Input type="number" placeholder="0,00" value={val} onChange={e => setVal(e.target.value)} disabled={isClosed} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Data</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">Categoria</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Button
            disabled={isClosed}
            onClick={async () => {
              if (!desc || !val) return;
              const newTransaction = {
                company_id: currentCompanyId!,
                type,
                value: Number(val),
                description: desc,
                category: categories.length > 0 ? category : 'Sem Categoria',
                date: new Date(date + 'T12:00:00').toISOString()
              };
              const saved = await addTransactionDB(newTransaction);
              if (saved) {
                addTransaction({
                  companyId: currentCompanyId!,
                  type,
                  value: Number(val),
                  description: desc,
                  category: categories.length > 0 ? category : 'Sem Categoria',
                  date: new Date(date + 'T12:00:00').toISOString()
                });
              }
              setDesc(''); setVal(''); setSelectedProduct('');
            }}
            className={cn("w-full", type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700')}
          >
            <Plus size={18} className="mr-2" /> {isClosed ? 'Mês Fechado' : 'Registrar'}
          </Button>
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
                <Button variant="ghost" size="icon" onClick={async () => {
                  if (isClosed) return;
                  await deleteTransactionDB(t.id);
                  deleteTransaction(t.id);
                }} className={cn("text-slate-400 hover:text-rose-500", isClosed && "opacity-50 cursor-not-allowed")}>
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