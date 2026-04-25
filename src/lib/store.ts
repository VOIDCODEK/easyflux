import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  businessType: string;
  monthlyRevenueGoal?: number;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  price: number;
  stock: number;
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

export interface RecurringTransaction {
  id: string;
  companyId: string;
  type: 'income' | 'expense';
  value: number;
  description: string;
  category: string;
  dayOfMonth: number;
  active: boolean;
}

interface AppState {
  user: User | null;
  companies: Company[];
  currentCompanyId: string | null;
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  products: Product[];
  categories: string[];
  theme: 'light' | 'dark';
  login: (user: User) => void;
  logout: () => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, updated: Partial<Company>) => void;
  setCurrentCompany: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  deleteRecurringTransaction: (id: string) => void;
  updateRecurringTransaction: (id: string, updated: Partial<RecurringTransaction>) => void;
  processRecurringTransactions: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      theme: 'light',
      companies: [
        {
          id: '1',
          name: 'Minha Empresa Demo',
          primaryColor: '#3b82f6',
          businessType: 'Serviços',
          monthlyRevenueGoal: 10000,
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
      recurringTransactions: [],
      products: [],
      categories: ['Serviço', 'Produto', 'Aluguel', 'Salários', 'Manutenção', 'Marketing', 'Outros'],
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      addCompany: (company: Company) =>
        set((state) => ({ 
          companies: [...state.companies, company],
          currentCompanyId: company.id // Auto switch to new company
        })),
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
      addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) =>
        set((state) => ({
          recurringTransactions: [
            ...state.recurringTransactions,
            { ...transaction, id: Math.random().toString(36).substring(7) },
          ],
        })),
      deleteRecurringTransaction: (id: string) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((t) => t.id !== id),
        })),
      updateRecurringTransaction: (id: string, updated: Partial<RecurringTransaction>) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),
      processRecurringTransactions: () => {
        const state = get();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newTransactions: Transaction[] = [];

        state.recurringTransactions.forEach(rt => {
          if (!rt.active) return;

          // Check if transaction for this recurring item already exists in current month
          const alreadyProcessed = state.transactions.some(t => 
            t.description.includes(rt.description) && 
            t.companyId === rt.companyId &&
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear
          );

          if (!alreadyProcessed) {
            const transDate = new Date();
            transDate.setDate(rt.dayOfMonth);
            
            newTransactions.push({
              id: Math.random().toString(36).substring(7),
              companyId: rt.companyId,
              type: rt.type,
              value: rt.value,
              description: `[FIXO] ${rt.description}`,
              category: rt.category,
              date: transDate.toISOString()
            });
          }
        });

        if (newTransactions.length > 0) {
          set({ transactions: [...state.transactions, ...newTransactions] });
        }
      },
      addProduct: (product: Omit<Product, 'id'>) =>
        set((state) => ({
          products: [
            ...state.products,
            { ...product, id: Math.random().toString(36).substring(7) },
          ],
        })),
      updateProduct: (id: string, updated: Partial<Product>) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        })),
      deleteProduct: (id: string) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      addCategory: (category: string) =>
        set((state) => ({
          categories: state.categories.includes(category) 
            ? state.categories 
            : [...state.categories, category],
        })),
      deleteCategory: (category: string) =>
        set((state) => ({
          categories: state.categories.filter((c) => c !== category),
        })),
    }),
    {
      name: 'finance-saas-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    }
  )
);