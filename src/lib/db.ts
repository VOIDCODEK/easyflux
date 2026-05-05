import { supabase } from '@/integrations/supabase/client';

// COMPANIES
export const getCompany = async (userId: string) => {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
};

export const createCompany = async (userId: string, name: string) => {
  const { data } = await supabase
    .from('companies')
    .insert({ user_id: userId, name })
    .select()
    .single();
  return data;
};

export const updateCompany = async (id: string, updates: any) => {
  const { data } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return data;
};

// TRANSACTIONS
export const getTransactions = async (companyId: string) => {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('date', { ascending: false });
  return data ?? [];
};

export const addTransaction = async (transaction: any) => {
  const { data } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();
  return data;
};

export const deleteTransaction = async (id: string) => {
  await supabase.from('transactions').delete().eq('id', id);
};

// CATEGORIES
export const getCategories = async (companyId: string) => {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('company_id', companyId);
  return data ?? [];
};

export const addCategory = async (companyId: string, name: string) => {
  const { data } = await supabase
    .from('categories')
    .insert({ company_id: companyId, name })
    .select()
    .single();
  return data;
};

export const deleteCategory = async (id: string) => {
  await supabase.from('categories').delete().eq('id', id);
};

// PRODUCTS
export const getProducts = async (companyId: string) => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId);
  return data ?? [];
};

export const addProduct = async (product: any) => {
  const { data } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  return data;
};

export const deleteProduct = async (id: string) => {
  await supabase.from('products').delete().eq('id', id);
};

// RECURRING TRANSACTIONS
export const getRecurring = async (companyId: string) => {
  const { data } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('company_id', companyId);
  return data ?? [];
};

export const addRecurring = async (recurring: any) => {
  const { data } = await supabase
    .from('recurring_transactions')
    .insert(recurring)
    .select()
    .single();
  return data;
};

export const deleteRecurring = async (id: string) => {
  await supabase.from('recurring_transactions').delete().eq('id', id);
};

// SUBSCRIPTION
export const getSubscription = async (userId: string) => {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
};