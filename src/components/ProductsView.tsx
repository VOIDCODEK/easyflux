import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Package, Trash2, Plus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { addProduct as addProductDB, deleteProduct as deleteProductDB } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsView() {
  const { products, addProduct, deleteProduct, currentCompanyId, companies } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const companyProducts = products.filter(p => p.companyId === currentCompanyId);

  const handleAdd = async () => {
    if (!name || !price || !currentCompanyId) return;
    const saved = await addProductDB({
      company_id: currentCompanyId,
      name,
      price: Number(price),
      stock: 0
    });
    if (saved) {
      addProduct({ companyId: currentCompanyId, name, price: Number(price), stock: 0 });
    }
    setName(''); setPrice(''); setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-white mb-6">Novo Produto / Serviço</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Nome</label>
                  <Input placeholder="Ex: Lavagem Completa" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Preço (R$)</label>
                  <Input type="number" placeholder="0,00" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Descrição (opcional)</label>
                  <Input placeholder="Ex: Inclui aspiração e cera" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <Button
                  onClick={handleAdd}
                  className="w-full text-white mt-2"
                  style={{ backgroundColor: currentCompany?.primaryColor || '#3b82f6' }}
                >
                  <Plus size={18} className="mr-2" /> Adicionar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Produtos & Serviços</h2>
          <p className="text-sm text-slate-500">Cadastre os serviços do seu lava rápido</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="text-white"
          style={{ backgroundColor: currentCompany?.primaryColor || '#3b82f6' }}
        >
          <Plus size={18} className="mr-2" /> Novo Produto
        </Button>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyProducts.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                <Package size={22} />
              </div>
              <div>
                <p className="font-semibold dark:text-white">{p.name}</p>
                <p className="text-sm font-bold text-emerald-500">{formatCurrency(p.price)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={async () => {
              await deleteProductDB(p.id);
              deleteProduct(p.id);
            }} className="text-slate-400 hover:text-rose-500">
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
        {companyProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 italic border-2 border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum produto cadastrado.</p>
            <p className="text-xs mt-1">Clique em "Novo Produto" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}