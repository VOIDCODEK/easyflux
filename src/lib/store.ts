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
  updateCompany: (id: string, company: Partial<Company>) => void;
  setCurrentCompany: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
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
      transactions: [],
      categories: ['Serviço', 'Produto', 'Aluguel', 'Salários', 'Manutenção', 'Marketing', 'Outros'],
      addCompany: (company) =>
        set((state) => ({ companies: [...state.companies, company] })),
      updateCompany: (id, updated) =>
        set((state) => ({
          companies: state.companies.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        })),
      setCurrentCompany: (id) => set({ currentCompanyId: id }),
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Math.random().toString(36).substring(7) },
          ],
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      updateTransaction: (id, updated) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),
    }),
    {
      name: 'finance-saas-storage',
    }
  )
);
