import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  closedMonths?: string[];
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
  selectedMonth: number;
  selectedYear: number;
  loading: boolean;
  setUser: (user: User | null) => void;
  setCurrentCompanyId: (id: string | null) => void;
  loadAllData: () => Promise<void>;
  logout: () => Promise<void>;
  updateCompany: (id: string, updated: Partial<Company>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  updateRecurringTransaction: (id: string, updated: Partial<RecurringTransaction>) => Promise<void>;
  processRecurringTransactions: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  setSelectedPeriod: (month: number, year: number) => void;
  toggleMonthStatus: (month: number, year: number) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      theme: 'light',
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      companies: [],
      currentCompanyId: null,
      transactions: [],
      recurringTransactions: [],
      products: [],
      categories: [],
      loading: false,

      setUser: (user) => set({ user }),
      setCurrentCompanyId: (id) => set({ currentCompanyId: id }),

      loadAllData: async () => {
        set({ loading: true });
        try {
          // Load profile to get company_id
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) {
            set({ loading: false });
            return;
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('*, companies(*)')
            .eq('user_id', authUser.id)
            .maybeSingle();

          if (!profile || !profile.companies) {
            set({ loading: false });
            return;
          }

          const companyData = profile.companies as any;
          const company: Company = {
            id: companyData.id,
            name: companyData.name,
            logo: companyData.logo || undefined,
            primaryColor: companyData.primary_color,
            businessType: companyData.business_type,
            monthlyRevenueGoal: Number(companyData.monthly_revenue_goal) || 0,
            closedMonths: companyData.closed_months || [],
          };

          // Load all related data in parallel
          const [transactionsRes, recurringRes, productsRes, categoriesRes] = await Promise.all([
            supabase.from('transactions').select('*').eq('company_id', company.id).order('date', { ascending: false }),
            supabase.from('recurring_transactions').select('*').eq('company_id', company.id),
            supabase.from('products').select('*').eq('company_id', company.id),
            supabase.from('categories').select('*').eq('company_id', company.id),
          ]);

          set({
            user: {
              id: authUser.id,
              email: authUser.email || '',
              name: profile.full_name || authUser.email || '',
            },
            companies: [company],
            currentCompanyId: company.id,
            transactions: (transactionsRes.data || []).map((t: any) => ({
              id: t.id,
              companyId: t.company_id,
              type: t.type,
              value: Number(t.value),
              description: t.description,
              category: t.category,
              date: t.date,
            })),
            recurringTransactions: (recurringRes.data || []).map((r: any) => ({
              id: r.id,
              companyId: r.company_id,
              type: r.type,
              value: Number(r.value),
              description: r.description,
              category: r.category,
              dayOfMonth: r.day_of_month,
              active: r.active,
            })),
            products: (productsRes.data || []).map((p: any) => ({
              id: p.id,
              companyId: p.company_id,
              name: p.name,
              price: Number(p.price),
              stock: p.stock,
            })),
            categories: (categoriesRes.data || []).map((c: any) => c.name),
            loading: false,
          });
        } catch (err) {
          console.error('Failed to load data:', err);
          set({ loading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          companies: [],
          currentCompanyId: null,
          transactions: [],
          recurringTransactions: [],
          products: [],
          categories: [],
        });
      },

      setSelectedPeriod: (month, year) => set({ selectedMonth: month, selectedYear: year }),

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      updateCompany: async (id, updated) => {
        const dbUpdate: any = {};
        if (updated.name !== undefined) dbUpdate.name = updated.name;
        if (updated.logo !== undefined) dbUpdate.logo = updated.logo;
        if (updated.primaryColor !== undefined) dbUpdate.primary_color = updated.primaryColor;
        if (updated.businessType !== undefined) dbUpdate.business_type = updated.businessType;
        if (updated.monthlyRevenueGoal !== undefined) dbUpdate.monthly_revenue_goal = updated.monthlyRevenueGoal;
        if (updated.closedMonths !== undefined) dbUpdate.closed_months = updated.closedMonths;

        await supabase.from('companies').update(dbUpdate).eq('id', id);

        set((state) => ({
          companies: state.companies.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        }));
      },

      addTransaction: async (transaction) => {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            company_id: transaction.companyId,
            type: transaction.type,
            value: transaction.value,
            description: transaction.description,
            category: transaction.category,
            date: transaction.date,
          })
          .select()
          .single();

        if (error || !data) return;

        set((state) => ({
          transactions: [
            { ...transaction, id: data.id },
            ...state.transactions,
          ],
        }));
      },

      deleteTransaction: async (id) => {
        await supabase.from('transactions').delete().eq('id', id);
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      addRecurringTransaction: async (transaction) => {
        const { data, error } = await supabase
          .from('recurring_transactions')
          .insert({
            company_id: transaction.companyId,
            type: transaction.type,
            value: transaction.value,
            description: transaction.description,
            category: transaction.category,
            day_of_month: transaction.dayOfMonth,
            active: transaction.active,
          })
          .select()
          .single();

        if (error || !data) return;

        set((state) => ({
          recurringTransactions: [
            ...state.recurringTransactions,
            { ...transaction, id: data.id },
          ],
        }));
      },

      deleteRecurringTransaction: async (id) => {
        await supabase.from('recurring_transactions').delete().eq('id', id);
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((t) => t.id !== id),
        }));
      },

      updateRecurringTransaction: async (id, updated) => {
        const dbUpdate: any = {};
        if (updated.active !== undefined) dbUpdate.active = updated.active;
        if (updated.value !== undefined) dbUpdate.value = updated.value;
        if (updated.description !== undefined) dbUpdate.description = updated.description;
        if (updated.dayOfMonth !== undefined) dbUpdate.day_of_month = updated.dayOfMonth;

        await supabase.from('recurring_transactions').update(dbUpdate).eq('id', id);

        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((t) =>
            t.id === id ? { ...t, ...updated } : t
          ),
        }));
      },

      processRecurringTransactions: async () => {
        const state = get();
        const month = state.selectedMonth;
        const year = state.selectedYear;
        const companyId = state.currentCompanyId;
        if (!companyId) return;

        const newOnes: Transaction[] = [];

        for (const rt of state.recurringTransactions) {
          if (!rt.active) continue;

          const alreadyProcessed = state.transactions.some(
            (t) =>
              t.description.includes(rt.description) &&
              t.companyId === rt.companyId &&
              new Date(t.date).getMonth() === month &&
              new Date(t.date).getFullYear() === year
          );

          if (!alreadyProcessed) {
            const transDate = new Date(year, month, rt.dayOfMonth);
            const { data } = await supabase
              .from('transactions')
              .insert({
                company_id: companyId,
                type: rt.type,
                value: rt.value,
                description: `[FIXO] ${rt.description}`,
                category: rt.category,
                date: transDate.toISOString(),
              })
              .select()
              .single();

            if (data) {
              newOnes.push({
                id: data.id,
                companyId: data.company_id,
                type: data.type as 'income' | 'expense',
                value: Number(data.value),
                description: data.description,
                category: data.category,
                date: data.date,
              });
            }
          }
        }

        if (newOnes.length > 0) {
          set({ transactions: [...newOnes, ...state.transactions] });
        }
      },

      addProduct: async (product) => {
        const { data, error } = await supabase
          .from('products')
          .insert({
            company_id: product.companyId,
            name: product.name,
            price: product.price,
            stock: product.stock,
          })
          .select()
          .single();

        if (error || !data) return;

        set((state) => ({
          products: [...state.products, { ...product, id: data.id }],
        }));
      },

      deleteProduct: async (id) => {
        await supabase.from('products').delete().eq('id', id);
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      addCategory: async (name) => {
        const state = get();
        if (state.categories.includes(name) || !state.currentCompanyId) return;

        await supabase
          .from('categories')
          .insert({ company_id: state.currentCompanyId, name });

        set((state) => ({
          categories: [...state.categories, name],
        }));
      },

      deleteCategory: async (name) => {
        const state = get();
        if (!state.currentCompanyId) return;

        await supabase
          .from('categories')
          .delete()
          .eq('company_id', state.currentCompanyId)
          .eq('name', name);

        set((state) => ({
          categories: state.categories.filter((c) => c !== name),
        }));
      },

      toggleMonthStatus: async (month, year) => {
        const state = get();
        const company = state.companies.find((c) => c.id === state.currentCompanyId);
        if (!company) return;

        const periodKey = `${month}-${year}`;
        const closedMonths = company.closedMonths || [];
        const isClosed = closedMonths.includes(periodKey);

        const newClosedMonths = isClosed
          ? closedMonths.filter((m) => m !== periodKey)
          : [...closedMonths, periodKey];

        await get().updateCompany(company.id, { closedMonths: newClosedMonths });
      },

      resetAllData: async () => {
        const state = get();
        if (!state.currentCompanyId) return;

        await Promise.all([
          supabase.from('transactions').delete().eq('company_id', state.currentCompanyId),
          supabase.from('recurring_transactions').delete().eq('company_id', state.currentCompanyId),
          supabase.from('products').delete().eq('company_id', state.currentCompanyId),
        ]);

        set({
          transactions: [],
          recurringTransactions: [],
          products: [],
          selectedMonth: new Date().getMonth(),
          selectedYear: new Date().getFullYear(),
        });
      },
    }),
    {
      name: 'easyflux-ui-prefs',
      partialize: (state) => ({
        theme: state.theme,
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme && typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
        }
      },
    }
  )
);
