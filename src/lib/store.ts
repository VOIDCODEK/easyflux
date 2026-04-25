import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  businessType: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  type: 'income' | 'expense';
  value: number;
  description: string;
  category: string;
  date: string;
}

interface AppState {
  companies: Company[];
  currentCompanyId: string | null;
  transactions: Transaction[];
  categories: string[];
  addCompany: (company: Company) => void;
  updateCompany: (id: string, updated: Partial<Company>) => void;
  setCurrentCompany: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      companies: [
        {
          id: '1',
          name: 'Minha Empresa Demo',
          primaryColor: '#3b82f6',
          businessType: 'Serviços',
        },
      ],
      currentCompanyId: '1',
      transactions: [
        {
          id: 't1',
          companyId: '1',
          type: 'income',
          value: 5000,
          description: 'Serviço de Consultoria',
          category: 'Serviço',
          date: new Date().toISOString(),
        },
        {
          id: 't2',
          companyId: '1',
          type: 'expense',
          value: 1200,
          description: 'Aluguel Escritório',
          category: 'Aluguel',
          date: new Date().toISOString(),
        },
        {
          id: 't3',
          companyId: '1',
          type: 'expense',
          value: 450,
          description: 'Internet e Luz',
          category: 'Manutenção',
          date: new Date().toISOString(),
        }
      ],
      categories: ['Serviço', 'Produto', 'Aluguel', 'Salários', 'Manutenção', 'Marketing', 'Outros'],
      addCompany: (company: Company) =>
        set((state) => ({ companies: [...state.companies, company] })),
      updateCompany: (id: string, updated: Partial<Company>) =>
        set((state) => ({
          companies: state.companies.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        })),
      setCurrentCompany: (id: string) => set({ currentCompanyId: id }),
      addTransaction: (transaction: Omit<Transaction, 'id'>) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Math.random().toString(36).substring(7) },
          ],
        })),
      deleteTransaction: (id: string) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      updateTransaction: (id: string, updated: Partial<Transaction>) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),
    }),
    {
      name: 'finance-saas-storage',
    }
  )
);
