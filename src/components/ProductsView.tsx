import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function ProductsView() {
  const { products, addProduct, deleteProduct } = useStore();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  return (
    <div className="space-y-6">
      <Card className="dark:bg-slate-900">
        <CardHeader><CardTitle className="dark:text-white">Adicionar Produto</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <Input placeholder="Nome do produto" value={name} onChange={e => setName(e.target.value)} />
          <Input type="number" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} />
          <Button onClick={() => { addProduct({ companyId: '1', name, price: Number(price), stock: 0 }); setName(''); setPrice(''); }}>
            <Plus size={18} className="mr-2" /> Adicionar
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <Card key={p.id} className="dark:bg-slate-900 flex justify-between items-center p-4">
            <div>
              <p className="font-semibold dark:text-white">{p.name}</p>
              <p className="text-sm text-slate-500">{formatCurrency(p.price)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="text-rose-500">
              <Trash2 size={18} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
