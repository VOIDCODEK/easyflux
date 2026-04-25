import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tag, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function CategoriesView() {
  const { categories, addCategory, deleteCategory, currentCompanyId, companies } = useStore();
  const currentCompany = companies.find(c => c.id === currentCompanyId);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    
    if (categories.includes(newCategory.trim())) {
      setError('Esta categoria já existe.');
      return;
    }

    addCategory(newCategory.trim());
    setNewCategory('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Gerenciar Categorias</CardTitle>
          <CardDescription>
            Adicione categorias personalizadas para organizar suas receitas e despesas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Input 
                placeholder="Ex: Consultoria, Assinaturas, Manutenção..." 
                value={newCategory} 
                onChange={e => {
                  setNewCategory(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className={cn(error && "border-rose-500 focus-visible:ring-rose-500")}
              />
              {error && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
            </div>
            <Button 
              onClick={handleAdd}
              className="text-white"
              style={{ backgroundColor: currentCompany?.primaryColor || '#3b82f6' }}
            >
              <Plus size={18} className="mr-2" /> Adicionar Categoria
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Card key={cat} className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex justify-between items-center p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentCompany?.primaryColor || '#3b82f6'}15`, color: currentCompany?.primaryColor || '#3b82f6' }}
              >
                <Tag size={20} />
              </div>
              <div>
                <p className="font-semibold dark:text-white">{cat}</p>
                <p className="text-xs text-slate-500">Categoria Ativa</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => deleteCategory(cat)} 
              className="text-slate-400 hover:text-rose-500 transition-colors"
              title="Excluir Categoria"
            >
              <Trash2 size={18} />
            </Button>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="py-12 text-center text-slate-500 italic border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
          Nenhuma categoria cadastrada. Adicione uma acima para começar.
        </div>
      )}
    </div>
  );
}