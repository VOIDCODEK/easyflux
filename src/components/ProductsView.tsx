import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function ProductsView() {
  const { products, addProduct, deleteProduct, currentCompanyId, companies } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const companyProducts = products.filter(p => p.companyId === currentCompanyId);

  const handleAdd = () => {
    if (!name || !price || !currentCompanyId) return;
    addProduct({ 
      companyId: currentCompanyId, 
      name, 
      price: Number(price), 
      stock: 0 
    }); 
    setName(''); 
    setPrice('');
  };

  return (
    <div className="space-y-6">
      <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader><CardTitle className="dark:text-white">Adicionar Produto</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input placeholder="Nome do produto" value={name} onChange={e => setName(e.target.value)} />
          <Input type="number" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} />
          <Button 
            onClick={handleAdd}
            className="text-white"
            style={{ backgroundColor: currentCompany?.primaryColor || '#3b82f6' }}
          >
            <Plus size={18} className="mr-2" /> Adicionar
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyProducts.map(p => (
          <Card key={p.id} className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                <Package size={20} />
              </div>
              <div>
                <p className="font-semibold dark:text-white">{p.name}</p>
                <p className="text-sm text-slate-500">{formatCurrency(p.price)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="text-slate-400 hover:text-rose-500">
              <Trash2 size={18} />
            </Button>
          </Card>
        ))}
        {companyProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 italic border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            Nenhum produto cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}